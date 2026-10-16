import { createHash } from 'crypto';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WebSocketServer } from 'ws';
import { createSandboxAccessCache } from './access';
import { SandboxAccessError, SandboxCommandError } from './errors';
import { SandboxFiles } from './files';
import { SandboxPort } from './port';
import { SandboxShell } from './shell';
import { decodeFrame, encodeFrame } from './socket';

let textEncoder = new TextEncoder();

let fileSystem = new Map<string, Uint8Array>();
let validTokens = new Set(['good']);
let tokenRequests = 0;
let flakyDrops = 0;
let connections = 0;
let moveRequests = 0;

let server: Server;
let wss: WebSocketServer;
let baseUrl = '';
let wsUrl = '';

let handleFiles = (ws: any) => {
  let uploads = new Map<string, { path: string; chunks: Buffer[] }>();

  ws.on('message', (data: Buffer, isBinary: boolean) => {
    if (isBinary) {
      let frame = decodeFrame(new Uint8Array(data))!;
      uploads.get(frame.id)?.chunks.push(Buffer.from(frame.payload));
      return;
    }

    let message = JSON.parse(data.toString());
    let reply = (fields: object) => ws.send(JSON.stringify({ id: message.id, ...fields }));

    if (message.type == 'end') {
      let upload = uploads.get(message.id);
      if (!upload) return;

      let content = Buffer.concat(upload.chunks);
      let checksum = createHash('sha256').update(content).digest('hex');

      if (message.sha256 && message.sha256 != checksum) {
        return reply({ type: 'error', error: { code: 'checksum_mismatch', message: 'bad' } });
      }

      fileSystem.set(upload.path, new Uint8Array(content));
      return reply({ type: 'result', size: content.length });
    }

    switch (message.op) {
      case 'write':
        if (!message.overwrite && fileSystem.has(message.path)) {
          return reply({
            type: 'error',
            error: { code: 'already_exists', message: 'exists', path: message.path }
          });
        }
        uploads.set(message.id, { path: message.path, chunks: [] });
        return;

      case 'read': {
        let content = fileSystem.get(message.path);
        if (!content) {
          return reply({
            type: 'error',
            error: { code: 'not_found', message: 'missing', path: message.path }
          });
        }
        reply({ type: 'start', size: content.length, mtime: 0, offset: 0 });
        for (let offset = 0; offset < content.length; offset += 5) {
          ws.send(encodeFrame(message.id, content.subarray(offset, offset + 5)));
        }
        return reply({ type: 'result' });
      }

      case 'stat': {
        let content = fileSystem.get(message.path);
        if (!content) {
          return reply({ type: 'error', error: { code: 'not_found', message: 'missing' } });
        }
        return reply({
          type: 'result',
          entry: {
            path: message.path,
            type: 'file',
            size: content.length,
            mode: 420,
            mtime: 1000
          }
        });
      }

      case 'list': {
        if (message.path == '/flaky' && flakyDrops > 0) {
          flakyDrops--;
          reply({ type: 'entries', entries: [{ name: 'partial', type: 'file', size: 0 }] });
          return ws.terminate();
        }

        let entries = [...fileSystem.entries()]
          .filter(([path]) => path.startsWith(`${message.path}/`))
          .map(([path, content]) => ({
            name: path.slice(message.path.length + 1),
            type: 'file',
            size: content.length,
            mode: 420,
            mtime: 1000
          }));

        reply({ type: 'entries', entries: entries.slice(0, 1) });
        reply({ type: 'entries', entries: entries.slice(1) });
        return reply({ type: 'result', count: entries.length, truncated: false });
      }

      case 'move':
        moveRequests++;
        return ws.terminate();

      case 'delete':
        fileSystem.delete(message.path);
        return reply({ type: 'result' });
    }
  });
};

