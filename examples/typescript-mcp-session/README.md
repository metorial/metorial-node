# Metorial MCP Session (TypeScript) Example

This example shows how to use the [MetorialMcpSession](https://www.npmjs.com/package/@metorial/mcp-session) for direct MCP session access without AI models, including OAuth-enabled servers.

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

When using streaming with tool calls, enable the `streaming` flag in session options:

```typescript
let mcpSession = new MetorialMcpSession(metorial, {
  serverDeployments: [...],
  streaming: true, // Optional: enable for streaming with tool calls
});
```

### Closing Sessions

Always close your MCP session when done to free up resources:

```typescript
await mcpSession.close(); // Close session when done
```

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Your API Key

```ts
// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: "your-metorial-api-key" });
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

// Create MCP session with both deployment types
let mcpSession = new MetorialMcpSession(metorial, {
  serverDeployments: [
    { serverDeploymentId: normalServerDeploymentId },
    { serverDeploymentId: oauthServerDeploymentId, oauthSessionId: oauthSession.id },
  ],
  // streaming: true, // Optional: enable for streaming with tool calls
});

// Get the session and tool manager
let session = await mcpSession.getSession();
let toolManager = await mcpSession.getToolManager();

// List available tools
let tools = toolManager.getTools();
for (let tool of tools) {
  console.log(`• ${tool.name}: ${tool.description}`);
}

// Call a tool directly
let result = await someTool.call({ param: "value" });

// Always close the session when done
await mcpSession.close();
```

This example demonstrates direct MCP session access without using an AI model, useful for:
- Building custom tool orchestration
- Testing MCP tools directly
- Integrating with custom AI implementations

## Requirements

- [Bun](https://bun.sh) (v1.0+)
- Metorial account + deployment IDs

## License

MIT — feel free to use and adapt this code in your own projects.

## Learn More

- [Metorial Documentation](https://metorial.com/docs)
- [MCP Session Package](https://www.npmjs.com/package/@metorial/mcp-session)
