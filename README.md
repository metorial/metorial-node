# Metorial Node.js SDK

The official Node.js/TypeScript SDK for [Metorial](https://metorial.com) - Connect your AI agents to any MCP server with a single line of code. Deploy tools like Slack, GitHub, SAP, and hundreds more without managing infrastructure.

[Sign up for a free account](https://app.metorial.com) to get started.

## Complete API Documentation
**[API Documentation](https://metorial.com/api)** - Complete API reference and guides

## Available Providers

| Provider          | Import                      | Format                       | Models (non-exhaustive)                      |
| ----------------- | --------------------------- | ---------------------------- | -------------------------------------------- |
| AI SDK            | `@metorial/ai-sdk`          | Framework tools              | Any model via Vercel AI SDK                  |
| OpenAI            | `@metorial/openai`          | OpenAI function calling      | `gpt-4.1`, `gpt-4o`, `o1`, `o3`              |
| Anthropic         | `@metorial/anthropic`       | Claude tool format           | `claude-sonnet-4-5`, `claude-opus-4`         |
| Google            | `@metorial/google`          | Gemini function declarations | `gemini-2.5-pro`, `gemini-2.5-flash`         |
| Mistral           | `@metorial/mistral`         | Mistral function calling     | `mistral-large-latest`, `codestral-latest`   |
| DeepSeek          | `@metorial/deepseek`        | OpenAI-compatible            | `deepseek-chat`, `deepseek-reasoner`         |
| TogetherAI        | `@metorial/togetherai`      | OpenAI-compatible            | `Llama-4`, `Qwen-3`                          |
| XAI               | `@metorial/xai`             | OpenAI-compatible            | `grok-3`, `grok-3-mini`                      |
| LangChain         | `@metorial/langchain`       | LangChain tools              | Any model via LangChain                      |
| OpenAI-Compatible | `@metorial/openai-compatible` | OpenAI-compatible          | Any OpenAI-compatible API                    |

## Quick Start

```typescript
import { anthropic } from "@ai-sdk/anthropic";
import { metorialAiSdk } from "@metorial/ai-sdk";
import { Metorial } from "@metorial/sdk";
import { stepCountIs, streamText } from "ai";

// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: "your-metorial-api-key" });

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: [
      { serverDeploymentId: "your-server-deployment-id" },
    ],
    streaming: true, // Required for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic("claude-sonnet-4-5"),
      prompt: "Research what makes Metorial so special.",
      stopWhen: stepCountIs(25),
      tools: tools,
      onStepFinish: (step: any) => {
        if (step.toolCalls) {
          console.log(`🔧 Using tools: ${step.toolCalls.map((tc: any) => tc.toolName).join(", ")}`);
        }
      },
      onFinish: async () => {
        console.log("\n🎯 Stream completed!");
        await closeSession();
      },
    });
    return result;
  }
);

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

## Setting Up Server Deployments

Server deployments are configured at [app.metorial.com](https://app.metorial.com). When you create a session from a deployment, we spin up an isolated serverless instance isolated to that user.

### Types of Deployments

1. **Standard Deployments** (e.g., Exa or Tavily for web search)
   - API key-based authentication
   - Can be shared across all users
   - No user authorization required

2. **OAuth-Enabled Deployments** (e.g., Slack, GitHub, SAP)
   - Requires user authorization
   - Each user completes OAuth once
   - Session is isolated per user

### Enterprise: Bring Your Own (BYO) Credentials

For enterprise deployments, you have flexible options:

- **Shared deployment**: Deploy once and share with all users (works well for API key-based servers like Exa, Tavily)
- **BYO OAuth**: For services like SAP, enterprises can bring their own OAuth app credentials
- **Dynamic deployments**: Create server deployments programmatically via the [Server Deployment API](http://metorial.com/api/server-deployment)

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
await metorial.withProviderSession(
  metorialAnthropic,
  {
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
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, callTools, closeSession }) => {
    let messages: Anthropic.Messages.MessageParam[] = [
      { 
        role: 'user', 
        content: `Look in Slack for mentions of potential partners. Use Exa to research their background, 
        company, and email. Schedule a 30-minute intro call with them for an open slot on Dec 13th, 2025 
        SF time and send me the calendar link.` 
      }
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(new Map(tools.map(t => [t.name, t])).values());

    for (let i = 0; i < 10; i++) {
      let response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages,
        tools: uniqueTools
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
        await closeSession();
        return;
      }

      let toolResponses = await callTools(toolCalls);
      messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
    }

    await closeSession();
  }
);
```

### OAuth Flow Explained

1. **Create OAuth Sessions**: Call `metorial.oauth.sessions.create()` for each service requiring user authentication (only once per user)
2. **Send URLs**: Show the OAuth URLs to users so they can authenticate in their browser
3. **Wait for Completion**: Use `metorial.oauth.waitForCompletion()` to wait for users to complete the OAuth flow
4. **Use Authenticated Sessions**: Pass the `oauthSessionId` when configuring `serverDeployments`

## Session Options

### Streaming Mode

When using streaming with tool calls, enable the `streaming` flag:

```typescript
await metorial.withProviderSession(
  metorialProvider,
  {
    serverDeployments: [...],
    streaming: true, // Required for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    // Your streaming code here
  }
);
```

### Closing Sessions

Always close your session when done to free up resources. The `closeSession` callback is provided in the session handler:

```typescript
async ({ tools, closeSession }) => {
  // Use tools...
  
  // When finished, close the session
  await closeSession();
}
```

For streaming scenarios, you can close the session in the `onFinish` callback:

```typescript
let result = streamText({
  model: anthropic("claude-sonnet-4-5"),
  tools: tools,
  onFinish: async () => {
    await closeSession();
  },
});
```

## Examples

Check out the `examples/` directory for more comprehensive examples:

- [`examples/typescript-ai-sdk/`](examples/typescript-ai-sdk/) - Vercel AI SDK integration (recommended)
- [`examples/typescript-openai/`](examples/typescript-openai/) - OpenAI integration
- [`examples/typescript-anthropic/`](examples/typescript-anthropic/) - Anthropic integration
- [`examples/typescript-google/`](examples/typescript-google/) - Google Gemini integration
- [`examples/typescript-deepseek/`](examples/typescript-deepseek/) - DeepSeek integration

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
  { 
    serverDeployments: ['your-server-deployment-id'],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, callTools, closeSession }) => {
    let messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: 'Help me with this GitHub task: ...' }
    ];

    // Dedupe tools by name
    let uniqueTools = Array.from(new Map(tools.map(t => [t.name, t])).values());

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages,
      tools: uniqueTools
    });

    // Handle tool calls
    let toolCalls = response.content.filter(
      (c): c is Anthropic.Messages.ToolUseBlock => c.type === 'tool_use'
    );

    if (toolCalls.length > 0) {
      let toolResponses = await callTools(toolCalls);
      messages.push({ role: 'assistant', content: response.content as any }, toolResponses);
    }

    await closeSession(); // Close session when done
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
  { 
    serverDeployments: ['your-server-deployment-id'],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    let model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      tools: tools
    });

    let response = await model.generateContent('What can you help me with?');

    // Handle function calls if present
    // ... tool call handling logic

    await closeSession(); // Close session when done
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
  { 
    serverDeployments: ['your-server-deployment-id'],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    let response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Help me code' }],
      tools: tools
    });
    // ... handle response

    await closeSession(); // Close session when done
  }
);
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
// Provider session (recommended)
await metorial.withProviderSession(
  provider.chatCompletions,
  { 
    serverDeployments: ['deployment-id'],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    // Your session logic here
    await closeSession(); // Close when done
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
async ({ tools, callTools, closeSession }) => {
  // tools: Tool definitions formatted for your provider
  // callTools: Execute tools and get responses
  // closeSession: Close the session when done (always call this!)
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

[Documentation](https://metorial.com/docs) · [GitHub Issues](https://github.com/metorial/metorial-node/issues) · [Email Support](mailto:support@metorial.com)
