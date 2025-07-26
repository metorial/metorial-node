# @metorial/openai-compatible

OpenAI-compatible provider base for Metorial. Provides common functionality for OpenAI-compatible API providers.

## Installation

```bash
npm install @metorial/openai-compatible
# or
yarn add @metorial/openai-compatible
# or
pnpm add @metorial/openai-compatible
# or
bun add @metorial/openai-compatible
```

## Features

- 🔧 **OpenAI Compatibility**: Base functionality for OpenAI-compatible APIs
- 🛠️ **Function Calling**: Standardized function calling interface
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🔄 **Format Conversion**: Converts Metorial tools to OpenAI function format
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

This package is typically used as a base for other provider packages and not directly by end users.

```typescript
import { /* OpenAI-compatible functions */ } from '@metorial/openai-compatible';

// Use as base for other providers
```

## Dependencies

- `@metorial/core`: Core Metorial functionality
- `@metorial/mcp-sdk-utils`: MCP SDK utilities
- `@metorial/mcp-session`: MCP session management
- `@metorial/sdk`: Main SDK

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
