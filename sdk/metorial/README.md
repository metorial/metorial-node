# metorial

The main TypeScript/JavaScript SDK for Metorial - AI-powered tool calling and session management.

## Installation

```bash
npm install metorial
# or
yarn add metorial
# or
pnpm add metorial
# or
bun add metorial
```

## Features

- 🔧 **Complete SDK**: Full-featured SDK for Metorial platform
- 🤖 **Multi-Provider Support**: Works with OpenAI, Anthropic, Google, and more
- 📡 **Session Management**: Automatic tool lifecycle handling
- 🛠️ **Tool Discovery**: Automatic tool detection and formatting
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Quick Start

```typescript
import { Metorial } from 'metorial';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Use with your preferred AI provider
await metorial.withProviderSession(
  // provider configuration
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    // Use session.tools with your AI provider
    console.log('Available tools:', session.tools);
  }
);
```

## Usage with AI Providers

### OpenAI
```bash
npm install @metorial/openai openai
```

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

const metorial = new Metorial({ apiKey: 'your-api-key' });
const openai = new OpenAI({ apiKey: 'your-openai-key' });

await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { serverDeployments: ['deployment-id'] },
  async session => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello!' }],
      tools: session.tools
    });
  }
);
```

### Anthropic
```bash
npm install @metorial/anthropic @anthropic-ai/sdk
```

```typescript
import { metorialAnthropic } from '@metorial/anthropic';
```

### AI SDK (Vercel)
```bash
npm install @metorial/ai-sdk ai
```

```typescript
import { metorialAISDK } from '@metorial/ai-sdk';
```

## Dependencies

- `@metorial/sdk`: Core SDK functionality

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
