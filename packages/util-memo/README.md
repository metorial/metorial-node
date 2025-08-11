# @metorial/util-memo

Memoization utilities for Metorial. Provides a simple and efficient memoization function for caching function results based on input parameters.

## Installation

```bash
npm install @metorial/util-memo
# or
yarn add @metorial/util-memo
# or
pnpm add @metorial/util-memo
# or
bun add @metorial/util-memo
```

## Features

- 🚀 **Simple Memoization**: Easy-to-use memoization wrapper for any function
- 💾 **Automatic Caching**: Automatically caches results based on function arguments
- 🔍 **Exact Match**: Uses exact argument matching for cache lookups
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎯 **Zero Dependencies**: Lightweight with no external dependencies

## Usage

### Basic Memoization

```typescript
import { memo } from '@metorial/util-memo';

// Expensive function that we want to memoize
let expensiveCalculation = (a: number, b: number) => {
  console.log('Computing...');
  return a * b + Math.sqrt(a + b);
};

// Create a memoized version
let memoizedCalculation = memo(expensiveCalculation);

// First call - computes the result
console.log(memoizedCalculation(5, 3)); // Output: Computing... 18.82842712474619

// Second call with same arguments - returns cached result
console.log(memoizedCalculation(5, 3)); // Output: 18.82842712474619 (no "Computing..." log)

// Different arguments - computes new result
console.log(memoizedCalculation(10, 2)); // Output: Computing... 22.449489742783178
```

### API Calls with Memoization

```typescript
import { memo } from '@metorial/util-memo';

// Simulate an API call
let fetchUserData = async (userId: string) => {
  console.log(`Fetching user ${userId}...`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
};

// Create memoized version
let memoizedFetchUser = memo(fetchUserData);

// Usage
async function getUserData() {
  // First call - makes actual API request
  let user1 = await memoizedFetchUser('123');
  console.log(user1);

  // Second call with same ID - returns cached result instantly
  let user2 = await memoizedFetchUser('123');
  console.log(user2); // Same result, no API call

  // Different ID - makes new API request
  let user3 = await memoizedFetchUser('456');
  console.log(user3);
}
```

### Complex Object Memoization

```typescript
import { memo } from '@metorial/util-memo';

interface SearchParams {
  query: string;
  filters: {
    category: string[];
    status: string;
  };
  page: number;
  limit: number;
}

let searchProducts = (params: SearchParams) => {
  console.log('Searching products with params:', params);
  // Simulate complex search logic
  return {
    results: [`Product for ${params.query}`],
    total: 100,
    page: params.page
  };
};

let memoizedSearch = memo(searchProducts);

// First search
let result1 = memoizedSearch({
  query: 'laptop',
  filters: { category: ['electronics'], status: 'active' },
  page: 1,
  limit: 10
});

// Same search - returns cached result
let result2 = memoizedSearch({
  query: 'laptop',
  filters: { category: ['electronics'], status: 'active' },
  page: 1,
  limit: 10
});

// Different search - computes new result
let result3 = memoizedSearch({
  query: 'phone',
  filters: { category: ['electronics'], status: 'active' },
  page: 1,
  limit: 10
});
```

### React Component Optimization

```typescript
import { memo } from '@metorial/util-memo';

// Expensive computation in a React component
let calculateChartData = (data: number[], options: { width: number; height: number }) => {
  console.log('Calculating chart data...');
  // Simulate expensive computation
  return data.map((value, index) => ({
    x: (index / data.length) * options.width,
    y: (value / Math.max(...data)) * options.height
  }));
};

let memoizedChartData = memo(calculateChartData);

// In your React component
function ChartComponent({ data, width, height }) {
  // This will only recalculate when data, width, or height change
  let chartData = memoizedChartData(data, { width, height });

  return (
    <svg width={width} height={height}>
      {chartData.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2"
          fill="blue"
        />
      ))}
    </svg>
  );
}
```

### Cache Management

```typescript
import { memo } from '@metorial/util-memo';

let expensiveFunction = (x: number) => {
  console.log(`Computing for ${x}`);
  return x * x + Math.sqrt(x);
};

let memoizedFn = memo(expensiveFunction);

// Cache some results
memoizedFn(1); // Caches result for [1]
memoizedFn(2); // Caches result for [2]
memoizedFn(3); // Caches result for [3]

// Access the cache (for debugging or management)
console.log(memoizedFn.cache); // Array of cached results

// Clear cache by reassigning
memoizedFn = memo(expensiveFunction);
```

## API Reference

### `memo<T extends (...args: any[]) => any>(func: T)`

Creates a memoized version of the provided function.

**Parameters:**

- `func`: The function to memoize

**Returns:** A memoized function with the same signature as the original

**Behavior:**

- Caches results based on exact argument matching
- Returns cached result if same arguments are provided again
- Computes and caches new result for different arguments
- Maintains the same return type as the original function

**Cache Strategy:**

- Uses an array to store cached results
- Each cache entry contains the arguments and result
- Performs exact matching on all arguments
- No automatic cache expiration (cache persists for lifetime of memoized function)

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
