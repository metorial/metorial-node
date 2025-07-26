# @metorial/ai-sdk

AI SDK integration for Metorial - provides compatibility with Vercel's AI SDK for streamlined tool usage.

## Installation

```bash
npm install @metorial/ai-sdk
# or
yarn add @metorial/ai-sdk
# or
pnpm add @metorial/ai-sdk
# or
bun add @metorial/ai-sdk
```

## Features

- 🔧 **AI SDK Integration**: Full compatibility with Vercel's AI SDK
- 🛠️ **Tool Conversion**: Automatic conversion to AI SDK tool format
- 📡 **Session Management**: Automatic tool lifecycle handling
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { metorialAISDK } from '@metorial/ai-sdk';

// Use AI SDK integration
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/sdk`: Main SDK

## Peer Dependencies

This package requires the AI SDK:

```json
{
  "peerDependencies": {
    "ai": "*"
  }
}
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
