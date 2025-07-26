# @metorial/deepseek

DeepSeek provider integration for Metorial - enables using Metorial tools with DeepSeek's language models through function calling.

## Installation

```bash
npm install @metorial/deepseek
# or
yarn add @metorial/deepseek
# or
pnpm add @metorial/deepseek
# or
bun add @metorial/deepseek
```

## Features

- 🤖 **DeepSeek Integration**: Full support for DeepSeek models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialDeepSeek } from '@metorial/deepseek';

// Use DeepSeek integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires an OpenAI-compatible client for DeepSeek API:

```json
{
  "peerDependencies": {
    "openai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