let handleExec = (ws: any) => {
  let running = new Map<string, { stdin: Buffer[] }>();

  let output = (id: string, stream: number, text: string) =>
    ws.send(encodeFrame(id, textEncoder.encode(text), stream));

  ws.on('message', (data: Buffer, isBinary: boolean) => {
    if (isBinary) {
      let frame = decodeFrame(new Uint8Array(data))!;
      running.get(frame.id)?.stdin.push(Buffer.from(frame.payload));
      return;
    }

    let message = JSON.parse(data.toString());
    let send = (fields: object) => ws.send(JSON.stringify({ id: message.id, ...fields }));

    if (message.type == 'stdin_eof') {
      let command = running.get(message.id)!;
      output(message.id, 1, Buffer.concat(command.stdin).toString().toUpperCase());
      running.delete(message.id);
      return send({ type: 'exit', code: 0, signal: null, timedOut: false });
    }

    if (message.type == 'signal') {
      running.delete(message.id);
      return send({ type: 'exit', code: null, signal: message.signal, timedOut: false });
    }

    if (message.op != 'run') return;

    let [program, ...args] = message.command;
    send({ type: 'started', pid: 42 });

    if (program == 'missing') {
      return send({ type: 'error', error: { code: 'spawn_failed', message: 'not found' } });
    }

    if (message.stdin || program == 'sleep') {
      running.set(message.id, { stdin: [] });
      return;
    }

    if (program == 'drop') return ws.terminate();

    output(message.id, 1, `ran ${args.join(' ')}`);
    output(message.id, 2, `cwd=${message.cwd ?? ''}`);
    send({ type: 'exit', code: 3, signal: null, timedOut: false });
  });
};

beforeAll(async () => {
  server = createServer((req, res) => {
    if (!validTokens.has(String(req.headers['metorial-sandbox-token']))) {
      res.writeHead(401).end('token_invalid');
      return;
    }

    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' }).end(
        JSON.stringify({
          method: req.method,
          url: req.url,
          body,
          test: req.headers['x-test']
        })
      );
    });
  });

  wss = new WebSocketServer({
    server,
    handleProtocols: protocols =>
      protocols.has('metorial-sandbox-v1') ? 'metorial-sandbox-v1' : false,
    verifyClient: ({ req }, done) => {
      let protocols = String(req.headers['sec-websocket-protocol'] ?? '').split(/,\s*/);
      let token = protocols.find(p => p.startsWith('metorial-sandbox-token.'))?.slice(23);

      if (!token || !validTokens.has(token)) return done(false, 401, 'token_invalid');
      done(true);
    }
  });

  wss.on('connection', (ws, req) => {
    connections++;
    if (req.url == '/files') handleFiles(ws);
    else handleExec(ws);
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  let { port } = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${port}`;
  wsUrl = `ws://127.0.0.1:${port}`;
});

