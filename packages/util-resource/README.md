# @metorial/util-resource

Resource utilities for Metorial. Provides utilities for creating and managing typed resources with attribute mapping and pagination support.

## Installation

```bash
npm install @metorial/util-resource
# or
yarn add @metorial/util-resource
# or
pnpm add @metorial/util-resource
# or
bun add @metorial/util-resource
```

## Usage

### Creating Resource Factories

```typescript
import { createMetorialResource } from '@metorial/util-resource';

// Define your resource type
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// Create a resource factory with attribute mapping
let userResource = createMetorialResource<User>()({
  name: 'User',
  attributes: {
    id: 'id',
    name: 'name',
    email: 'email',
    created_at: 'createdAt' // Map from snake_case to camelCase
  },
  attributeMappers: {
    created_at: (value: string) => new Date(value), // Transform string to Date
    email: (value: string) => value.toLowerCase() // Transform email to lowercase
  }
});

// Use the factory to transform data
let user = userResource({
  id: '123',
  name: 'John Doe',
  email: 'JOHN@EXAMPLE.COM',
  created_at: '2023-01-01T00:00:00Z'
});

console.log(user);
// Output: {
//   __typename: 'User',
//   id: '123',
//   name: 'John Doe',
//   email: 'john@example.com',
//   createdAt: Date('2023-01-01T00:00:00Z')
// }
```

### Paginated Resources

```typescript
import { createPaginatedMetorialResource } from '@metorial/util-resource';

// Create a paginated resource factory
let paginatedUsers = createPaginatedMetorialResource(userResource);

// Use with paginated API response
let response = {
  items: [
    {
      id: '1',
      name: 'User 1',
      email: 'user1@example.com',
      created_at: '2023-01-01T00:00:00Z'
    },
    { id: '2', name: 'User 2', email: 'user2@example.com', created_at: '2023-01-02T00:00:00Z' }
  ],
  pagination: {
    afterCursor: 'cursor_123',
    beforeCursor: null,
    hasMoreBefore: false,
    hasMoreAfter: true,
    pageSize: 10
  }
};

let paginatedResult = paginatedUsers(response);
console.log(paginatedResult);
// Output: {
//   __typename: 'paginated_list',
//   items: [/* transformed user objects */],
//   pagination: { /* pagination info */ }
// }
```

### Filter Types

```typescript
import { StringFilter, NumberFilter, DateFilter } from '@metorial/util-resource';

// String filters
let nameFilter: StringFilter = 'John'; // exact match
let nameFilterIn: StringFilter = { in: ['John', 'Jane'] }; // in array
let nameFilterEq: StringFilter = { eq: 'John' }; // explicit equals

// Number filters
let ageFilter: NumberFilter = 25; // exact match
let ageRange: NumberFilter = { gt: 18, lt: 65 }; // range
let ageIn: NumberFilter = { in: [25, 30, 35] }; // in array

// Date filters
let dateFilter: DateFilter = new Date('2023-01-01'); // exact match
let dateRange: DateFilter = { gte: new Date('2023-01-01'), lt: new Date('2023-12-31') }; // range
```

## API Reference

### `createMetorialResource<T>()`

Creates a resource factory for type `T`.

**Parameters:**

- `opts.name`: The resource type name
- `opts.attributes`: Mapping from input keys to output keys
- `opts.attributeMappers`: Functions to transform attribute values

**Returns:** A resource factory function that transforms input data

### `createPaginatedMetorialResource<T>(resource)`

Creates a paginated resource factory from a resource factory.

**Parameters:**

- `resource`: A resource factory created with `createMetorialResource`

**Returns:** A paginated resource factory function

### Filter Types

- `StringFilter<T>`: String comparison filters
- `NumberFilter<T>`: Numeric comparison filters
- `BooleanFilter<T>`: Boolean comparison filters
- `DateFilter<T>`: Date comparison filters

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
