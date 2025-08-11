# @metorial/core

Core package for Metorial. Provides essential functionalities, shared components, and the foundation for all Metorial SDK packages.

## Installation

```bash
npm install @metorial/core
# or
yarn add @metorial/core
# or
pnpm add @metorial/core
# or
bun add @metorial/core
```

## Usage

### Core SDK Creation

```typescript
import { createMetorialCoreSDK } from '@metorial/core';

// Create the core SDK instance
let sdk = createMetorialCoreSDK({
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com', // optional
  mcpHost: 'https://mcp.metorial.com', // optional
  apiVersion: '2025-01-01-pulsar', // optional, defaults to this version
  headers: {
    'Custom-Header': 'value' // optional custom headers
  }
});

// Access different API endpoints
let instance = sdk.instance;
let secrets = sdk.secrets;
let servers = sdk.servers;
let sessions = sdk.sessions;
```

### Instance Management

```typescript
import { createMetorialCoreSDK } from '@metorial/core';

let sdk = createMetorialCoreSDK({
  apiKey: 'your-metorial-api-key'
});

// Get instance information
let instanceInfo = await sdk.instance.get();
console.log('Instance details:', instanceInfo);
```

### Secrets Management

```typescript
import { createMetorialCoreSDK } from '@metorial/core';

let sdk = createMetorialCoreSDK({
  apiKey: 'your-metorial-api-key'
});

// List all secrets
let secrets = await sdk.secrets.list();
console.log('Available secrets:', secrets);

// Get specific secret
let secret = await sdk.secrets.get('secret-id');
console.log('Secret details:', secret);

// Create a new secret
let newSecret = await sdk.secrets.create({
  name: 'my-api-key',
  value: 'secret-value',
  description: 'API key for external service'
});
console.log('New secret:', newSecret);
```

### Server Management

```typescript
import { createMetorialCoreSDK } from '@metorial/core';

let sdk = createMetorialCoreSDK({
  apiKey: 'your-metorial-api-key'
});

// List all servers
let servers = await sdk.servers.list();
console.log('Available servers:', servers);

// Get specific server
let server = await sdk.servers.get('server-id');
console.log('Server details:', server);

// Server variants
let variants = await sdk.servers.variants.list();
console.log('Server variants:', variants);

let variant = await sdk.servers.variants.get('variant-id');
console.log('Variant details:', variant);

// Server versions
let versions = await sdk.servers.versions.list();
console.log('Server versions:', versions);

let version = await sdk.servers.versions.get('version-id');
console.log('Version details:', version);

// Server deployments
let deployments = await sdk.servers.deployments.list();
console.log('Deployments:', deployments);

let deployment = await sdk.servers.deployments.get('deployment-id');
console.log('Deployment details:', deployment);

// Create a new deployment
let newDeployment = await sdk.servers.deployments.create({
  serverId: 'server-id',
  variantId: 'variant-id',
  versionId: 'version-id'
});
console.log('New deployment:', newDeployment);

// Update deployment
let updatedDeployment = await sdk.servers.deployments.update('deployment-id', {
  name: 'Updated Deployment Name'
});
console.log('Updated deployment:', updatedDeployment);

// Delete deployment
await sdk.servers.deployments.delete('deployment-id');

// Server implementations
let implementations = await sdk.servers.implementations.list();
console.log('Implementations:', implementations);

let implementation = await sdk.servers.implementations.get('implementation-id');
console.log('Implementation details:', implementation);

// Create implementation
let newImplementation = await sdk.servers.implementations.create({
  serverId: 'server-id',
  name: 'My Implementation',
  description: 'Custom implementation'
});
console.log('New implementation:', newImplementation);

// Server capabilities
let capabilities = await sdk.servers.capabilities.list();
console.log('Server capabilities:', capabilities);

// Server runs
let runs = await sdk.servers.runs.list();
console.log('Server runs:', runs);

let run = await sdk.servers.runs.get('run-id');
console.log('Run details:', run);

// Server run errors
let errors = await sdk.servers.errors.list();
console.log('Run errors:', errors);

let error = await sdk.servers.errors.get('error-id');
console.log('Error details:', error);
```

### Session Management

```typescript
import { createMetorialCoreSDK } from '@metorial/core';

let sdk = createMetorialCoreSDK({
  apiKey: 'your-metorial-api-key'
});

// List all sessions
let sessions = await sdk.sessions.list();
console.log('Active sessions:', sessions);

// Get specific session
let session = await sdk.sessions.get('session-id');
console.log('Session details:', session);

// Create a new session
let newSession = await sdk.sessions.create({
  serverDeploymentId: 'deployment-id'
});
console.log('New session:', newSession);

// Delete session
await sdk.sessions.delete('session-id');

// Session messages
let messages = await sdk.sessions.messages.list('session-id');
console.log('Session messages:', messages);

let message = await sdk.sessions.messages.get('session-id', 'message-id');
console.log('Message details:', message);

// Session connections
let connections = await sdk.sessions.connections.list('session-id');
console.log('Session connections:', connections);

let connection = await sdk.sessions.connections.get('session-id', 'connection-id');
console.log('Connection details:', connection);
```

### TypeScript Types

```typescript
import { MetorialSDK } from '@metorial/core';

// Use the comprehensive type definitions
let secret: MetorialSDK.Secret;
let server: MetorialSDK.Server;
let session: MetorialSDK.Session;
let deployment: MetorialSDK.ServerDeployment;
let implementation: MetorialSDK.ServersImplementation;
let variant: MetorialSDK.ServerVariant;
let version: MetorialSDK.ServerVersion;
let capability: MetorialSDK.ServerCapabilities;
let run: MetorialSDK.ServerRun;
let error: MetorialSDK.ServerRunError;
let message: MetorialSDK.SessionMessage;
let connection: MetorialSDK.SessionServerSession;
```

## API Reference

### `createMetorialCoreSDK` Function

#### Parameters

```typescript
createMetorialCoreSDK(config: {
  apiKey: string;
  apiHost?: string;
  mcpHost?: string;
  apiVersion?: '2025-01-01-pulsar';
  headers?: Record<string, string>;
})
```

#### Returns

Returns a `MetorialCoreSDK` object with the following properties:

- `instance`: Instance management endpoint
- `secrets`: Secrets management endpoint
- `servers`: Server management endpoint with nested endpoints:
  - `variants`: Server variants management
  - `versions`: Server versions management
  - `deployments`: Server deployments management
  - `implementations`: Server implementations management
  - `capabilities`: Server capabilities management
  - `runs`: Server runs management
  - `errors`: Server run errors management
- `sessions`: Session management endpoint with nested endpoints:
  - `messages`: Session messages management
  - `connections`: Session connections management

### Endpoint Methods

Each endpoint provides standard CRUD operations:

- `list(query?)`: List resources with optional query parameters
- `get(id)`: Get a specific resource by ID
- `create(data)`: Create a new resource
- `update(id, data)`: Update an existing resource
- `delete(id)`: Delete a resource (where applicable)

### Error Handling

All endpoints throw `MetorialSDKError` for API errors:

```typescript
try {
  await sdk.servers.get('invalid-id');
} catch (error) {
  if (error instanceof MetorialSDKError) {
    console.log('API Error:', error.message);
    console.log('Status:', error.status);
    console.log('Code:', error.code);
  }
}
```

### Query Parameters

Many list methods support query parameters for filtering and pagination:

```typescript
// List with pagination
let servers = await sdk.servers.list({
  limit: 10,
  offset: 0
});

// List with filtering
let deployments = await sdk.servers.deployments.list({
  serverId: 'specific-server-id',
  status: 'active'
});
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
