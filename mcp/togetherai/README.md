# @metorial/togetherai

Together AI provider integration for Metorial - enables using Metorial tools with Together AI's language models through function calling.

## Installation

```bash
npm install @metorial/togetherai
# or
yarn add @metorial/togetherai
# or
pnpm add @metorial/togetherai
# or
bun add @metorial/togetherai
```

## Features

- 🤖 **Together AI Integration**: Full support for Together AI models
- 🛠️ **Function Calling**: Native function calling support
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **OpenAI Compatibility**: Based on OpenAI-compatible interface
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialTogetherAI } from '@metorial/togetherai';

// Use Together AI integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/openai-compatible`: OpenAI-compatible base functionality
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires an OpenAI-compatible client for Together AI:

```json
{
  "peerDependencies": {
    "openai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
