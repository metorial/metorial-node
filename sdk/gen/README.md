# @metorial/generated

Generated SDK endpoints and resources for Metorial API. Contains auto-generated TypeScript interfaces, API clients, and comprehensive type definitions for all Metorial API endpoints.

## Installation

```bash
npm install @metorial/generated
# or
yarn add @metorial/generated
# or
pnpm add @metorial/generated
# or
bun add @metorial/generated
```

## Usage

### Direct API Endpoint Usage

```typescript
import {
  MetorialInstanceEndpoint,
  MetorialSecretsEndpoint,
  MetorialServersEndpoint,
  MetorialSessionsEndpoint
} from '@metorial/generated';

// Create endpoint instances with a manager
let manager = {
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com',
  headers: {}
};

// Instance endpoint
let instanceEndpoint = new MetorialInstanceEndpoint(manager);
let instanceInfo = await instanceEndpoint.get();
console.log('Instance:', instanceInfo);

// Secrets endpoint
let secretsEndpoint = new MetorialSecretsEndpoint(manager);
let secrets = await secretsEndpoint.list();
console.log('Secrets:', secrets);

// Servers endpoint
let serversEndpoint = new MetorialServersEndpoint(manager);
let servers = await serversEndpoint.list();
console.log('Servers:', servers);

// Sessions endpoint
let sessionsEndpoint = new MetorialSessionsEndpoint(manager);
let sessions = await sessionsEndpoint.list();
console.log('Sessions:', sessions);
```

### Nested Endpoint Usage

```typescript
import {
  MetorialServersDeploymentsEndpoint,
  MetorialServersImplementationsEndpoint,
  MetorialServersVariantsEndpoint,
  MetorialServersVersionsEndpoint,
  MetorialServersCapabilitiesEndpoint,
  MetorialServerRunsEndpoint,
  MetorialServerRunErrorsEndpoint
} from '@metorial/generated';

let manager = {
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com',
  headers: {}
};

// Server deployments
let deploymentsEndpoint = new MetorialServersDeploymentsEndpoint(manager);
let deployments = await deploymentsEndpoint.list();
console.log('Deployments:', deployments);

let deployment = await deploymentsEndpoint.get('deployment-id');
console.log('Deployment:', deployment);

let newDeployment = await deploymentsEndpoint.create({
  serverId: 'server-id',
  variantId: 'variant-id',
  versionId: 'version-id'
});
console.log('New deployment:', newDeployment);

// Server implementations
let implementationsEndpoint = new MetorialServersImplementationsEndpoint(manager);
let implementations = await implementationsEndpoint.list();
console.log('Implementations:', implementations);

let implementation = await implementationsEndpoint.get('implementation-id');
console.log('Implementation:', implementation);

let newImplementation = await implementationsEndpoint.create({
  serverId: 'server-id',
  name: 'My Implementation',
  description: 'Custom implementation'
});
console.log('New implementation:', newImplementation);

// Server variants
let variantsEndpoint = new MetorialServersVariantsEndpoint(manager);
let variants = await variantsEndpoint.list();
console.log('Variants:', variants);

let variant = await variantsEndpoint.get('variant-id');
console.log('Variant:', variant);

// Server versions
let versionsEndpoint = new MetorialServersVersionsEndpoint(manager);
let versions = await versionsEndpoint.list();
console.log('Versions:', versions);

let version = await versionsEndpoint.get('version-id');
console.log('Version:', version);

// Server capabilities
let capabilitiesEndpoint = new MetorialServersCapabilitiesEndpoint(manager);
let capabilities = await capabilitiesEndpoint.list();
console.log('Capabilities:', capabilities);

// Server runs
let runsEndpoint = new MetorialServerRunsEndpoint(manager);
let runs = await runsEndpoint.list();
console.log('Runs:', runs);

let run = await runsEndpoint.get('run-id');
console.log('Run:', run);

// Server run errors
let errorsEndpoint = new MetorialServerRunErrorsEndpoint(manager);
let errors = await errorsEndpoint.list();
console.log('Errors:', errors);

let error = await errorsEndpoint.get('error-id');
console.log('Error:', error);
```

### Session-Related Endpoints

```typescript
import {
  MetorialSessionsMessagesEndpoint,
  MetorialSessionsConnectionsEndpoint
} from '@metorial/generated';

let manager = {
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com',
  headers: {}
};

// Session messages
let messagesEndpoint = new MetorialSessionsMessagesEndpoint(manager);
let messages = await messagesEndpoint.list('session-id');
console.log('Messages:', messages);

let message = await messagesEndpoint.get('session-id', 'message-id');
console.log('Message:', message);

// Session connections
let connectionsEndpoint = new MetorialSessionsConnectionsEndpoint(manager);
let connections = await connectionsEndpoint.list('session-id');
console.log('Connections:', connections);

let connection = await connectionsEndpoint.get('session-id', 'connection-id');
console.log('Connection:', connection);
```

