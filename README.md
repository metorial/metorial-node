# Metorial Node.js SDK

The official Node.js/TypeScript SDK for [Metorial](https://metorial.com). Give your AI agents access to tools like Slack, GitHub, SAP, and hundreds more through MCP — without managing servers, auth flows, or infrastructure.

[Sign up for a free account](https://platform.metorial.com) to get started.

## Complete API Documentation

- **[Documentation](https://metorial.com/docs)** - Documentation and guides
- **[API Reference](https://metorial.com/api)** - Complete API reference

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

## Supported LLM Integrations

This SDK provides adapter packages that format MCP tools for each LLM. You can also use the API directly.

| LLM Integration   | Import                        | Format                       | Models (non-exhaustive)                    |
| ----------------- | ----------------------------- | ---------------------------- | ------------------------------------------ |
| AI SDK            | `@metorial/ai-sdk`            | Framework tools              | Any model via Vercel AI SDK                |
| OpenAI            | `@metorial/openai`            | OpenAI function calling      | `gpt-4.1`, `gpt-4o`, `o1`, `o3`            |
| Anthropic         | `@metorial/anthropic`         | Claude tool format           | `claude-sonnet-4-5`, `claude-opus-4`       |
| Google            | `@metorial/google`            | Gemini function declarations | `gemini-2.5-pro`, `gemini-2.5-flash`       |
| Mistral           | `@metorial/mistral`           | Mistral function calling     | `mistral-large-latest`, `codestral-latest` |
| DeepSeek          | `@metorial/deepseek`          | OpenAI-compatible            | `deepseek-chat`, `deepseek-reasoner`       |
| TogetherAI        | `@metorial/togetherai`        | OpenAI-compatible            | `Llama-4`, `Qwen-3`                        |
| XAI               | `@metorial/xai`               | OpenAI-compatible            | `grok-3`, `grok-3-mini`                    |
| LangChain         | `@metorial/langchain`         | LangChain tools              | Any model via LangChain                    |
| OpenAI-Compatible | `@metorial/openai-compatible` | OpenAI-compatible            | Any OpenAI-compatible API                  |

## Quick Start

This example uses **Metorial Search**, a built-in web search provider that requires no auth configuration. You just need two environment variables:

- `METORIAL_API_KEY` from [platform.metorial.com](https://platform.metorial.com)
- `ANTHROPIC_API_KEY` from [console.anthropic.com](https://console.anthropic.com)

```bash
npm install metorial @metorial/ai-sdk @ai-sdk/anthropic ai
```

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { stepCountIs, streamText } from 'ai';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

// Create a deployment for Metorial Search (built-in web search, no auth needed)
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [{ providerDeploymentId: deployment.id }],
    streaming: true
  },
  async ({ tools, closeSession }) => {
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt:
        'Search the web for the latest news about AI agents and summarize the top 3 stories.',
      stopWhen: stepCountIs(10),
      tools,
      onStepFinish: step => {
        if (step.toolCalls?.length) {
          console.log(step.toolCalls.map(tc => tc.toolName).join(', '));
        }
      },
      onFinish: async () => {
        await closeSession();
      }
    });
    return result;
  }
);

for await (let part of result.textStream) {
  process.stdout.write(part);
}
```

> See the full runnable example at [`examples/typescript-quick-start/`](examples/typescript-quick-start/).

## Authenticating MCP Tool Providers

The Quick Start above used Metorial Search, which requires no authentication. Most providers — Slack, GitHub, SAP, and others — require credentials. Here are the options, from simplest to most flexible.

**Key concepts:**

- **Provider** — an MCP tool integration (e.g. Slack, GitHub, Metorial Search). Browse available providers at [platform.metorial.com](https://platform.metorial.com).
- **Provider Deployment** — an instance of a provider configured for your project. You can create deployments in the dashboard or programmatically.
- **Auth Credentials** — your OAuth app registration (client ID, client secret, scopes).
- **Auth Config** — an already-authenticated connection with a token, service account, or specific user via an OAuth flow.

### Dashboard-Configured Deployments

Some providers (Exa, Tavily) use API keys configured entirely in the [dashboard](https://platform.metorial.com). Just pass the deployment ID — no auth code needed:

```typescript
providers: [{ providerDeploymentId: 'your-exa-deployment-id' }];
```

### Pre-Created Auth Config

An auth config represents an already-authenticated connection to a provider — for example, a user who has completed the OAuth flow for Slack. Once created (via the dashboard or a setup session), reference it by ID:

```typescript
providers: [
  {
    providerDeploymentId: 'your-slack-deployment-id',
    providerAuthConfigId: 'your-auth-config-id'
  }
];
```

### Inline Credentials

Pass credentials directly without pre-creating them in the dashboard:

```typescript
providers: [
  {
    providerDeploymentId: 'your-deployment-id',
    providerAuthConfig: {
      providerAuthMethodId: 'your-auth-method-id',
      credentials: { access_token: 'user-access-token' }
    }
  }
];
```

### OAuth Flow

For services like Slack or GitHub where each end-user authenticates individually, use setup sessions to handle the OAuth flow:

```typescript
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

// 1. Create a setup session for the provider
let setupSession = await metorial.providerDeployments.setupSessions.create({
  providerId: 'your-slack-provider-id',
  providerAuthMethodId: 'your-slack-auth-method-id'
  // callbackUri: 'https://yourapp.com/oauth/callback'
});

// 2. Send the OAuth URL to your user
console.log(`Authenticate here: ${setupSession.url}`);

// 3. Wait for the user to complete OAuth
let completed = await metorial.providerDeployments.setupSessions.waitForCompletion([
  setupSession
]);

// 4. Use the auth config in a session
await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [
      {
        providerDeploymentId: 'your-slack-deployment-id',
        providerAuthConfigId: completed[0].authConfig!.id
      }
    ]
  },
  async ({ tools }) => {
    // Use tools...
  }
);
```

For a multi-provider OAuth example, see [`examples/typescript-ai-sdk/`](examples/typescript-ai-sdk/).

### Multiple Providers in One Session

Combine providers freely in a single session — each can use a different auth method:

```typescript
providers: [
  { providerDeploymentId: 'your-search-deployment-id' },
  {
    providerDeploymentId: 'your-slack-deployment-id',
    providerAuthConfigId: 'slack-auth-config-id'
  },
  {
    providerDeploymentId: 'your-github-deployment-id',
    providerAuthConfig: {
      providerAuthMethodId: 'github-auth-method-id',
      credentials: { access_token: 'ghp_...' }
    }
  }
];
```

### Session Templates

Pre-configure provider combinations on the [dashboard](https://platform.metorial.com), then reference them by ID. This is useful when you want to manage which providers and auth configs are used without changing code — for example, bundling Metorial Search + GitHub + Slack into a single template that your team can reuse:

```typescript
await metorial.withProviderSession(
  metorialAiSdk,
  { sessionTemplate: 'your-template-id' },
  async ({ tools, closeSession }) => {
    // All providers from the template are available as tools
    /* ... */
  }
);
```

See [`examples/typescript-provider-config/`](examples/typescript-provider-config/) for a full example of session templates and other provider configuration patterns.

### Enterprise: Bring Your Own (BYO) Credentials

For enterprise deployments, you have flexible options:

- **Shared deployment**: Deploy once and share with all users (works well for API key-based tools like Exa, Tavily)
- **BYO OAuth**: For services like SAP, enterprises can register their own OAuth app credentials:

```typescript
let credentials = await metorial.providerDeployments.authCredentials.create({
  providerId: 'your-sap-provider-id',
  name: 'Our SAP OAuth App',
  config: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    scopes: ['read', 'write']
  }
});
```

- **Dynamic deployments**: Create provider deployments programmatically via the [Provider Deployment API](https://metorial.com/api/provider-deployment):

```typescript
let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});
// use deployment.id in your session's providers array
```

## Session Options

- **Streaming**: Pass `streaming: true` in the session options when using streaming APIs (like AI SDK's `streamText`). See the Quick Start for a full example.
- **Closing sessions**: Always call `closeSession()` when done to free resources. For streaming, call it in the `onFinish` callback.
- **Direct sessions**: Use `metorial.withSession()` instead of `withProviderSession()` for raw MCP access without an LLM adapter.

## Examples

Check out the `examples/` directory for more comprehensive examples:

- [`typescript-quick-start`](examples/typescript-quick-start/) - Quick start with Metorial Search
- [`typescript-ai-sdk`](examples/typescript-ai-sdk/) - AI SDK + Anthropic (v6)
- [`typescript-ai-sdk-v4`](examples/typescript-ai-sdk-v4/) - AI SDK + Anthropic (v4/v5)
- [`typescript-anthropic`](examples/typescript-anthropic/) - Anthropic SDK
- [`typescript-openai`](examples/typescript-openai/) - OpenAI
- [`typescript-openai-compatible`](examples/typescript-openai-compatible/) - Any OpenAI-compatible API
- [`typescript-google`](examples/typescript-google/) - Google Gemini
- [`typescript-deepseek`](examples/typescript-deepseek/) - DeepSeek
- [`typescript-mistral`](examples/typescript-mistral/) - Mistral
- [`typescript-togetherai`](examples/typescript-togetherai/) - TogetherAI
- [`typescript-xai`](examples/typescript-xai/) - xAI (Grok)
- [`typescript-provider-config`](examples/typescript-provider-config/) - Provider configuration patterns

## LLM Integration Examples

All LLM integrations follow the same `withProviderSession` pattern. See [`examples/`](examples/) for complete examples with every supported LLM.

### Anthropic (Claude)

```typescript
import { metorialAnthropic } from '@metorial/anthropic';
import Anthropic from '@anthropic-ai/sdk';

