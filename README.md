# Metorial Node.js SDK

The official Node.js/TypeScript SDK for [Metorial](https://metorial.com) - The open source integration platform for agentic AI

## Complete API Documentation
**[API Documentation](https://metorial.com/api)** - Complete API reference and guides

## Multi-Provider Support

Use the same tools across different AI providers

| Provider   | Model Examples                    | Client Required     |
|------------|-----------------------------------|---------------------|
| OpenAI     | `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` | `openaiClient`     |
| Anthropic  | `claude-3-5-sonnet-20241022`, `claude-3-haiku-20240307` | `anthropicClient` |
| Google     | `gemini-pro`, `gemini-1.5-pro`, `gemini-flash` | `googleClient` |
| DeepSeek   | `deepseek-chat`, `deepseek-coder` | `deepseekClient` |
| Mistral    | `mistral-large-latest`, `mistral-small-latest` | `mistralClient` |
| XAI        | `grok-beta`, `grok-vision-beta`   | `xaiClient`        |
| TogetherAI | `meta-llama/Llama-2-70b-chat-hf`, `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO` | `togetheraiClient` |


## Quick Start

The simplest way to get started is with the `.run()` method, which handles session management and conversation loops automatically:

```typescript
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let openai = new OpenAI({ apiKey: 'your-openai-api-key' });

let result = await metorial.run({
  message: 'Scan my slack messages for meetings and put them on my google calendar.',
  serverDeployments: ['google-calendar-server', 'slack-server'], 
  model: 'gpt-4o',
  client: openai,
  maxSteps: 10 // Optional: limit conversation steps
});

console.log(`Response (completed in ${result.steps} steps):`);
console.log(result.text);
```

### Advanced Usage

```typescript
// With tool filtering and provider-specific options
let result = await metorial.run({
  message: 'Analyze this codebase and create a summary',
  serverDeployments: ['deployment-1', 'deployment-2'],
  model: 'claude-3-5-sonnet-20241022',
  client: anthropic,
  maxSteps: 15,

  tools: ['github-search', 'file-reader'], // Optional: limit to specific tools

  // Provider specific options
  temperature: 0.7,
  max_tokens: 2000
});
```

## OAuth Integration

When working with services that require user authentication (like Google Calendar, Slack, etc.), Metorial provides OAuth session management to handle the authentication flow:

```typescript
import { Metorial } from 'metorial';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let anthropic = new Anthropic({ apiKey: 'your-anthropic-api-key' });

// Create OAuth sessions for services that require user authentication
let [googleCalOAuthSession, slackOAuthSession] = await Promise.all([
  metorial.oauth.sessions.create({ 
    serverDeploymentId: 'your-google-calendar-server-deployment-id' 
  }),
  metorial.oauth.sessions.create({ 
    serverDeploymentId: 'your-slack-server-deployment-id' 
  })
]);

// Give user OAuth URLs for authentication
console.log('OAuth URLs for user authentication:');
console.log(`   Google Calendar: ${googleCalOAuthSession.url}`);
console.log(`   Slack: ${slackOAuthSession.url}`);

// Wait for user to complete OAuth flow
await metorial.oauth.waitForCompletion([googleCalOAuthSession, slackOAuthSession]);

console.log('OAuth sessions completed!');

// Now use the authenticated sessions in your run
let result = await metorial.run({
  message: `Look in Slack for mentions of potential partners. Use Exa to research their background, 
  company, and email. Schedule a 30-minute intro call with them for an open slot on Dec 13th, 2025 
  SF time and send me the calendar link. Proceed without asking for any confirmations.`,

  serverDeployments: [
    { 
      serverDeploymentId: 'your-google-calendar-server-deployment-id', 
      oauthSessionId: googleCalOAuthSession.id 
    },
    { 
      serverDeploymentId: 'your-slack-server-deployment-id', 
      oauthSessionId: slackOAuthSession.id 
    },
    { 
      serverDeploymentId: 'your-exa-server-deployment-id' // No OAuth needed for Exa
    }
  ],
  client: anthropic,
  model: 'claude-3-5-sonnet-20241022'
});

console.log(result.text);
```

### OAuth Flow Explained

1. **Create OAuth Sessions**: Call `metorial.oauth.sessions.create()` for each service requiring user authentication
2. **Send URLs**: Show the OAuth URLs to users so they can authenticate in their browser
3. **Wait for Completion**: Use `metorial.oauth.waitForCompletion()` to wait for users to complete the OAuth flow
4. **Use Authenticated Sessions**: Pass the `oauthSessionId` when configuring `serverDeployments`

## Examples

Check out the `examples/` directory for more comprehensive examples:

- [`examples/typescript-openai-run/`](examples/typescript-openai-run/) - **Simple `.run()` method example**
- [`examples/typescript-openai/`](examples/typescript-openai/) - Manual OpenAI integration
- [`examples/typescript-anthropic/`](examples/typescript-anthropic/) - Anthropic integration
- [`examples/typescript-ai-sdk/`](examples/typescript-ai-sdk/) - AI SDK integration

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

## Manual Integration (More Control)

### OpenAI Example

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

let main = async () => {
  // Initialize clients
  let metorial = new Metorial({
    apiKey: 'your-metorial-api-key'
  });

  let openai = new OpenAI({ apiKey: 'your-openai-api-key' });

  // Use Metorial tools with OpenAI
  await metorial.withProviderSession(
    metorialOpenAI.chatCompletions,
    { serverDeployments: ['your-server-deployment-id'] },
    async session => {
      let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'user', content: 'What are the latest commits?' }
      ];

      for (let i = 0; i < 10; i++) {
        // Call OpenAI with Metorial tools
        let response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          tools: session.tools
        });

        let choice = response.choices[0]!;
        let toolCalls = choice.message.tool_calls;

        if (!toolCalls) {
          console.log(choice.message.content);
          return;
        }

        // Execute tools through Metorial
        let toolResponses = await session.callTools(toolCalls);

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

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let anthropic = new Anthropic({
  apiKey: 'your-anthropic-api-key'
});

await metorial.withProviderSession(
  metorialAnthropic,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    let messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: 'Help me with this GitHub task: ...' }
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(new Map(session.tools.map(t => [t.name, t])).values());

    let response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages,
      tools: uniqueTools
    });

    // Handle tool calls
    let toolCalls = response.content.filter(
      (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
    );

    if (toolCalls.length > 0) {
      let toolResponses = await session.callTools(toolCalls);
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

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let genAI = new GoogleGenerativeAI('your-google-api-key');

await metorial.withProviderSession(
  metorialGoogle,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    let model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: session.tools
    });

    let response = await model.generateContent('What can you help me with?');

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
let deepseekClient = new OpenAI({
  apiKey: 'your-deepseek-key',
  baseURL: 'https://api.deepseek.com'
});

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

await metorial.withProviderSession(
  metorialDeepSeek.chatCompletions,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    let response = await deepseekClient.chat.completions.create({
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

let metorial = new Metorial({
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

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://metorial.com/docs)
- 🐛 [GitHub Issues](https://github.com/metorial/metorial-node/issues)
- 📧 [Email Support](mailto:support@metorial.com)