### Type Definitions

```typescript
import type {
  SecretsGetOutput,
  SecretsListOutput,
  ServersGetOutput,
  ServersListOutput,
  ServerDeploymentsGetOutput,
  ServerDeploymentsListOutput,
  ServerDeploymentsCreateBody,
  ServerDeploymentsUpdateBody,
  SessionsGetOutput,
  SessionsListOutput,
  SessionsCreateBody,
  SessionMessagesGetOutput,
  SessionMessagesListOutput,
  SessionConnectionsGetOutput,
  SessionConnectionsListOutput
} from '@metorial/generated';

// Use the comprehensive type definitions
let secret: SecretsGetOutput;
let secretsList: SecretsListOutput;
let server: ServersGetOutput;
let serversList: ServersListOutput;
let deployment: ServerDeploymentsGetOutput;
let deploymentsList: ServerDeploymentsListOutput;
let deploymentCreateData: ServerDeploymentsCreateBody;
let deploymentUpdateData: ServerDeploymentsUpdateBody;
let session: SessionsGetOutput;
let sessionsList: SessionsListOutput;
let sessionCreateData: SessionsCreateBody;
let message: SessionMessagesGetOutput;
let messagesList: SessionMessagesListOutput;
let connection: SessionConnectionsGetOutput;
let connectionsList: SessionConnectionsListOutput;
```

### Query Parameters

```typescript
import { MetorialServersDeploymentsEndpoint } from '@metorial/generated';

let manager = {
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com',
  headers: {}
};

let deploymentsEndpoint = new MetorialServersDeploymentsEndpoint(manager);

// List with pagination
let deployments = await deploymentsEndpoint.list({
  limit: 10,
  offset: 0
});
console.log('Paginated deployments:', deployments);

// List with filtering
let filteredDeployments = await deploymentsEndpoint.list({
  serverId: 'specific-server-id',
  status: 'active'
});
console.log('Filtered deployments:', filteredDeployments);

// List with sorting
let sortedDeployments = await deploymentsEndpoint.list({
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
console.log('Sorted deployments:', sortedDeployments);
```

### Error Handling

```typescript
import { MetorialServersEndpoint } from '@metorial/generated';

let manager = {
  apiKey: 'your-metorial-api-key',
  apiHost: 'https://api.metorial.com',
  headers: {}
};

let serversEndpoint = new MetorialServersEndpoint(manager);

try {
  let server = await serversEndpoint.get('invalid-id');
  console.log('Server:', server);
} catch (error) {
  if (error instanceof Error) {
    console.log('Error:', error.message);
  }
  // Handle specific API errors
  if (error.status === 404) {
    console.log('Server not found');
  } else if (error.status === 401) {
    console.log('Unauthorized');
  }
}
```

## API Reference

### Available Endpoints

#### Core Endpoints

- `MetorialInstanceEndpoint`: Instance information
- `MetorialSecretsEndpoint`: Secrets management
- `MetorialServersEndpoint`: Server management
- `MetorialSessionsEndpoint`: Session management

#### Server-Related Endpoints

- `MetorialServersDeploymentsEndpoint`: Server deployments
- `MetorialServersImplementationsEndpoint`: Server implementations
- `MetorialServersVariantsEndpoint`: Server variants
- `MetorialServersVersionsEndpoint`: Server versions
- `MetorialServersCapabilitiesEndpoint`: Server capabilities
- `MetorialServerRunsEndpoint`: Server runs
- `MetorialServerRunErrorsEndpoint`: Server run errors

#### Session-Related Endpoints

- `MetorialSessionsMessagesEndpoint`: Session messages
- `MetorialSessionsConnectionsEndpoint`: Session connections

### Endpoint Methods

Each endpoint provides standard CRUD operations:

- `list(query?)`: List resources with optional query parameters
- `get(id)`: Get a specific resource by ID
- `create(data)`: Create a new resource
- `update(id, data)`: Update an existing resource
- `delete(id)`: Delete a resource (where applicable)

### Type Definitions

The package exports comprehensive TypeScript types for all API resources:

- **Input Types**: Request bodies for create/update operations
- **Output Types**: Response data structures
- **Query Types**: Query parameter structures for list operations
- **List Types**: Paginated list response structures

### Manager Configuration

All endpoints require a manager object with:

```typescript
{
  apiKey: string;
  apiHost?: string;
  headers?: Record<string, string>;
}
```

### Query Parameters

Common query parameters supported by list endpoints:

- `limit`: Number of items to return
- `offset`: Number of items to skip
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction ('asc' or 'desc')
- `filter`: Filter criteria (endpoint-specific)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
