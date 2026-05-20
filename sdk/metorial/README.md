# Metorial Node.js SDK

The official Node.js/TypeScript SDK for [Metorial](https://metorial.com) - Connect your AI agents to any MCP server with a single line of code. Deploy tools like Slack, GitHub, SAP, and hundreds more without managing infrastructure.

[Sign up for a free account](https://app.metorial.com) to get started.

## Complete API Documentation

**[API Documentation](https://metorial.com/api)** - Complete API reference and guides

## Available Providers

| Provider          | Import                        | Format                       | Models (non-exhaustive)                      |
| ----------------- | ----------------------------- | ---------------------------- | -------------------------------------------- |
| AI SDK            | `@metorial/ai-sdk`            | Framework tools              | Any model via Vercel AI SDK                  |
| OpenAI            | `@metorial/openai`            | OpenAI function calling      | `gpt-4.1`, `gpt-4o`, `o1`, `o3`              |
| Anthropic         | `@metorial/anthropic`         | Claude tool format           | `claude-sonnet-4-5`, `claude-opus-4`         |
| Google            | `@metorial/google`            | Gemini function declarations | `gemini-2.5-pro`, `gemini-2.5-flash`         |
| Mistral           | `@metorial/mistral`           | Mistral function calling     | `mistral-large-latest`, `codestral-latest`   |
| DeepSeek          | `@metorial/deepseek`          | OpenAI-compatible            | `deepseek-chat`, `deepseek-reasoner`         |
| TogetherAI        | `@metorial/togetherai`        | OpenAI-compatible            | `Llama-4`, `Qwen-3`                          |
| XAI               | `@metorial/xai`               | OpenAI-compatible            | `grok-3`, `grok-3-mini`                      |
| LangChain         | `@metorial/langchain`         | LangChain tools              | Any model via LangChain                      |
| OpenAI-Compatible | `@metorial/openai-compatible` | OpenAI-compatible            | Any OpenAI-compatible API                    |

## Quick Start

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { metorialAiSdk } from "@metorial/ai-sdk";
import { Metorial } from "metorial";
import { stepCountIs, streamText } from "ai";

// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: "your-metorial-api-key" });

let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search"
});

let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [{ providerDeploymentId: deployment.id }]
});

let result = streamText({
  model: anthropic("claude-sonnet-4-5"),
  prompt: "Research what makes Metorial so special.",
  stopWhen: stepCountIs(25),
  tools: session.tools(),
  onStepFinish: (step) => {
    if (step.toolCalls?.length) {
      console.log(`🔧 Using tools: ${step.toolCalls.map((tc) => tc.toolName).join(", ")}`);
    }
  }
});

console.log("🤖 AI Response:\n");
for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

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

## OAuth Integration

When working with services that require user authentication (like Google Calendar, Slack, etc.), Metorial provides OAuth session management to handle the authentication flow:

```typescript
import { Metorial } from 'metorial';
import { metorialAnthropic } from '@metorial/anthropic';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let anthropic = new Anthropic({ apiKey: 'your-anthropic-api-key' });

// Create OAuth sessions for services that require user authentication
// this just needs to be done once per user
let [googleCalOAuthSession, slackOAuthSession] = await Promise.all([
  metorial.oauth.sessions.create({ 
    serverDeploymentId: 'your-google-calendar-server-deployment-id',
    // Optional: callback URL after OAuth completion
    // callbackUri: "https://your-app.com/oauth/callback",
  }),
  metorial.oauth.sessions.create({ 
    serverDeploymentId: 'your-slack-server-deployment-id',
    // Optional: callback URL after OAuth completion
    // callbackUri: "https://your-app.com/oauth/callback",
  })
]);

// Give user OAuth URLs for authentication
console.log('OAuth URLs for user authentication:');
console.log(`   Google Calendar: ${googleCalOAuthSession.url}`);
console.log(`   Slack: ${slackOAuthSession.url}`);

// Wait for user to complete OAuth flow
await metorial.oauth.waitForCompletion([googleCalOAuthSession, slackOAuthSession]);

console.log('OAuth sessions completed!');

// Now use the authenticated sessions
let session = await metorial.connect({
  adapter: metorialAnthropic(),
  providers: [
    {
      providerDeploymentId: 'your-google-calendar-provider-deployment-id',
      providerAuthConfigId: googleCalOAuthSession.id
    },
    {
      providerDeploymentId: 'your-slack-provider-deployment-id',
      providerAuthConfigId: slackOAuthSession.id
    },
    {
      providerDeploymentId: 'your-exa-provider-deployment-id'
    }
  ]
});

let messages: Anthropic.Messages.MessageParam[] = [
  {
    role: 'user',
    content: `Look in Slack for mentions of potential partners. Use Exa to research their background,
    company, and email. Schedule a 30-minute intro call with them for an open slot on Dec 13th, 2025
    SF time and send me the calendar link.`
  }
];

for (let i = 0; i < 10; i++) {
  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages,
    tools: session.tools()
  });

  let toolCalls = response.content.filter(
    (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
  );

  if (toolCalls.length === 0) {
    let finalText = response.content
      .filter((c): c is Anthropic.Messages.TextBlock => c.type === 'text')
      .map(c => c.text)
      .join('');
    console.log(finalText);
    break;
  }

  let toolResponses = await session.callTools(toolCalls);
  messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
}
```

