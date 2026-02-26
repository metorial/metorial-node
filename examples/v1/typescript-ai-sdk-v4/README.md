# Metorial + AI SDK v4 Example

Shows how to use Metorial tools with Vercel AI SDK v4 and OpenAI, including OAuth-enabled servers.

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
async ({ tools, closeSession }) => {
  // Use tools...
  await closeSession(); // Close when done
}
```

## Setup

1. **Install**: `bun install`

2. **API Keys**: Set in `.env`:
```env
OPENAI_API_KEY=your-key-here
```

3. **Configure**: Update `src/index.ts` with your Metorial API key and server deployment IDs

4. **Run**: `bun start`

## Code

```ts
import { openai } from "@ai-sdk/openai";
import { metorialAiSdk } from "@metorial/ai-sdk/v4";
import { Metorial } from "@metorial/sdk";
import { generateText } from "ai";

// Get your API key at https://app.metorial.com
let metorial = new Metorial({ apiKey: "your-metorial-api-key" });

// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = "your-normal-server-deployment-id";
let oauthServerDeploymentId = "your-oauth-server-deployment-id";

// Create OAuth session (once per user)
let oauthSession = await metorial.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

await metorial.oauth.waitForCompletion([oauthSession]);

await metorial.withProviderSession(
  metorialAiSdk,
  {
    serverDeployments: [
      { serverDeploymentId: normalServerDeploymentId },
      { serverDeploymentId: oauthServerDeploymentId, oauthSessionId: oauthSession.id },
    ],
    // streaming: true, // Optional: enable for streaming with tool calls
  },
  async ({ tools, closeSession }) => {
    let result = await generateText({
      model: openai("gpt-4o"),
      prompt: "Your prompt here",
      maxSteps: 10,
      tools: tools,
    });

    console.log(result.text);
    await closeSession(); // Close session when done
  }
);
```

Here's what happens:

* The Metorial session is initialized with tool bindings from `@metorial/ai-sdk/v4`.
* OAuth session is created for servers requiring user authorization.
* `generateText()` runs a prompt with tool support enabled.
* If the model chooses to invoke a tool, Metorial handles the call and feeds the response back.
* `closeSession()` is called to clean up resources when done.

## Requirements

* Bun (or Node-compatible runtime)
* OpenAI API access
* A Metorial account and server deployment IDs

## License

MIT — feel free to use, fork, or adapt this example in your own applications.

## Learn More

* [Metorial Documentation](https://metorial.com/docs)
* [Vercel AI SDK](https://ai-sdk.dev/)
