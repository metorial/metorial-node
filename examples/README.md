# Metorial MCP Provider Examples

This directory contains TypeScript examples for all available Metorial MCP providers. Each example demonstrates how to use a specific AI provider with Metorial's MCP (Model Context Protocol) tools.

## Available Examples

### 🤖 AI Provider Examples

| Provider       | Example Directory        | Description                                        |
| -------------- | ------------------------ | -------------------------------------------------- |
| **OpenAI**     | `typescript-openai/`     | Use OpenAI models (GPT-4, GPT-3.5) with MCP tools  |
| **DeepSeek**   | `typescript-deepseek/`   | Use DeepSeek models with MCP tools                 |
| **Anthropic**  | `typescript-anthropic/`  | Use Anthropic Claude models with MCP tools         |
| **Google**     | `typescript-google/`     | Use Google Gemini models with MCP tools            |
| **TogetherAI** | `typescript-togetherai/` | Use TogetherAI models (Llama, etc.) with MCP tools |
| **XAI**        | `typescript-xai/`        | Use XAI models with MCP tools                      |
| **Mistral**    | `typescript-mistral/`    | Use Mistral models with MCP tools                  |
| **AI SDK**     | `typescript-ai-sdk/`     | Use Vercel AI SDK with MCP tools                   |

### 🔧 Infrastructure Examples

| Provider              | Example Directory               | Description                                                 |
| --------------------- | ------------------------------- | ----------------------------------------------------------- |
| **OpenAI Compatible** | `typescript-openai-compatible/` | Use any OpenAI-compatible API (Ollama, etc.) with MCP tools |
| **MCP Session**       | `typescript-mcp-session/`       | Direct MCP session access without AI models                 |

## Quick Start

### Prerequisites

1. **Metorial API Key**: Get your API key from [Metorial Dashboard](https://app.metorial.com)
2. **Provider API Keys**: Get API keys for the providers you want to use
3. **Bun**: Install [Bun](https://bun.sh) for running the examples

### Running an Example

1. **Navigate to an example directory**:

   ```bash
   cd oss/clients/metorial-node/examples/typescript-openai
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Update API keys** in `src/index.ts`:

   ```typescript
   const metorial = new Metorial({
     apiKey: 'your-metorial-api-key-here'
     // ...
   });

   const openai = new OpenAI({
     apiKey: 'your-openai-api-key-here'
     // ...
   });
   ```

4. **Run the example**:
   ```bash
   bun start
   ```

## Example Structure

Each example follows a similar pattern:

```typescript
import { Metorial } from '@metorial/sdk';
import { metorialProvider } from '@metorial/provider-name';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

await metorial.withProviderSession(
  metorialProvider,
  { serverDeployments: ['your-server-deployment-id'] },
  async session => {
    // Use the session with your AI provider
    // Access MCP tools via session.tools
    // Call tools via session.callTools()
  }
);
```

## Common Features

All examples demonstrate:

- **Tool Discovery**: Listing available MCP tools
- **Tool Execution**: Calling tools with proper error handling
- **Session Management**: Managing Metorial MCP sessions
- **Timeout Handling**: Preventing hanging tool calls
- **Error Recovery**: Graceful handling of tool failures

### Model Selection

Each provider example uses appropriate models:

- **OpenAI**: `gpt-4` or `gpt-3.5-turbo`
- **DeepSeek**: `deepseek-chat`
- **Anthropic**: `claude-3-sonnet-20240229`
- **Google**: `gemini-pro`
- **TogetherAI**: `meta-llama/Llama-2-70b-chat-hf`
- **XAI**: `x-1`
- **Mistral**: `mistral-large-latest`

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correct and have sufficient credits
2. **Network Issues**: Check your internet connection and firewall settings
3. **Tool Timeouts**: Some tools may take longer than expected; adjust timeout values
4. **Model Availability**: Ensure the specified model is available in your provider account

## Support

For issues with:

- **Metorial SDK**: Check the [Metorial documentation](https://docs.metorial.com)
- **Provider APIs**: Check the respective provider documentation
- **Examples**: Open an issue in this repository

## License

These examples are provided under the same license as the Metorial SDK.
