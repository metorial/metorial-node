# metorial

The main TypeScript/JavaScript SDK for Metorial - AI-powered tool calling and session management. This is the primary entry point for most users.

## Installation

```bash
npm install metorial
# or
yarn add metorial
# or
pnpm add metorial
# or
bun add metorial
```

## Usage

### Basic SDK Initialization

```typescript
import { Metorial } from 'metorial';

// Initialize the main SDK
let metorial = new Metorial({
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com', // optional
  mcpHost: 'https://mcp.metorial.com' // optional
});

// Access SDK components
let instance = metorial.instance; // Instance management
let secrets = metorial.secrets; // Secrets management
let servers = metorial.servers; // Server management
let sessions = metorial.sessions; // Session management
let mcp = metorial.mcp; // MCP-specific methods
```

### MCP Session Management

```typescript
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Create a basic MCP session
await metorial.mcp.withSession(
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    // Get session information
    let sessionInfo = await session.getSession();
    console.log('Session:', sessionInfo);

    // Get available tools
    let toolManager = await session.getToolManager();
    let tools = toolManager.getTools();
    console.log(
      'Available tools:',
      tools.map(t => t.name)
    );

    // Get server capabilities
    let capabilities = await session.getCapabilities();
    console.log('Capabilities:', capabilities);

    // Get server deployments
    let deployments = await session.getServerDeployments();
    console.log('Deployments:', deployments);
  }
);
```

### AI Provider Integration

#### OpenAI Integration

```bash
npm install @metorial/openai openai
```

```typescript
import { Metorial } from 'metorial';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let openai = new OpenAI({
  apiKey: 'your-openai-api-key'
});

// Use with OpenAI
await metorial.mcp.withProviderSession(
  metorialOpenAI.chatCompletions,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    // session.tools contains the tools formatted for OpenAI
    let response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Search for information about AI developments'
        }
      ],
      tools: session.tools
    });

    let choice = response.choices[0];
    if (choice.message.tool_calls) {
      // Execute tool calls
      let toolResponses = await session.callTools(choice.message.tool_calls);
      console.log('Tool responses:', toolResponses);
    }
  }
);
```

#### Anthropic Integration

```bash
npm install @metorial/anthropic @anthropic-ai/sdk
```

```typescript
import { Metorial } from 'metorial';
import { metorialAnthropic } from '@metorial/anthropic';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let anthropic = new Anthropic({
  apiKey: 'your-anthropic-api-key'
});

// Use with Anthropic
await metorial.mcp.withProviderSession(
  metorialAnthropic.messages,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: 'Search for information about AI developments'
        }
      ],
      tools: session.tools
    });

    if (response.content[0].type === 'tool_use') {
      // Execute tool calls
      let toolResponses = await session.callTools([response.content[0]]);
      console.log('Tool responses:', toolResponses);
    }
  }
);
```

#### Google AI Integration

```bash
npm install @metorial/google @google/generative-ai
```

```typescript
import { Metorial } from 'metorial';
import { metorialGoogle } from '@metorial/google';
import { GoogleGenerativeAI } from '@google/generative-ai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let genAI = new GoogleGenerativeAI('your-google-api-key');

// Use with Google AI
await metorial.mcp.withProviderSession(
  metorialGoogle.generateContent,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    let result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: 'Search for information about AI developments' }]
        }
      ],
      tools: session.tools
    });

    let response = result.response;
    if (response.candidates[0].content.parts[0].functionCall) {
      // Execute function calls
      let toolResponses = await session.callTools([response.candidates[0].content.parts[0]]);
      console.log('Tool responses:', toolResponses);
    }
  }
);
```

#### AI SDK (Vercel) Integration

```bash
npm install @metorial/ai-sdk ai
```

```typescript
import { Metorial } from 'metorial';
import { metorialAISDK } from '@metorial/ai-sdk';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Use with AI SDK
await metorial.mcp.withProviderSession(
  metorialAISDK.generateText,
  {
    serverDeployments: ['your-server-deployment-id']
  },
  async session => {
    let { text, toolCalls } = await generateText({
      model: openai('gpt-4o'),
      prompt: 'Search for information about AI developments',
      tools: session.tools
    });

    if (toolCalls) {
      // Execute tool calls
      let toolResponses = await session.callTools(toolCalls);
      console.log('Tool responses:', toolResponses);
    }
  }
);
```

