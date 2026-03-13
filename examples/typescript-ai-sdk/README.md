# Metorial + Vercel AI SDK (v6)

Uses the [Vercel AI SDK](https://sdk.vercel.ai/) (v6) with Anthropic Claude to stream AI responses with MCP tool calls via [Metorial](https://metorial.com). Includes commented-out OAuth code you can enable to add providers like GitHub or Slack.

## Environment variables

- `METORIAL_API_KEY` — get one at [platform.metorial.com](https://platform.metorial.com)
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)

## Run

```bash
bun install
METORIAL_API_KEY=... ANTHROPIC_API_KEY=... bun start
```

## How it works

Initialize clients and create a deployment for the built-in Metorial Search provider:

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { metorialAiSdk } from '@metorial/ai-sdk';
import { Metorial } from 'metorial';
import { streamText, stepCountIs } from 'ai';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});
```

To use a provider that requires OAuth (like GitHub or Slack), you'd create a setup session first. This is commented out in the code — uncomment it to try:

```typescript
// let setupSession = await metorial.providerDeployments.setupSessions.create({
//   providerId: oauthProviderId,
//   providerAuthMethodId: oauthAuthMethodId
// });
// console.log('Complete OAuth at:', setupSession.url);
// let [completedSession] = await metorial.providerDeployments.setupSessions.waitForCompletion([setupSession]);
```

Open a streaming session. `metorialAiSdk` is the adapter that formats MCP tools for the Vercel AI SDK. You can pass multiple providers in the `providers` array — here we just use Metorial Search, but the commented-out block shows adding an OAuth provider alongside it:

```typescript
let result = await metorial.withProviderSession(
  metorialAiSdk,
  {
    providers: [
      { providerDeploymentId: deployment.id },
      // { providerDeploymentId: oauthProviderDeploymentId, providerAuthConfigId: completedSession.authConfig!.id }
    ],
    streaming: true
  },
  async ({ tools, closeSession }) => {
```

Inside the session, `streamText()` handles the tool call loop automatically. When Claude wants to use a tool, the AI SDK calls it and feeds the result back. `onStepFinish` logs which tools were called at each step. Always call `closeSession()` when done to free server-side resources:

```typescript
    let result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      prompt: 'Search the web for the latest news about AI agents and summarize the top 3 stories.',
      stopWhen: stepCountIs(10),
      tools,
      onStepFinish: (step) => {
        if (step.toolCalls?.length) {
          console.log(`\n🔧 ${step.toolCalls.map((tc) => tc.toolName).join(', ')}\n`);
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

The `streaming: true` flag is important — it tells Metorial to keep the MCP connection alive for the duration of the stream instead of closing it after the initial tool list is returned.
