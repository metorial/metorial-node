# @metorial/fetch

Fetch utilities for Metorial. Provides enhanced fetch functionality with automatic retries, timeout handling, rate limiting support, and configurable backoff strategies.

## Installation

```bash
npm install @metorial/fetch
# or
yarn add @metorial/fetch
# or
pnpm add @metorial/fetch
# or
bun add @metorial/fetch
```

## Usage

### Basic Fetch with Retries

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

// Create a fetch function with retry capabilities
let fetchWithRetry = createFetchWithRetry({
  retries: 3,
  baseDelayMs: 1000,
  timeoutMs: 5000
});

// Use it like regular fetch
async function fetchUserData(userId: string) {
  try {
    let response = await fetchWithRetry(`https://api.example.com/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
}
```

### Advanced Configuration

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

// Configure with all options
let fetchWithRetry = createFetchWithRetry({
  retries: 5, // Maximum number of retry attempts
  baseDelayMs: 2000, // Base delay between retries
  timeoutMs: 10000, // Request timeout in milliseconds
  backoffStrategy: 'exponential', // 'linear' or 'exponential'
  respectRateLimitReset: true // Respect RateLimit-Reset headers
});

// Use for API calls
async function makeApiCall(endpoint: string, options?: RequestInit) {
  let response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer your-token'
    },
    body: JSON.stringify({ data: 'example' }),
    ...options
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
}
```

### Rate Limiting Support

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

// Configure to respect rate limits
let fetchWithRetry = createFetchWithRetry({
  retries: 3,
  respectRateLimitReset: true, // Automatically wait for rate limit reset
  timeoutMs: 30000 // Longer timeout for rate-limited requests
});

async function fetchWithRateLimitHandling(url: string) {
  try {
    let response = await fetchWithRetry(url);

    // Check rate limit headers
    let remaining = response.headers.get('X-RateLimit-Remaining');
    let reset = response.headers.get('X-RateLimit-Reset');

    console.log(`Rate limit remaining: ${remaining}`);
    console.log(`Rate limit resets at: ${reset}`);

    return await response.json();
  } catch (error) {
    if (error.message.includes('429')) {
      console.log('Rate limited - request will be retried automatically');
    }
    throw error;
  }
}
```

### Different Backoff Strategies

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

// Linear backoff: 1s, 2s, 3s, 4s, 5s
let linearFetch = createFetchWithRetry({
  retries: 5,
  baseDelayMs: 1000,
  backoffStrategy: 'linear'
});

// Exponential backoff: 1s, 2s, 4s, 8s, 16s
let exponentialFetch = createFetchWithRetry({
  retries: 5,
  baseDelayMs: 1000,
  backoffStrategy: 'exponential'
});

// Use for different types of requests
async function fetchData() {
  // Use linear backoff for simple requests
  let simpleData = await linearFetch('https://api.example.com/simple');

  // Use exponential backoff for complex requests
  let complexData = await exponentialFetch('https://api.example.com/complex');
}
```

### Error Handling Examples

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

let fetchWithRetry = createFetchWithRetry({
  retries: 3,
  timeoutMs: 5000
});

async function robustApiCall(url: string) {
  try {
    let response = await fetchWithRetry(url);

    // Handle different response statuses
    if (response.status === 404) {
      throw new Error('Resource not found');
    }

    if (response.status === 403) {
      throw new Error('Access forbidden');
    }

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - check your connection');
    } else if (error.message.includes('timeout')) {
      console.error('Request timed out');
    } else if (error.message.includes('429')) {
      console.error('Rate limited');
    } else {
      console.error('Request failed:', error.message);
    }

    throw error;
  }
}
```

### Custom Request Wrapper

```typescript
import { createFetchWithRetry } from '@metorial/fetch';

class ApiClient {
  private fetchWithRetry: ReturnType<typeof createFetchWithRetry>;
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;

    this.fetchWithRetry = createFetchWithRetry({
      retries: 3,
      baseDelayMs: 1000,
      timeoutMs: 10000,
      respectRateLimitReset: true
    });
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    let url = `${this.baseUrl}${endpoint}`;

    let config: RequestInit = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    let response = await this.fetchWithRetry(url, config);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Usage
let apiClient = new ApiClient('https://api.example.com', 'your-api-key');

try {
  let users = await apiClient.get('/users');
  let newUser = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });
} catch (error) {
  console.error('API call failed:', error);
}
```

## API Reference

### `createFetchWithRetry(options?)`

Creates an enhanced fetch function with retry capabilities.

**Parameters:**

- `options`: Configuration options (optional)

**Options:**

- `retries`: Maximum number of retry attempts (default: 5)
- `baseDelayMs`: Base delay between retries in milliseconds (default: 1000)
- `timeoutMs`: Request timeout in milliseconds (default: 10000)
- `backoffStrategy`: Backoff strategy ('linear' | 'exponential', default: 'linear')
- `respectRateLimitReset`: Whether to respect RateLimit-Reset headers (default: true)

**Returns:** Enhanced fetch function with the same signature as global fetch

### Retry Behavior

- **Linear Backoff**: Delay increases linearly (baseDelay, baseDelay*2, baseDelay*3, ...)
- **Exponential Backoff**: Delay increases exponentially (baseDelay, baseDelay*2, baseDelay*4, ...)
- **Rate Limiting**: Automatically waits for rate limit reset when `respectRateLimitReset` is true
- **Timeout**: Each request has a configurable timeout
- **Error Handling**: Retries on network errors and non-2xx responses (except 400)

### Rate Limit Support

The enhanced fetch function automatically handles rate limiting by:

- Detecting 429 status codes
- Reading `RateLimit-Reset` headers
- Waiting for the specified reset time before retrying
- Continuing with normal retry logic after rate limit reset

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
