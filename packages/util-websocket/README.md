# @metorial/util-websocket

WebSocket utilities for Metorial. Provides an isomorphic WebSocket implementation with automatic reconnection, event handling, and cross-platform compatibility.

## Installation

```bash
npm install @metorial/util-websocket
# or
yarn add @metorial/util-websocket
# or
pnpm add @metorial/util-websocket
# or
bun add @metorial/util-websocket
```

## Usage

### Basic WebSocket Connection

```typescript
import { IsomorphicWs } from '@metorial/util-websocket';

// Create a WebSocket connection
let ws = new IsomorphicWs('wss://api.example.com/ws');

// Listen for connection events
let unsubscribeOpen = ws.on('open', () => {
  console.log('WebSocket connected!');
});

let unsubscribeClose = ws.on('close', () => {
  console.log('WebSocket disconnected');
});

let unsubscribeMessage = ws.on('message', data => {
  console.log('Received message:', data);
});

// Send a message
await ws.send(JSON.stringify({ type: 'ping', data: 'hello' }));

// Clean up listeners
unsubscribeOpen();
unsubscribeClose();
unsubscribeMessage();

// Close the connection
ws.close();
```

### Real-time Chat Example

```typescript
import { IsomorphicWs } from '@metorial/util-websocket';

class ChatClient {
  private ws: IsomorphicWs;
  private messageHandlers: ((message: any) => void)[] = [];

  constructor(url: string) {
    this.ws = new IsomorphicWs(url);

    this.ws.on('open', () => {
      console.log('Connected to chat server');
    });

    this.ws.on('message', data => {
      let message = JSON.parse(data);
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.ws.on('close', () => {
      console.log('Disconnected from chat server');
    });
  }

  onMessage(handler: (message: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      let index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  async sendMessage(text: string) {
    await this.ws.send(
      JSON.stringify({
        type: 'message',
        text,
        timestamp: Date.now()
      })
    );
  }

  disconnect() {
    this.ws.close();
  }
}

// Usage
let chat = new ChatClient('wss://chat.example.com');

let unsubscribe = chat.onMessage(message => {
  if (message.type === 'message') {
    console.log(`${message.user}: ${message.text}`);
  }
});

await chat.sendMessage('Hello, world!');
```

### Live Data Streaming

```typescript
import { IsomorphicWs } from '@metorial/util-websocket';

class LiveDataStream {
  private ws: IsomorphicWs;
  private subscribers = new Map<string, (data: any) => void>();

  constructor(url: string) {
    this.ws = new IsomorphicWs(url);

    this.ws.on('message', data => {
      let message = JSON.parse(data);
      this.handleMessage(message);
    });
  }

  private handleMessage(message: any) {
    if (message.type === 'data' && message.channel) {
      let handler = this.subscribers.get(message.channel);
      if (handler) {
        handler(message.data);
      }
    }
  }

  subscribe(channel: string, callback: (data: any) => void) {
    this.subscribers.set(channel, callback);

    // Subscribe to the channel
    this.ws.send(
      JSON.stringify({
        type: 'subscribe',
        channel
      })
    );

    return () => {
      this.subscribers.delete(channel);
      this.ws.send(
        JSON.stringify({
          type: 'unsubscribe',
          channel
        })
      );
    };
  }
}

// Usage
let stream = new LiveDataStream('wss://data.example.com/live');

let unsubscribe = stream.subscribe('stock-prices', data => {
  console.log('Stock price update:', data);
});
```

## API Reference

### `IsomorphicWs`

#### Constructor

```typescript
new IsomorphicWs(url: string)
```

Creates a new WebSocket connection with automatic reconnection.

#### Methods

- `send(data: string, timeout?: number): Promise<void>` - Send a message with optional timeout
- `close(): void` - Close the connection
- `on(event: 'open' | 'close' | 'message', callback: (data: any) => void): () => void` - Subscribe to events

#### Events

- `open` - Fired when the connection is established
- `close` - Fired when the connection is closed
- `message` - Fired when a message is received

#### Reconnection Behavior

- Automatically attempts to reconnect on connection loss
- Uses exponential backoff strategy (1s, 2s, 4s, 8s, 16s)
- Maximum of 5 reconnection attempts
- Respects manual closure (won't reconnect if `close()` was called)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