afterAll(async () => {
  for (let client of wss.clients) client.terminate();
  wss.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

let createAccess = (path: string, tokens: string[] = ['good']) => {
  let queue = [...tokens];

  return createSandboxAccessCache(async () => {
    tokenRequests++;
    let token = queue.length > 1 ? queue.shift()! : queue[0]!;
    return {
      url: path.startsWith('/port') ? `${baseUrl}/app` : `${wsUrl}${path}`,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    };
  });
};

describe('SandboxFiles', () => {
  it('writes, reads, stats, lists and deletes files', async () => {
    let files = await SandboxFiles.connect(createAccess('/files'));

    let big = 'x'.repeat(200 * 1024);
    await files.write('/work/a.txt', 'hello world');
    await files.write('/work/b.txt', big);

    expect(await files.readText('/work/a.txt')).toBe('hello world');
    expect((await files.read('/work/b.txt')).length).toBe(big.length);

    let entry = await files.stat('/work/a.txt');
    expect(entry).toMatchObject({
      name: 'a.txt',
      path: '/work/a.txt',
      type: 'file',
      size: 11
    });
    expect(entry.modifiedAt.getTime()).toBe(1000);

    let list = await files.list('/work');
    expect(list.truncated).toBe(false);
    expect(list.entries.map(e => e.path).sort()).toEqual(['/work/a.txt', '/work/b.txt']);

    await files.delete('/work/a.txt');
    expect(await files.exists('/work/a.txt')).toBe(false);

    files.close();
  });

  it('surfaces server errors with codes', async () => {
    let files = await SandboxFiles.connect(createAccess('/files'));

    let error = await files.readText('/nope').catch(e => e);
    expect(error).toBeInstanceOf(SandboxAccessError);
    expect(error).toMatchObject({ code: 'not_found', path: '/nope' });

    await files.write('/exists', 'a');
    await expect(files.write('/exists', 'b', { overwrite: false })).rejects.toMatchObject({
      code: 'already_exists'
    });

    files.close();
  });

  it('refreshes a rejected token while connecting', async () => {
    let before = tokenRequests;
    let files = await SandboxFiles.connect(createAccess('/files', ['stale', 'good']));

    expect(tokenRequests - before).toBe(2);
    await files.write('/refresh', 'ok');
    expect(await files.readText('/refresh')).toBe('ok');

    files.close();
  });

  it('resends a pending list after the socket drops', async () => {
    let files = await SandboxFiles.connect(createAccess('/files'));
    await files.write('/flaky/one', '1');

    flakyDrops = 2;
    let list = await files.list('/flaky');

    expect(flakyDrops).toBe(0);
    expect(list.entries.map(e => e.path)).toEqual(['/flaky/one']);

    files.close();
  });

  it('does not resend a move after the socket drops', async () => {
    let files = await SandboxFiles.connect(createAccess('/files'));
    moveRequests = 0;

    await expect(files.move('/a', '/b')).rejects.toMatchObject({ code: 'disconnected' });
    expect(moveRequests).toBe(1);

    files.close();
  });

  it('reconnects an interrupted socket in the background', async () => {
    let shell = await SandboxShell.connect(createAccess('/exec'));
    let before = connections;

    await expect(shell.command(['drop'])).rejects.toMatchObject({
      code: 'connection_interrupted'
    });

    await new Promise(resolve => setTimeout(resolve, 600));
    expect(connections - before).toBe(1);

    shell.close();
  });

  it('rejects calls after close', async () => {
    let files = await SandboxFiles.connect(createAccess('/files'));
    files.close();

    await expect(files.stat('/x')).rejects.toMatchObject({ code: 'closed' });
  });
});

describe('SandboxShell', () => {
  it('runs commands and buffers output', async () => {
    let shell = await SandboxShell.connect(createAccess('/exec'));

    let result = await shell.command(['echo', 'hi', 'there'], { cwd: '/tmp' });
    expect(result).toMatchObject({
      exitCode: 3,
      signal: null,
      timedOut: false,
      stdout: 'ran hi there',
      stderr: 'cwd=/tmp'
    });

    let viaShell = await shell.command('ls -la');
    expect(viaShell.stdout).toBe('ran -c ls -la');

    shell.close();
  });

  it('streams stdin into a command', async () => {
    let shell = await SandboxShell.connect(createAccess('/exec'));

    let result = await shell.command(['cat'], { stdin: 'shout' });
    expect(result.stdout).toBe('SHOUT');

    shell.close();
  });

  it('supports spawned processes with signals', async () => {
    let shell = await SandboxShell.connect(createAccess('/exec'));

    let proc = await shell.spawn(['sleep', '100']);
    expect(await proc.started()).toBe(42);

    proc.signal('SIGTERM');
    expect(await proc.wait()).toEqual({ exitCode: null, signal: 'TERM', timedOut: false });

    shell.close();
  });

  it('reports spawn errors and interrupted connections', async () => {
    let shell = await SandboxShell.connect(createAccess('/exec'));

    let error = await shell.command(['missing']).catch(e => e);
    expect(error).toBeInstanceOf(SandboxCommandError);
    expect(error.code).toBe('spawn_failed');

    await expect(shell.command(['drop'])).rejects.toMatchObject({
      code: 'connection_interrupted'
    });

    let result = await shell.command(['echo', 'again']);
    expect(result.stdout).toBe('ran again');

    shell.close();
  });
});

describe('SandboxPort', () => {
  it('sends requests with the access token', async () => {
    let port = await SandboxPort.connect(3000, createAccess('/port'));

    let response = await port.get('/testing?x=1', { headers: { 'x-test': 'yes' } });
    expect(await response.json()).toEqual({
      method: 'GET',
      url: '/app/testing?x=1',
      body: '',
      test: 'yes'
    });

    let posted = await port.post('/items', { name: 'a' });
    expect(await posted.json()).toMatchObject({ method: 'POST', body: '{"name":"a"}' });
    expect(port.url).toBe(`${baseUrl}/app`);
  });

  it('retries once with a fresh token on 401', async () => {
    let port = await SandboxPort.connect(3000, createAccess('/port', ['stale', 'good']));

    let response = await port.get('/');
    expect(response.status).toBe(200);
  });

  it('rejects requests to other origins and after close', async () => {
    let port = await SandboxPort.connect(3000, createAccess('/port'));

    await expect(port.get('https://example.com/')).rejects.toThrow(TypeError);

    port.close();
    await expect(port.get('/')).rejects.toMatchObject({ code: 'closed' });
  });
});
