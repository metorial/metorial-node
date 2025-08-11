# @metorial/util-react-fetch

React fetch utilities for Metorial. Provides React-specific hooks and utilities for data fetching, state management, and mutation handling with automatic caching, polling, and error management.

## Installation

```bash
npm install @metorial/util-react-fetch
# or
yarn add @metorial/util-react-fetch
# or
pnpm add @metorial/util-react-fetch
# or
bun add @metorial/util-react-fetch
```

## Usage

### Basic Data Loading

```typescript
import { createLoader } from '@metorial/util-react-fetch';

// Create a loader for user data
let userLoader = createLoader({
  name: 'user',
  fetch: async (userId: string) => {
    let response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  hash: (userId: string) => `user-${userId}`,
  mutators: {
    updateUser: async (data: { name: string }, ctx) => {
      let response = await fetch(`/api/users/${ctx.input}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update user');
      let updatedUser = await response.json();

      // Optimistically update the cache
      ctx.setOutput(updatedUser);
      return updatedUser;
    }
  }
});

// Use in a React component
function UserProfile({ userId }: { userId: string }) {
  let { data: user, error, isLoading, mutators } = userLoader.use(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={() => mutators.updateUser({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### Advanced Loading with Polling

```typescript
import { createLoader } from '@metorial/util-react-fetch';

// Create a loader with polling for real-time data
let stockPriceLoader = createLoader({
  name: 'stock-price',
  fetch: async (symbol: string) => {
    let response = await fetch(`/api/stocks/${symbol}/price`);
    if (!response.ok) throw new Error('Failed to fetch stock price');
    return response.json();
  },
  hash: (symbol: string) => `stock-${symbol}`,
  polling: {
    interval: 30000 // Refresh every 30 seconds
  },
  onSuccess: (data) => {
    console.log(`Stock price updated: ${data.price}`);
  },
  onError: (error) => {
    console.error('Failed to fetch stock price:', error);
  }
});

function StockPrice({ symbol }: { symbol: string }) {
  let { data, error, isLoading } = stockPriceLoader.use(symbol);

  if (isLoading) return <div>Loading price...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>{symbol}</h2>
      <p>Price: ${data?.price}</p>
      <p>Last updated: {data?.timestamp}</p>
    </div>
  );
}
```

### Mutation Hooks

```typescript
import { useMutation } from '@metorial/util-react-fetch';

function CreateUserForm() {
  let createUserMutation = useMutation(
    async (userData: { name: string; email: string }) => {
      let response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    }
  );

  let handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    let formData = new FormData(event.target as HTMLFormElement);

    let [user, error] = await createUserMutation.mutate({
      name: formData.get('name') as string,
      email: formData.get('email') as string
    });

    if (error) {
      console.error('Failed to create user:', error);
    } else {
      console.log('User created:', user);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={createUserMutation.isLoading}>
        {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
      </button>

      {createUserMutation.isSuccess && (
        <div className="success">User created successfully!</div>
      )}

      <createUserMutation.RenderError component={ErrorDisplay} />
    </form>
  );
}

function ErrorDisplay({ children }: { children: string }) {
  return <div className="error">{children}</div>;
}
```

### Complex Data Relationships

```typescript
import { createLoader } from '@metorial/util-react-fetch';

// Create loaders with parent-child relationships
let postsLoader = createLoader({
  name: 'posts',
  fetch: async (userId: string) => {
    let response = await fetch(`/api/users/${userId}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
  hash: (userId: string) => `posts-${userId}`,
  mutators: {
    createPost: async (data: { title: string; content: string }, ctx) => {
      let response = await fetch(`/api/users/${ctx.input}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    }
  }
});

let userLoader = createLoader({
  name: 'user',
  fetch: async (userId: string) => {
    let response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  hash: (userId: string) => `user-${userId}`,
  parents: [postsLoader] // When user data changes, refetch posts
});

function UserDashboard({ userId }: { userId: string }) {
  let { data: user, error: userError } = userLoader.use(userId);
  let { data: posts, error: postsError, mutators } = postsLoader.use(userId);

  if (userError) return <div>Error loading user: {userError.message}</div>;
  if (postsError) return <div>Error loading posts: {postsError.message}</div>;
  if (!user || !posts) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}'s Dashboard</h1>

      <h2>Posts ({posts.length})</h2>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}

      <button onClick={() => mutators.createPost({
        title: 'New Post',
        content: 'Post content'
      })}>
        Create Post
      </button>
    </div>
  );
}
```

### Global Error and Toast Handlers

```typescript
import { setMetorialReactHandlersGlobal } from '@metorial/util-react-fetch';

// Set up global error and toast handlers
setMetorialReactHandlersGlobal({
  onError: (error) => {
    console.error('Global error:', error);
    // Send to error tracking service
    analytics.track('error', { message: error.message });
  },
  onToast: (level, message) => {
    // Integrate with your toast library
    if (level === 'error') {
      toast.error(message);
    } else if (level === 'success') {
      toast.success(message);
    } else {
      toast.info(message);
    }
  }
});

// Use in your app
function App() {
  return (
    <div>
      <UserProfile userId="123" />
      <StockPrice symbol="AAPL" />
    </div>
  );
}
```

### Manual Data Fetching

```typescript
import { createLoader } from '@metorial/util-react-fetch';

let userLoader = createLoader({
  name: 'user',
  fetch: async (userId: string) => {
    let response = await fetch(`/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  hash: (userId: string) => `user-${userId}`
});

// Manual fetching outside of React components
async function fetchUserData(userId: string) {
  // Fetch and wait for data
  let user = await userLoader.waitFor(userId);
  console.log('User data:', user);

  // Or fetch and return immediately
  let state = await userLoader.fetch(userId);
  console.log('Current state:', state.value);

  // Subscribe to changes
  let unsubscribe = userLoader.subscribe(userId, state => {
    console.log('State changed:', state);
  });

  // Clean up subscription
  unsubscribe();
}
```

## API Reference

### `createLoader(options)`

Creates a data loader with caching, polling, and mutation support.

**Parameters:**

- `options.name`: Unique name for the loader
- `options.fetch`: Function to fetch data
- `options.hash`: Function to generate cache keys
- `options.polling`: Optional polling configuration
- `options.mutators`: Optional mutation functions
- `options.onError`: Optional error handler
- `options.onSuccess`: Optional success handler
- `options.parents`: Optional parent loaders for refetching

**Returns:** Loader object with `use`, `fetch`, `waitFor`, etc.

### `useMutation(mutator, options?)`

Creates a mutation hook for handling data mutations.

**Parameters:**

- `mutator`: Function that performs the mutation
- `options.disableToast`: Whether to disable automatic toast notifications

**Returns:** Mutation object with `mutate`, `isLoading`, `error`, etc.

### `setMetorialReactHandlersGlobal(handlers)`

Sets up global error and toast handlers.

**Parameters:**

- `handlers.onError`: Global error handler
- `handlers.onToast`: Global toast handler

### Loader Instance Methods

- `use(input)`: React hook for using the loader
- `fetch(input)`: Manually fetch data
- `waitFor(input)`: Wait for data to be available
- `getState(input)`: Get current state
- `subscribe(input, callback)`: Subscribe to state changes
- `refetchAll()`: Refetch all active instances

### Mutation Hook Properties

- `mutate(input)`: Execute the mutation
- `isLoading`: Whether mutation is in progress
- `isSuccess`: Whether last mutation was successful
- `error`: Error from last mutation
- `data`: Data from last successful mutation
- `RenderError`: Component for rendering errors

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
