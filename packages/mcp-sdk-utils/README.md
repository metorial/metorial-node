# @metorial/mcp-sdk-utils

MCP SDK utilities for Metorial. Provides common utilities and helpers for MCP (Model Context Protocol) integration with AI SDK frameworks.

## Installation

```bash
npm install @metorial/mcp-sdk-utils
# or
yarn add @metorial/mcp-sdk-utils
# or
pnpm add @metorial/mcp-sdk-utils
# or
bun add @metorial/mcp-sdk-utils
```

## Usage

### Basic AI SDK Integration

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Initialize Metorial
let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

let result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Summarize the latest news about AI developments',
  maxSteps: 10,
  tools: session.tools()
});

console.log(result.text);
```

### Advanced Tool Usage

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

// Streaming with tools
let { textStream } = streamText({
  model: openai('gpt-4o'),
  prompt: 'Research the latest developments in quantum computing',
  maxSteps: 15,
  tools: session.tools()
});

for await (let chunk of textStream) {
  process.stdout.write(chunk);
}
```

### Custom Tool Configuration

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [
    {
      providerDeploymentId: 'your-provider-deployment-id',
      toolFilters: [{ type: 'tool_keys', keys: ['search'] }]
    }
  ]
});

console.log(
  'Available tools:',
  session.tools().map(t => t.name)
);

let result = await generateText({
  model: anthropic('claude-3-sonnet-20240229'),
  prompt: 'Find information about renewable energy trends',
  maxSteps: 8,
  tools: session.tools()
});

console.log('Result:', result.text);
```

### Error Handling

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

try {
  let session = await metorial.connect({
    adapter: metorialAiSdk(),
    providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
  });

  let result = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Analyze the current market trends',
    maxSteps: 10,
    tools: session.tools()
  });

  console.log(result.text);
} catch (error) {
  if (error.code === 'TOOL_EXECUTION_ERROR') {
    console.error('Tool execution failed:', error.message);
  } else if (error.code === 'SESSION_ERROR') {
    console.error('Session error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### React Component Integration

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { useChat } from 'ai/react';
import { openai } from '@ai-sdk/openai';

function ChatComponent() {
  let metorial = new Metorial({
    apiKey: 'your-metorial-api-key'
  });

  let { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      metorialConfig: {
        adapter: 'metorialAiSdk',
        providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
      }
    }
  });

  return (
    <div>
      <div className="messages">
        {messages.map(message => (
          <div key={message.id}>
            <strong>{message.role}:</strong> {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### API Route Handler

```typescript
// pages/api/chat.ts
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';
import { openai, streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  let { messages, metorialConfig } = await req.json();

  let metorial = new Metorial({
    apiKey: process.env.METORIAL_API_KEY!
  });

  let session = await metorial.connect({
    adapter: metorialAiSdk(),
    providers: metorialConfig.providers
  });

  let { textStream } = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 10,
    tools: session.tools()
  });

  return textStream;
}
```

### Tool Discovery and Inspection

```typescript
import { metorialAiSdk } from '@metorial/mcp-sdk-utils';
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let session = await metorial.connect({
  adapter: metorialAiSdk(),
  providers: [{ providerDeploymentId: 'your-provider-deployment-id' }]
});

console.log('Available tools:');
session.tools().forEach(tool => {
  console.log(`- ${tool.name}: ${tool.description}`);
  if (tool.function?.parameters) {
    console.log(`  Parameters:`, tool.function.parameters);
  }
});
```

## API Reference

### `metorialAiSdk`

The main integration function that provides MCP tools to AI SDK frameworks.

**Usage:** Pass to `metorial.connect()` as the `adapter` option.

**Returns:** Adapter session with tools compatible with AI SDK.

### Session Object

The adapter session provides:

- `tools()`: MCP tools compatible with AI SDK
- `callTools(toolCalls)`: Function to execute tool calls

### Tool Object

Each tool in the session has:

- `name`: Tool name
- `description`: Tool description
- `function`: Tool function definition with parameters

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
