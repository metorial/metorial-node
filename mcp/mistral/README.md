# @metorial/mistral

Mistral AI provider integration for Metorial - enables using Metorial tools with Mistral's language models through function calling.

## Installation

```bash
npm install @metorial/mistral
# or
yarn add @metorial/mistral
# or
pnpm add @metorial/mistral
# or
bun add @metorial/mistral
```

## Features

- 🤖 **Mistral Integration**: Full support for Mistral AI models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialMistral } from '@metorial/mistral';

// Use Mistral integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires the Mistral AI SDK:

```json
{
  "peerDependencies": {
    "@mistralai/mistralai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
