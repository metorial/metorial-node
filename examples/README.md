# Metorial Examples

All examples use **Metorial Search** by default — a built-in web search provider that requires no setup. Just set your env vars and run.

See the [main README](../README.md) for docs on authentication, OAuth, session templates, and provider configuration.

## Running an Example

```bash
cd examples/typescript-quick-start
cp .env.example .env  # add your API keys
bun install
bun start
```

## Examples

| Example | LLM | Description |
|---------|-----|-------------|
| [`typescript-quick-start`](typescript-quick-start/) | AI SDK + Anthropic | Minimal example — start here |
| [`typescript-ai-sdk`](typescript-ai-sdk/) | AI SDK + Anthropic (v6) | Streaming with tool logging |
| [`typescript-ai-sdk-v4`](typescript-ai-sdk-v4/) | AI SDK + Anthropic (v4/v5) | For older AI SDK versions |
| [`typescript-anthropic`](typescript-anthropic/) | Anthropic SDK | Manual tool call loop |
| [`typescript-openai`](typescript-openai/) | OpenAI | GPT-4o with tool calls |
| [`typescript-openai-compatible`](typescript-openai-compatible/) | Any OpenAI-compatible | Works with any compatible API |
| [`typescript-google`](typescript-google/) | Google Gemini | Gemini with function calling |
| [`typescript-deepseek`](typescript-deepseek/) | DeepSeek | DeepSeek chat with tools |
| [`typescript-mistral`](typescript-mistral/) | Mistral | Mistral with schema fixes |
| [`typescript-togetherai`](typescript-togetherai/) | TogetherAI | Together AI models |
| [`typescript-xai`](typescript-xai/) | xAI (Grok) | Grok with tool calls |
| [`typescript-provider-config`](typescript-provider-config/) | OpenAI | Auth configs, templates, filters |

Legacy v1 examples are in [`legacy/`](legacy/).
