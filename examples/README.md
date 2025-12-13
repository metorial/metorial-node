# Metorial MCP Provider Examples

This directory contains TypeScript examples for all available LLM providers. Each example demonstrates how to use a specific provider with Metorial's MCP (Model Context Protocol) tools.

## Available Examples

### 🤖 AI Provider Examples

| Provider       | Example Directory        | Description                                        |
| -------------- | ------------------------ | -------------------------------------------------- |
| **AI SDK**     | `typescript-ai-sdk/`     | Use Vercel AI SDK with MCP tools (recommended)     |
| **OpenAI**     | `typescript-openai/`     | Use OpenAI models with MCP tools                   |
| **Anthropic**  | `typescript-anthropic/`  | Use Anthropic Claude models with MCP tools         |
| **Google**     | `typescript-google/`     | Use Google Gemini models with MCP tools            |
| **DeepSeek**   | `typescript-deepseek/`   | Use DeepSeek models with MCP tools                 |
| **Mistral**    | `typescript-mistral/`    | Use Mistral models with MCP tools                  |
| **TogetherAI** | `typescript-togetherai/` | Use TogetherAI models with MCP tools               |
| **XAI**        | `typescript-xai/`        | Use xAI Grok models with MCP tools                 |
| **LangChain**  | `typescript-langchain/`  | Use LangChain with MCP tools                       |

### 🔧 Infrastructure Examples

| Provider              | Example Directory               | Description                                                 |
| --------------------- | ------------------------------- | ----------------------------------------------------------- |
| **OpenAI Compatible** | `typescript-openai-compatible/` | Use any OpenAI-compatible API (Ollama, etc.) with MCP tools |
| **MCP Session**       | `typescript-mcp-session/`       | Direct MCP session access without AI models                 |

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

## OAuth-Enabled Servers

For servers that require OAuth (Slack, GitHub, SAP, etc.), you need to create an OAuth session for each user. This only needs to be done once per user.

```typescript
// Create OAuth session for the OAuth-enabled server
// this just needs to be done once per user
let oauthSession = await metorial.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

console.log('🔑 OAuth URL - Complete authorization:', oauthSession.url);

// Wait for user to complete OAuth authorization
await metorial.oauth.waitForCompletion([oauthSession]);

// Use the OAuth session in your deployment
serverDeployments: [
  {
    serverDeploymentId: oauthServerDeploymentId,
    oauthSessionId: oauthSession.id
  }
];
```

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
};
```

For streaming scenarios, you can close the session in the `onFinish` callback:

```typescript
let result = streamText({
  model: anthropic('claude-sonnet-4-5'),
  tools: tools,
  onFinish: async () => {
    await closeSession();
  }
});
```

## Enterprise: Bring Your Own (BYO) Credentials

For enterprise deployments, you have flexible options:

- **Shared deployment**: Deploy once and share with all users (works well for API key-based servers like Exa, Tavily)
- **BYO OAuth**: For services like SAP, enterprises can bring their own OAuth app credentials
- **Dynamic deployments**: Create server deployments programmatically via the [Server Deployment API](http://metorial.com/api/server-deployment)

This allows enterprises to:

- Use their own OAuth applications for services like SAP, Salesforce, etc.
- Dynamically provision server deployments per customer or tenant
- Maintain full control over credentials and access

## Quick Start

### Prerequisites

1. **Metorial API Key**: Get your API key from [app.metorial.com](https://app.metorial.com)
2. **Provider API Keys**: Get API keys for the providers you want to use
3. **Bun**: Install [Bun](https://bun.sh) for running the examples

### Running an Example

1. **Navigate to an example directory**:

   ```bash
   cd examples/typescript-openai
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Update API keys** in `src/index.ts`:

   ```typescript
   let metorial = new Metorial({
     apiKey: 'your-metorial-api-key-here'
   });

   let openai = new OpenAI({
     apiKey: 'your-openai-api-key-here'
   });
   ```

4. **Run the example**:
   ```bash
   bun start
   ```

## Example Structure

Each example follows a similar pattern with both standard and OAuth deployments:

```typescript
import { Metorial } from '@metorial/sdk';
import { metorialProvider } from '@metorial/provider-name';

// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: 'your-metorial-api-key' });

// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = 'your-normal-server-deployment-id';
let oauthServerDeploymentId = 'your-oauth-server-deployment-id';

// Create OAuth session (once per user)
let oauthSession = await metorial.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId
});
await metorial.oauth.waitForCompletion([oauthSession]);

// Start session with both deployment types
await metorial.withProviderSession(
  metorialProvider,
  {
    serverDeployments: [
      { serverDeploymentId: normalServerDeploymentId },
      { serverDeploymentId: oauthServerDeploymentId, oauthSessionId: oauthSession.id }
    ],
    streaming: true // Optional: enable for streaming with tool calls
  },
  async ({ tools, callTools, closeSession }) => {
    // Use tools with your AI provider
    // Call tools via callTools()

    // Always close the session when done
    await closeSession();
  }
);
```

## Common Features

All examples demonstrate:

- **Tool Discovery**: Listing available MCP tools
- **Tool Execution**: Calling tools with proper error handling
- **Session Management**: Managing Metorial MCP sessions with proper cleanup
- **OAuth Flow**: Handling OAuth-enabled servers
- **Streaming Support**: Using streaming mode with tool calls
- **Error Recovery**: Graceful handling of tool failures

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correct and have sufficient credits
2. **OAuth Errors**: Make sure the user has completed the OAuth flow before using the session
3. **Network Issues**: Check your internet connection and firewall settings
4. **Tool Timeouts**: Some tools may take longer than expected; adjust timeout values
5. **Model Availability**: Ensure the specified model is available in your provider account
6. **Session Not Closed**: Always call `closeSession()` to free up resources

## Support

For issues with:

- **Metorial SDK**: Check the [Metorial documentation](https://docs.metorial.com)
- **Provider APIs**: Check the respective provider documentation
- **Examples**: Open an issue in this repository

## License

These examples are provided under the same license as the Metorial SDK.
