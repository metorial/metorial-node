# Metorial + OpenAI with `metorial.run` (TypeScript) Example

This example shows how to use the [Metorial SDK](https://www.npmjs.com/package/@metorial/sdk) with [OpenAI](https://www.npmjs.com/package/openai) using the `metorial.run` method. This provides a streamlined way to power AI models with dynamic tool calling without needing to manage the conversation loop manually.

## Getting Started

### 1. Install Dependencies

This project uses [Bun](https://bun.sh). Install dependencies with:

```bash
bun install
```

### 2. Set Your API Keys

Replace placeholders in `src/index.ts`:

```ts
let metorial = new Metorial({ apiKey: '...your-metorial-api-key...' });
let openai = new OpenAI({ apiKey: '...your-openai-api-key...' });
```

You'll also need to provide a valid `serverDeploymentId`:

```ts
serverDeployments: ['...server-deployment-id...']
```

### 3. Run the Example

```bash
bun start
```

This will:

1. Send your message to OpenAI (GPT-4o)
2. Automatically handle any tool calls using your Metorial deployments
3. Continue the conversation loop until a final response is received
4. Return the final result with step count

## Code Walkthrough

The key difference from the manual approach is the simplified API:

```ts
let result = await metorial.run({
  message: 'Your prompt here',
  serverDeployments: ['...'],
  model: 'gpt-4o',
  client: openai,
  maxSteps: 10,

  // Optional: specify which tools to use
  // tools: ['specific-tool'], 
  
  // Further client specific options can be passed directly
  temperature: 0.7,
  max_tokens: 1500
});

console.log(result.text);  // Final response
console.log(result.steps); // Number of steps taken
```

## Advanced Usage

### Tool Filtering

```ts
let result = await metorial.run({
  message: 'Search GitHub and summarize results',
  serverDeployments: ['...'],
  model: 'gpt-4o',
  client: openai,
  tools: ['github-search', 'text-summarizer'] // Only use specific tools
});
```

### Provider-Specific Options

```ts
let result = await metorial.run({
  message: 'Creative writing task',
  serverDeployments: ['...'],
  model: 'gpt-4o',
  client: openai,
  // OpenAI-specific options
  temperature: 1.0,
  max_tokens: 2000,
  presence_penalty: 0.6
});
```

## License

MIT — feel free to use and adapt this code in your own projects.

## Learn More

- [Metorial Documentation](https://metorial.com/docs)
- [OpenAI SDK](https://www.npmjs.com/package/openai)