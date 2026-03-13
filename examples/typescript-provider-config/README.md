# Metorial Provider Configuration Examples

Demonstrates the different ways to configure providers when creating a [Metorial](https://metorial.com) session. Example 1 runs out of the box with OpenAI + Metorial Search; examples 2-7 are commented out and show increasingly advanced configuration patterns.

## Environment variables

Only `METORIAL_API_KEY` and `OPENAI_API_KEY` are needed to run example 1. Uncomment other examples and set additional env vars as documented in the code.

## Run

```bash
bun install
METORIAL_API_KEY=... OPENAI_API_KEY=... bun start
```

## Example 1: Metorial Search (runs by default)

Creates a deployment programmatically for the built-in `metorial-search` provider. No dashboard setup needed:

```typescript
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});

await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { providers: [{ providerDeploymentId: deployment.id }] },
  async (session) => {
    // session.tools contains the search tools, formatted for OpenAI
  }
);
```

## Example 2: Pre-configured deployment ID

Reference a deployment created in the [dashboard](https://platform.metorial.com) (e.g. Exa, Tavily). The API key is configured in the dashboard, so no auth code is needed:

```typescript
providers: [{ providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID! }]
```

## Example 3: Auth config ID

Reference an already-authenticated connection by ID. Auth configs are created when a user completes an OAuth flow, or manually in the dashboard:

```typescript
providers: [{
  providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
  providerAuthConfigId: process.env.PROVIDER_AUTH_CONFIG_ID!,
}]
```

## Example 4: Inline auth config

Pass credentials directly in code without pre-creating them in the dashboard. Useful for server-to-server integrations:

```typescript
providers: [{
  providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
  providerAuthConfig: {
    providerAuthMethodId: process.env.PROVIDER_AUTH_METHOD_ID!,
    credentials: { access_token: process.env.PROVIDER_ACCESS_TOKEN! },
  },
}]
```

## Example 5: Tool filters

Limit which MCP tools are exposed to the LLM. Useful when a provider has many tools but you only need a few:

```typescript
providers: [{
  providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
  toolFilters: [{ type: "tool_keys", keys: ["search", "read_file"] }],
}]
```

## Example 6: Multiple providers

Combine search, Slack, and GitHub in a single session. Each provider can use a different auth method. All tools are merged and available to the LLM:

```typescript
providers: [
  { providerDeploymentId: process.env.SEARCH_PROVIDER_DEPLOYMENT_ID! },
  {
    providerDeploymentId: process.env.SLACK_PROVIDER_DEPLOYMENT_ID!,
    providerAuthConfigId: process.env.SLACK_AUTH_CONFIG_ID!,
  },
  {
    providerDeploymentId: process.env.GITHUB_PROVIDER_DEPLOYMENT_ID!,
    providerAuthConfig: {
      providerAuthMethodId: process.env.GITHUB_AUTH_METHOD_ID!,
      credentials: { access_token: process.env.GITHUB_ACCESS_TOKEN! },
    },
  },
]
```

## Example 7: Session template

Reference a pre-configured template from the dashboard. Templates bundle providers + auth configs into a reusable ID, so you can change what tools are available without updating code:

```typescript
await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  { sessionTemplate: process.env.SESSION_TEMPLATE_ID! },
  async (session) => { /* ... */ }
);
```
