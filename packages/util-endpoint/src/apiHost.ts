let defaultApiHost = 'https://api.metorial.com';
let base62Alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
let tokenPattern = /^metorial_[a-z]+_[A-Za-z0-9]{60}([A-Za-z0-9]+)v[12]$/;
let maxTokenLength = 8192;

export let apiHostFromToken = (token?: string): string | undefined => {
  if (!token || token.length > maxTokenLength) return undefined;

  let match = tokenPattern.exec(token);
  if (!match || match[0].length !== token.length) return undefined;

  let encoded = match[1];

  try {
    let value = BigInt(0);
    for (let character of encoded) {
      value = value * BigInt(62) + BigInt(base62Alphabet.indexOf(character));
    }

    let hex = value.toString(16);
    if (hex.length % 2) hex = '0' + hex;

    let bytes = Uint8Array.from(hex.match(/../g)!, byte => parseInt(byte, 16));
    let config: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (
      !Array.isArray(config) ||
      config.length !== 2 ||
      typeof config[0] !== 'string' ||
      typeof config[1] !== 'string' ||
      !config[1]
    ) {
      return undefined;
    }

    let host = config[0];
    if (!/^https?:\/\/[^/]/i.test(host) || /[\s\\?#]/.test(host)) return undefined;

    let url = new URL(host);
    if (!url.hostname || url.username || url.password) return undefined;

    return host;
  } catch {
    return undefined;
  }
};

export let resolveApiHost = (config: { apiHost?: string; apiKey?: string }): string =>
  config.apiHost ?? apiHostFromToken(config.apiKey) ?? defaultApiHost;
