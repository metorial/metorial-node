# Metorial Node.js SDK

The official Node.js/TypeScript SDK for [Metorial](https://metorial.com) - AI-powered tool calling and session management.

## Features

🔧 **Multi-Provider Support**: Use the same tools across different AI providers

- ✅ OpenAI (GPT-4, GPT-3.5)
- ✅ Anthropic (Claude)
- ✅ Google (Gemini)
- ✅ Mistral AI
- ✅ DeepSeek
- ✅ Together AI
- ✅ XAI (Grok)
- ✅ AI SDK frameworks

🚀 **Easy Integration**: Simple async/await interface

📡 **Session Management**: Automatic session lifecycle handling

🛠️ **Tool Discovery**: Automatic tool detection and formatting

🔄 **Format Conversion**: Provider-specific tool format conversion

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

## Quick Start

### OpenAI Example

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

const main = async () => {
  // Initialize clients
  const metorial = new Metorial({
    apiKey: 'your-metorial-api-key'
  });

  const openai = new OpenAI({ apiKey: 'your-openai-api-key' });

  // Use Metorial tools with OpenAI
  await metorial.withProviderSession(
    metorialOpenAI.chatCompletions,
    { serverDeployments: ['your-server-deployment-id'] },
    async session => {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'user', content: 'What are the latest commits?' }
      ];

      for (let i = 0; i < 10; i++) {
        // Call OpenAI with Metorial tools
        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          tools: session.tools
        });

        const choice = response.choices[0]!;
        const toolCalls = choice.message.tool_calls;

        if (!toolCalls) {
          console.log(choice.message.content);
          return;
        }

        // Execute tools through Metorial
        const toolResponses = await session.callTools(toolCalls);

        // Add to conversation
        messages.push(
          {
            role: 'assistant',
            tool_calls: choice.message.tool_calls
          },
          ...toolResponses
        );
      }
    }
  );
};

main();
```

## Provider Examples

### Anthropic (Claude)

```typescript
import { Metorial } from 'metorial';
import { metorialAnthropic } from '@metorial/anthropic';
import Anthropic from '@anthropic-ai/sdk';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

const anthropic = new Anthropic({
  apiKey: 'your-anthropic-api-key'
});

await metorial.withProviderSession(
  metorialAnthropic,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    const messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: 'Help me with this GitHub task: ...' }
    ];

    // Dedupe tools by name
    const uniqueTools = Array.from(new Map(session.tools.map(t => [t.name, t])).values());

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages,
      tools: uniqueTools
    });

    // Handle tool calls
    const toolCalls = response.content.filter(
      (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
    );

    if (toolCalls.length > 0) {
      const toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
    }
  }
);
```

### Google (Gemini)

```typescript
import { Metorial } from 'metorial';
import { metorialGoogle } from '@metorial/google';
import { GoogleGenerativeAI } from '@google/generative-ai';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

const genAI = new GoogleGenerativeAI('your-google-api-key');

await metorial.withProviderSession(
  metorialGoogle,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: session.tools
    });

    const response = await model.generateContent('What can you help me with?');

    // Handle function calls if present
    // ... tool call handling logic
  }
);
```

### OpenAI-Compatible (DeepSeek, TogetherAI, XAI)

```typescript
import { Metorial } from 'metorial';
import { metorialDeepSeek } from '@metorial/deepseek';
import OpenAI from 'openai';

// Works with any OpenAI-compatible API
const deepseekClient = new OpenAI({
  apiKey: 'your-deepseek-key',
  baseURL: 'https://api.deepseek.com'
});

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

await metorial.withProviderSession(
  metorialDeepSeek.chatCompletions,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    const response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Help me code' }],
      tools: session.tools
    });
    // ... handle response
  }
);
```

## Available Providers

| Provider   | Import                 | Format                       | Description                   |
| ---------- | ---------------------- | ---------------------------- | ----------------------------- |
| OpenAI     | `@metorial/openai`     | OpenAI function calling      | GPT-4, GPT-3.5, etc.          |
| Anthropic  | `@metorial/anthropic`  | Claude tool format           | Claude 3.5, Claude 3, etc.    |
| Google     | `@metorial/google`     | Gemini function declarations | Gemini Pro, Gemini Flash      |
| Mistral    | `@metorial/mistral`    | Mistral function calling     | Mistral Large, Codestral      |
| DeepSeek   | `@metorial/deepseek`   | OpenAI-compatible            | DeepSeek Chat, DeepSeek Coder |
| TogetherAI | `@metorial/togetherai` | OpenAI-compatible            | Llama, Mixtral, etc.          |
| XAI        | `@metorial/xai`        | OpenAI-compatible            | Grok models                   |
| AI SDK     | `@metorial/ai-sdk`     | Framework tools              | Vercel AI SDK, etc.           |

## Core API

### Metorial Class

```typescript
import { Metorial } from 'metorial';

const metorial = new Metorial({
  apiKey: 'your-api-key'
});
```

### Session Management

```typescript
// Provider session (recommended)
await metorial.withProviderSession(
  provider.chatCompletions,
  { serverDeployments: ['deployment-id'] },
  async session => {
    // Your session logic here
  }
);

// Direct session management
await metorial.withSession(['deployment-id'], async session => {
  // Your session logic here
});
```

### Session Object

The session object passed to your callback provides:

```typescript
interface Session {
  // Tool definitions formatted for your provider
  tools: any[];

  // Execute tools and get responses
  callTools(toolCalls: any[]): Promise<any[]>;

  // Advanced access
  toolManager: MetorialMcpToolManager; // Direct tool management
  session: MetorialMcpSession; // Raw MCP session
}
```

## Error Handling

```typescript
import { MetorialAPIError } from 'metorial';

try {
  await metorial.withProviderSession(/* ... */);
} catch (error) {
  if (error instanceof MetorialAPIError) {
    console.error(`API Error: ${error.message} (Status: ${error.status})`);
  } else {
    console.error(`Unexpected error:`, error);
  }
}
```

## Examples

Check out the `examples/` directory for more comprehensive examples:

- [`examples/typescript-openai/`](examples/typescript-openai/) - OpenAI integration
- [`examples/typescript-anthropic/`](examples/typescript-anthropic/) - Anthropic integration
- [`examples/typescript-ai-sdk/`](examples/typescript-ai-sdk/) - AI SDK integration

## Requirements

- Node.js 18+
- TypeScript 5.0+ (for TypeScript projects)
- Provider-specific SDKs (optional):
  - `openai` for OpenAI integration
  - `@anthropic-ai/sdk` for Anthropic integration
  - `@google/generative-ai` for Google integration
  - `@mistralai/mistralai` for Mistral integration

## Development

This project includes build scripts to help with common development tasks:

### Setup and Installation

```bash
npm install        # Install dependencies
# or
bun install       # If using Bun
```

### Build and Test

```bash
bun run build     # Build all packages
bun run test      # Run test suite
```

### Package Management

This is a monorepo using workspaces. The structure includes:

- `mcp/` - MCP provider integrations
- `packages/` - Core utilities and shared packages
- `examples/` - Example implementations
- `sdk/` - Core SDK packages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://docs.metorial.com)
- 🐛 [GitHub Issues](https://github.com/metorial/metorial-node/issues)
- 📧 [Email Support](mailto:support@metorial.com)