### OAuth Flow Explained

1. **Create OAuth Sessions**: Call `metorial.oauth.sessions.create()` for each service requiring user authentication (only once per user)
2. **Send URLs**: Show the OAuth URLs to users so they can authenticate in their browser
3. **Wait for Completion**: Use `metorial.oauth.waitForCompletion()` to wait for users to complete the OAuth flow
4. **Use Authenticated Sessions**: Pass the `providerAuthConfigId` when configuring `providers`

## Examples

Check out the `examples/` directory for more comprehensive examples:

- [`examples/typescript-ai-sdk/`](examples/typescript-ai-sdk/) - Vercel AI SDK integration (recommended)
- [`examples/typescript-openai/`](examples/typescript-openai/) - OpenAI integration
- [`examples/typescript-anthropic/`](examples/typescript-anthropic/) - Anthropic integration
- [`examples/typescript-google/`](examples/typescript-google/) - Google Gemini integration
- [`examples/typescript-deepseek/`](examples/typescript-deepseek/) - DeepSeek integration

## Provider Examples

### OpenAI

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let openai = new OpenAI({ apiKey: 'your-openai-api-key' });

let session = await metorial.connect({
  adapter: metorialOpenAI.chatCompletions(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
  { role: 'user', content: 'What are the latest commits?' }
];

for (let i = 0; i < 10; i++) {
  let response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: session.tools()
  });

  let choice = response.choices[0]!;
  let toolCalls = choice.message.tool_calls;

  if (!toolCalls) {
    console.log(choice.message.content);
    break;
  }

  let toolResponses = await session.callTools(toolCalls);
  messages.push(
    { role: 'assistant', tool_calls: choice.message.tool_calls },
    ...toolResponses
  );
}
```

### Anthropic (Claude)

```typescript
import { Metorial } from 'metorial';
import { metorialAnthropic } from '@metorial/anthropic';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let anthropic = new Anthropic({ apiKey: 'your-anthropic-api-key' });

let session = await metorial.connect({
  adapter: metorialAnthropic(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let messages: Anthropic.Messages.MessageParam[] = [
  { role: 'user', content: 'Help me with this GitHub task: ...' }
];

let response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages,
  tools: session.tools()
});

// Handle tool calls
let toolCalls = response.content.filter(
  (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
);

if (toolCalls.length > 0) {
  let toolResponses = await session.callTools(toolCalls);
  messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
}
```

### Google (Gemini)

```typescript
import { Metorial } from 'metorial';
import { metorialGoogle } from '@metorial/google';
import { GoogleGenerativeAI } from '@google/generative-ai';

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });
let genAI = new GoogleGenerativeAI('your-google-api-key');

let session = await metorial.connect({
  adapter: metorialGoogle(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro',
  tools: session.tools()
});

let response = await model.generateContent('What can you help me with?');

// Handle function calls if present
// ... tool call handling logic
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

let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });

let session = await metorial.connect({
  adapter: metorialDeepSeek.chatCompletions(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let response = await deepseekClient.chat.completions.create({
  model: 'deepseek-chat',
  messages: [{ role: 'user', content: 'Help me code' }],
  tools: session.tools()
});
// ... handle response
```

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
// Connect to MCP providers with an AI adapter (recommended)
let session = await metorial.connect({
  adapter: provider.chatCompletions(),
  providers: [{ providerDeploymentId: 'deployment-id' }]
});

// session.tools() — tool definitions formatted for your provider
// session.callTools() — execute tool calls and get responses
```

### Adapter Session

The adapter session provides:

```typescript
let session = await metorial.connect({
  adapter: metorialOpenAI.chatCompletions(),
  providers: [{ providerDeploymentId: 'deployment-id' }]
});

session.tools(); // Tool definitions formatted for your provider
session.callTools(toolCalls); // Execute tools and get responses
```

## Error Handling

```typescript
import { MetorialAPIError } from 'metorial';

try {
  await metorial.connect({
    adapter: metorialAiSdk(),
    providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
  });
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

[Documentation](https://metorial.com/docs) · [GitHub Issues](https://github.com/metorial/metorial-node/issues) · [Email Support](mailto:support@metorial.com)