let anthropic = new Anthropic();

await metorial.withProviderSession(
  metorialAnthropic,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async ({ tools, callTools, closeSession }) => {
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: 'Search for the latest AI news.' }],
      tools
    });

    let toolCalls = response.content.filter(c => c.type === 'tool_use');
    if (toolCalls.length > 0) {
      let toolResponses = await callTools(toolCalls);
      // continue the conversation with tool results...
    }

    await closeSession();
  }
);
```

### OpenAI-Compatible (DeepSeek, TogetherAI, XAI)

```typescript
import { metorialDeepseek } from '@metorial/deepseek';
import OpenAI from 'openai';

// Works with any OpenAI-compatible API
let client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: 'https://api.deepseek.com'
});

await metorial.withProviderSession(
  metorialDeepseek,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async ({ tools, closeSession }) => {
    let response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Search for the latest AI news.' }],
      tools
    });
    // ... handle tool_calls from response

    await closeSession();
  }
);
```

<details>
<summary><strong>Migrating from v1</strong></summary>

| v1 (Legacy)                          | v2                                                               |
| ------------------------------------ | ---------------------------------------------------------------- |
| `serverDeployments` array            | `providers` array                                                |
| `serverDeploymentId`                 | `providerDeploymentId`                                           |
| `oauthSessionId`                     | `providerAuthConfigId`                                           |
| `metorial.oauth.sessions.create()`   | `metorial.providerDeployments.setupSessions.create()`            |
| `metorial.oauth.waitForCompletion()` | `metorial.providerDeployments.setupSessions.waitForCompletion()` |

The v1 API is still accessible via `metorial.v1.*`.

</details>

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
