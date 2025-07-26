# @metorial/xai

XAI (Grok) provider integration for Metorial - enables using Metorial tools with XAI's Grok models through function calling.

## Installation

```bash
npm install @metorial/xai
# or
yarn add @metorial/xai
# or
pnpm add @metorial/xai
# or
bun add @metorial/xai
```

## Features

- 🤖 **XAI Grok Integration**: Full support for XAI's Grok models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialXAI } from '@metorial/xai';

// Use XAI Grok integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires an OpenAI-compatible client for XAI API:

```json
{
  "peerDependencies": {
    "openai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
