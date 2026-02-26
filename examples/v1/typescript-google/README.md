# Metorial + Google Gemini (TypeScript) Example

This example shows how to use the [Metorial SDK](https://www.npmjs.com/package/metorial) with [Google Gemini](https://ai.google.dev/) in a TypeScript project, including OAuth-enabled servers.

## Setting Up Server Deployments

Server deployments are configured at [app.metorial.com](https://app.metorial.com). When you create a session from a deployment, we spin up an isolated serverless instance isolated to that user.

### Types of Deployments

1. **Standard Deployments** (e.g., Exa or Tavily for web search)
   - API key-based authentication
   - Can be shared across all users

2. **OAuth-Enabled Deployments** (e.g., Slack, GitHub, SAP)
   - Requires user authorization
   - Each user completes OAuth once
   - Session is isolated per user

### Enterprise: Bring Your Own (BYO) Credentials

For enterprise deployments with custom OAuth credentials:

- **Shared deployment**: Deploy once and share with all users
- **BYO OAuth**: Bring your own OAuth app credentials for services like SAP
- **Dynamic deployments**: Create deployments programmatically via the [Server Deployment API](http://metorial.com/api/server-deployment)

## Session Options

### Streaming Mode

When using streaming with tool calls, enable the `streaming` flag:

```typescript
{
  serverDeployments: [...],
  streaming: true, // Optional: enable for streaming with tool calls
}
```

### Closing Sessions

Always close your session when done to free up resources. Use the `closeSession` callback:

```typescript
async ({ tools, callTools, closeSession }) => {
  // Use tools...
  await closeSession(); // Close when done
}
```

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Your API Keys

```ts
// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: "your-metorial-api-key" });
let genAI = new GoogleGenAI({ apiKey: "your-google-gen-api-key" });
```

### 3. Configure Server Deployments

```ts
// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = "your-normal-server-deployment-id";
let oauthServerDeploymentId = "your-oauth-server-deployment-id";
```

### 4. Run the Example

```bash
bun start
```

## Code Walkthrough

```ts
// Create OAuth session (once per user)
let oauthSession = await metorial.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

await metorial.oauth.waitForCompletion([oauthSession]);

await metorial.withProviderSession(
  metorialGoogle,
  {
    serverDeployments: [
      { serverDeploymentId: normalServerDeploymentId },
      { serverDeploymentId: oauthServerDeploymentId, oauthSessionId: oauthSession.id },
    ],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, callTools, closeSession }) => {
    let response = await genAI.models.generateContent({
      model: "gemini-2.5-pro-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: "Your prompt here" }],
        },
      ],
      config: {
        tools: tools,
      },
    });

    // Handle function calls
    let functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter((part) => part.functionCall)
      .map((part) => part.functionCall!);

    if (functionCalls && functionCalls.length > 0) {
      let toolResponses = await callTools(functionCalls);
      console.log("Tool responses:", toolResponses);
    }

    await closeSession(); // Close session when done
  }
);
```

## Requirements

- [Bun](https://bun.sh) (v1.0+)
- Metorial account + deployment IDs
- Google AI API key

## License

MIT — feel free to use and adapt this code in your own projects.

## Learn More

- [Metorial Documentation](https://metorial.com/docs)
- [Google AI SDK](https://ai.google.dev/)
