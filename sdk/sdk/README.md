# @metorial/sdk

Primary SDK package for Metorial. Provides the main SDK functionality, session management, and MCP (Model Context Protocol) integration capabilities.

## Installation

```bash
npm install @metorial/sdk
# or
yarn add @metorial/sdk
# or
pnpm add @metorial/sdk
# or
bun add @metorial/sdk
```

## Usage

### Basic SDK Initialization

```typescript
import { Metorial } from '@metorial/sdk';

// Initialize the SDK
let metorial = new Metorial({
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com', // optional
  mcpHost: 'https://mcp.metorial.com' // optional
});

// Access different SDK components
let instance = metorial.instance; // Instance management
let secrets = metorial.secrets; // Secrets management
let servers = metorial.servers; // Server management
let sessions = metorial.sessions; // Session management
```

### MCP Session Management

```typescript
import { Metorial } from '@metorial/sdk';

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
  }
);
```

### Provider Session Integration

```typescript
import { Metorial } from '@metorial/sdk';
import { metorialOpenAI } from '@metorial/openai';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

let openai = new OpenAI({
  apiKey: 'your-openai-api-key'
});

// Use with AI provider integration
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

### Direct MCP Connection

```typescript
import { Metorial } from '@metorial/sdk';

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
import { Metorial } from '@metorial/sdk';

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
```

### Session Management

```typescript
import { Metorial } from '@metorial/sdk';

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

// Get session messages
let messages = await metorial.sessions.messages.list('session-id');
console.log('Session messages:', messages);

// Get session connections
let connections = await metorial.sessions.connections.list('session-id');
console.log('Session connections:', connections);
```

### Secrets Management

```typescript
import { Metorial } from '@metorial/sdk';

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

### Session Management

The SDK provides comprehensive session management with automatic lifecycle handling, tool discovery, and provider integration.

### Error Handling

All SDK methods throw `MetorialSDKError` for API errors with additional context:

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

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
