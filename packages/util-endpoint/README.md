# @metorial/util-endpoint

HTTP endpoint utilities for Metorial. Provides a comprehensive HTTP client with request/response handling, query string management, error handling, and automatic retries.

## Installation

```bash
npm install @metorial/util-endpoint
# or
yarn add @metorial/util-endpoint
# or
pnpm add @metorial/util-endpoint
# or
bun add @metorial/util-endpoint
```

## Usage

### Basic HTTP Client

```typescript
import { MetorialEndpointManager } from '@metorial/util-endpoint';

// Create an endpoint manager
let endpointManager = new MetorialEndpointManager(
  { apiKey: 'your-api-key' }, // config
  'https://api.example.com', // apiHost
  config => ({
    // getHeaders function
    Authorization: `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  }),
  undefined, // fetchImpl (uses global fetch)
  { enableDebugLogging: false } // options
);

// Make requests
let user = await endpointManager
  ._get({
    path: ['users', '123'],
    query: { include: 'profile' }
  })
  .transform(userResource);

let newUser = await endpointManager
  ._post({
    path: 'users',
    body: { name: 'John Doe', email: 'john@example.com' }
  })
  .transform(userResource);
```

### Creating Custom Endpoint Classes

```typescript
import { BaseMetorialEndpoint, MetorialEndpointManager } from '@metorial/util-endpoint';

class UsersEndpoint extends BaseMetorialEndpoint<{ apiKey: string }> {
  async getUser(id: string) {
    return this._get({
      path: ['users', id]
    }).transform(userResource);
  }

  async createUser(userData: { name: string; email: string }) {
    return this._post({
      path: 'users',
      body: userData
    }).transform(userResource);
  }

  async updateUser(id: string, updates: Partial<{ name: string; email: string }>) {
    return this._patch({
      path: ['users', id],
      body: updates
    }).transform(userResource);
  }

  async deleteUser(id: string) {
    return this._delete({
      path: ['users', id]
    });
  }

  async listUsers(params: { page?: number; limit?: number; search?: string }) {
    return this._get({
      path: 'users',
      query: params
    }).transform(paginatedUserResource);
  }
}

// Usage
let endpointManager = new MetorialEndpointManager(
  { apiKey: 'your-api-key' },
  'https://api.example.com',
  config => ({ Authorization: `Bearer ${config.apiKey}` }),
  undefined,
  { enableDebugLogging: true }
);

let usersEndpoint = new UsersEndpoint(endpointManager);

// Use the endpoint
let user = await usersEndpoint.getUser('123');
let users = await usersEndpoint.listUsers({ page: 1, limit: 10 });
```

### Error Handling

```typescript
import { MetorialSDKError } from '@metorial/util-endpoint';

try {
  let user = await endpointManager
    ._get({
      path: ['users', 'invalid-id']
    })
    .transform(userResource);
} catch (error) {
  if (error instanceof MetorialSDKError) {
    console.log('API Error:', error.message);
    console.log('Status:', error.status);
    console.log('Code:', error.code);

    if (error.status === 404) {
      console.log('User not found');
    } else if (error.status === 429) {
      console.log('Rate limited - retry later');
    }
  } else {
    console.log('Network error:', error.message);
  }
}
```

### Query String Handling

```typescript
// Complex query parameters are automatically serialized
let response = await endpointManager._get({
  path: 'search',
  query: {
    q: 'metorial',
    filters: {
      category: ['api', 'sdk'],
      status: 'active'
    },
    sort: {
      field: 'created_at',
      direction: 'desc'
    },
    page: 1,
    limit: 20
  }
});

// Results in: /search?q=metorial&filters[category][]=api&filters[category][]=sdk&filters[status]=active&sort[field]=created_at&sort[direction]=desc&page=1&limit=20
```

### Custom Request Configuration

```typescript
// Custom headers for specific requests
let response = await endpointManager._post({
  path: 'upload',
  headers: {
    'Content-Type': 'multipart/form-data',
    'X-Custom-Header': 'custom-value'
  },
  body: formData
});

// Custom host for specific requests
let response = await endpointManager._get({
  path: 'external-data',
  host: 'https://external-api.com',
  headers: {
    'X-API-Key': 'external-api-key'
  }
});
```

## API Reference

### `MetorialEndpointManager<Config>`

#### Constructor

```typescript
new MetorialEndpointManager(
  config: Config,
  apiHost: string,
  getHeaders: (config: Config) => Record<string, string>,
  fetchImpl?: typeof fetch,
  options?: { enableDebugLogging: boolean }
)
```

#### Methods

- `_get(request: MetorialRequest)` - Make a GET request
- `_post(request: MetorialRequest)` - Make a POST request
- `_put(request: MetorialRequest)` - Make a PUT request
- `_patch(request: MetorialRequest)` - Make a PATCH request
- `_delete(request: MetorialRequest)` - Make a DELETE request

### `BaseMetorialEndpoint<Config>`

Base class for creating typed endpoint classes.

### `MetorialRequest`

```typescript
interface MetorialRequest {
  path: string | string[];
  host?: string;
  query?: Record<string, any>;
  body?: Record<string, any> | FormData;
  headers?: Record<string, string>;
}
```

### `MetorialSDKError`

Custom error class for API errors with additional properties:

- `status`: HTTP status code
- `code`: Error code
- `message`: Error message

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
