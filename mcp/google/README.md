# @metorial/google

Google (Gemini) provider integration for Metorial - enables using Metorial tools with Google's Gemini models through function calling.

## Installation

```bash
npm install @metorial/google
# or
yarn add @metorial/google
# or
pnpm add @metorial/google
# or
bun add @metorial/google
```

## Features

- 🤖 **Google Gemini Integration**: Full support for Gemini models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialGoogle } from '@metorial/google';

// Use Google Gemini integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires the Google Generative AI SDK:

```json
{
  "peerDependencies": {
    "@google/generative-ai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