### Direct MCP Connection

```typescript
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Create a direct MCP connection
let connection = await metorial.mcp.createConnection('your-server-deployment-id');

// Use the connection for direct MCP communication
let tools = await connection.listTools();
console.log('Available tools:', tools);

let result = await connection.callTool('searchContext', {
  query: 'metorial AI tools',
  maxResults: 5
});
console.log('Search result:', result);
```

### Server Management

```typescript
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// List all servers
let servers = await metorial.servers.list();
console.log('Available servers:', servers);

// Get specific server
let server = await metorial.servers.get('server-id');
console.log('Server details:', server);

// List server deployments
let deployments = await metorial.servers.deployments.list();
console.log('Deployments:', deployments);

// Create a new deployment
let newDeployment = await metorial.servers.deployments.create({
  serverId: 'server-id',
  variantId: 'variant-id',
  versionId: 'version-id'
});
console.log('New deployment:', newDeployment);

// Update deployment
let updatedDeployment = await metorial.servers.deployments.update('deployment-id', {
  name: 'Updated Deployment Name'
});
console.log('Updated deployment:', updatedDeployment);

// Delete deployment
await metorial.servers.deployments.delete('deployment-id');
```

### Session Management

```typescript
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// List all sessions
let sessions = await metorial.sessions.list();
console.log('Active sessions:', sessions);

// Get specific session
let session = await metorial.sessions.get('session-id');
console.log('Session details:', session);

// Create a new session
let newSession = await metorial.sessions.create({
  serverDeploymentId: 'deployment-id'
});
console.log('New session:', newSession);

// Delete session
await metorial.sessions.delete('session-id');

// Get session messages
let messages = await metorial.sessions.messages.list('session-id');
console.log('Session messages:', messages);

// Get session connections
let connections = await metorial.sessions.connections.list('session-id');
console.log('Session connections:', connections);
```

### Secrets Management

```typescript
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// List all secrets
let secrets = await metorial.secrets.list();
console.log('Available secrets:', secrets);

// Get specific secret
let secret = await metorial.secrets.get('secret-id');
console.log('Secret details:', secret);

// Create a new secret
let newSecret = await metorial.secrets.create({
  name: 'my-api-key',
  value: 'secret-value',
  description: 'API key for external service'
});
console.log('New secret:', newSecret);
```

## API Reference

### `Metorial` Class

#### Constructor

```typescript
new Metorial(config: {
  apiKey: string;
  apiHost?: string;
  mcpHost?: string;
  apiVersion?: string;
  headers?: Record<string, string>;
})
```

#### Properties

- `instance`: Instance management endpoint
- `secrets`: Secrets management endpoint
- `servers`: Server management endpoint
- `sessions`: Session management endpoint
- `mcp`: MCP-specific methods

#### MCP Methods

- `mcp.createSession(init)`: Create a new MCP session
- `mcp.withSession(init, action)`: Execute action with session lifecycle management
- `mcp.withProviderSession(provider, init, action)`: Execute action with provider integration
- `mcp.createConnection(deploymentId)`: Create direct MCP connection

### Session Object

The session object provides the following methods:

- `getSession()`: Get session information
- `getCapabilities()`: Get server capabilities
- `getServerDeployments()`: Get server deployments
- `getToolManager()`: Get tool manager
- `getClient(deploymentId)`: Get MCP client for specific deployment
- `callTools(toolCalls)`: Execute tool calls
- `close()`: Close the session

### Error Handling

All SDK methods throw `MetorialSDKError` for API errors:

```typescript
try {
  await metorial.servers.get('invalid-id');
} catch (error) {
  if (error instanceof MetorialSDKError) {
    console.log('API Error:', error.message);
    console.log('Status:', error.status);
    console.log('Code:', error.code);
  }
}
```

### Configuration Options

The SDK supports various configuration options:

```typescript
let metorial = new Metorial({
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com', // Custom API host
  mcpHost: 'https://mcp.metorial.com', // Custom MCP host
  apiVersion: '2025-01-01-pulsar', // API version
  headers: {
    // Custom headers
    'User-Agent': 'MyApp/1.0.0'
  }
});
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
