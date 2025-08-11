# @metorial/util-resource-mapper

Resource mapper utilities for Metorial. Provides utilities for transforming data between different formats with bidirectional mapping support.

## Installation

```bash
npm install @metorial/util-resource-mapper
# or
yarn add @metorial/util-resource-mapper
# or
pnpm add @metorial/util-resource-mapper
# or
bun add @metorial/util-resource-mapper
```

## Features

- 🔄 **Bidirectional Mapping**: Transform data in both directions (from/to)
- 🏗️ **Object Mapping**: Map object properties with custom field transformations
- 📅 **Date Handling**: Built-in date transformation utilities
- 📊 **Array Mapping**: Transform arrays with element-level mapping
- 🔀 **Union Types**: Handle union types with conditional mapping
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 🎯 **Zero Dependencies**: Lightweight with no external dependencies

## Usage

### Basic Object Mapping

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Define a mapper for user data
let userMapper = mtMap.object({
  id: mtMap.objectField('user_id', mtMap.passthrough()),
  name: mtMap.objectField('full_name', mtMap.passthrough()),
  email: mtMap.objectField('email_address', mtMap.passthrough()),
  createdAt: mtMap.objectField('created_at', mtMap.date()),
  isActive: mtMap.objectField('active_status', mtMap.passthrough())
});

// Transform from API format to internal format
let apiData = {
  user_id: '123',
  full_name: 'John Doe',
  email_address: 'john@example.com',
  created_at: '2023-01-01T00:00:00Z',
  active_status: true
};

let internalData = userMapper.transformFrom(apiData);
console.log(internalData);
// Output: {
//   id: '123',
//   name: 'John Doe',
//   email: 'john@example.com',
//   createdAt: Date('2023-01-01T00:00:00Z'),
//   isActive: true
// }

// Transform back to API format
let apiDataBack = userMapper.transformTo(internalData);
console.log(apiDataBack);
// Output: {
//   user_id: '123',
//   full_name: 'John Doe',
//   email_address: 'john@example.com',
//   created_at: '2023-01-01T00:00:00Z',
//   active_status: true
// }
```

### Date Mapping

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Date mapper automatically handles string to Date conversion
let dateMapper = mtMap.date();

// String to Date
let dateFromString = dateMapper.transformFrom('2023-01-01T00:00:00Z');
console.log(dateFromString); // Date object

// Date to string
let stringFromDate = dateMapper.transformTo(new Date('2023-01-01'));
console.log(stringFromDate); // ISO string

// Object with date fields
let eventMapper = mtMap.object({
  title: mtMap.objectField('event_title', mtMap.passthrough()),
  startTime: mtMap.objectField('start_time', mtMap.date()),
  endTime: mtMap.objectField('end_time', mtMap.date())
});

let eventData = {
  event_title: 'Team Meeting',
  start_time: '2023-01-01T10:00:00Z',
  end_time: '2023-01-01T11:00:00Z'
};

let transformedEvent = eventMapper.transformFrom(eventData);
console.log(transformedEvent.startTime); // Date object
console.log(transformedEvent.endTime); // Date object
```

### Array Mapping

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Map arrays with element-level transformation
let userMapper = mtMap.object({
  id: mtMap.objectField('user_id', mtMap.passthrough()),
  name: mtMap.objectField('full_name', mtMap.passthrough())
});

let usersArrayMapper = mtMap.array(userMapper);

// Transform array of users
let apiUsers = [
  { user_id: '1', full_name: 'Alice' },
  { user_id: '2', full_name: 'Bob' },
  { user_id: '3', full_name: 'Charlie' }
];

let internalUsers = usersArrayMapper.transformFrom(apiUsers);
console.log(internalUsers);
// Output: [
//   { id: '1', name: 'Alice' },
//   { id: '2', name: 'Bob' },
//   { id: '3', name: 'Charlie' }
// ]

// Transform back
let apiUsersBack = usersArrayMapper.transformTo(internalUsers);
console.log(apiUsersBack);
// Output: [
//   { user_id: '1', full_name: 'Alice' },
//   { user_id: '2', full_name: 'Bob' },
//   { user_id: '3', full_name: 'Charlie' }
// ]
```

### Union Type Mapping

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Handle union types with conditional mapping
let stringOrNumberMapper = mtMap.union([
  mtMap.unionOption('string', value => typeof value === 'string'),
  mtMap.unionOption('number', value => typeof value === 'number')
]);

// Transform union values
let stringValue = stringOrNumberMapper.transformFrom('hello');
let numberValue = stringOrNumberMapper.transformFrom(42);

console.log(stringValue); // { type: 'string', value: 'hello' }
console.log(numberValue); // { type: 'number', value: 42 }

// Complex union with object mapping
let userOrGuestMapper = mtMap.union([
  mtMap.unionOption('user', value => value.type === 'user', userMapper),
  mtMap.unionOption(
    'guest',
    value => value.type === 'guest',
    mtMap.object({
      name: mtMap.objectField('guest_name', mtMap.passthrough()),
      email: mtMap.objectField('guest_email', mtMap.passthrough())
    })
  )
]);

let mixedData = [
  { type: 'user', user_id: '1', full_name: 'Alice' },
  { type: 'guest', guest_name: 'Bob', guest_email: 'bob@example.com' }
];

let transformedMixed = mixedData.map(item => userOrGuestMapper.transformFrom(item));
console.log(transformedMixed);
```

### Nested Object Mapping

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Create nested mappers
let addressMapper = mtMap.object({
  street: mtMap.objectField('street_address', mtMap.passthrough()),
  city: mtMap.objectField('city_name', mtMap.passthrough()),
  zipCode: mtMap.objectField('postal_code', mtMap.passthrough())
});

let profileMapper = mtMap.object({
  bio: mtMap.objectField('user_bio', mtMap.passthrough()),
  website: mtMap.objectField('personal_website', mtMap.passthrough())
});

let userMapper = mtMap.object({
  id: mtMap.objectField('user_id', mtMap.passthrough()),
  name: mtMap.objectField('full_name', mtMap.passthrough()),
  email: mtMap.objectField('email_address', mtMap.passthrough()),
  address: mtMap.objectField('user_address', addressMapper),
  profile: mtMap.objectField('user_profile', profileMapper),
  createdAt: mtMap.objectField('created_at', mtMap.date())
});

// Transform complex nested data
let complexData = {
  user_id: '123',
  full_name: 'John Doe',
  email_address: 'john@example.com',
  user_address: {
    street_address: '123 Main St',
    city_name: 'Anytown',
    postal_code: '12345'
  },
  user_profile: {
    user_bio: 'Software developer',
    personal_website: 'https://johndoe.com'
  },
  created_at: '2023-01-01T00:00:00Z'
};

let transformedUser = userMapper.transformFrom(complexData);
console.log(transformedUser);
// Output: {
//   id: '123',
//   name: 'John Doe',
//   email: 'john@example.com',
//   address: {
//     street: '123 Main St',
//     city: 'Anytown',
//     zipCode: '12345'
//   },
//   profile: {
//     bio: 'Software developer',
//     website: 'https://johndoe.com'
//   },
//   createdAt: Date('2023-01-01T00:00:00Z')
// }
```

### Custom Mappers

```typescript
import { mtMap } from '@metorial/util-resource-mapper';

// Create custom mappers
let emailMapper = {
  transformFrom: (input: string) => input.toLowerCase(),
  transformTo: (input: string) => input.toLowerCase()
};

let phoneMapper = {
  transformFrom: (input: string) => input.replace(/\D/g, ''), // Remove non-digits
  transformTo: (input: string) => input.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') // Format
};

let contactMapper = mtMap.object({
  email: mtMap.objectField('contact_email', emailMapper),
  phone: mtMap.objectField('contact_phone', phoneMapper)
});

let contactData = {
  contact_email: 'JOHN@EXAMPLE.COM',
  contact_phone: '(555) 123-4567'
};

let transformedContact = contactMapper.transformFrom(contactData);
console.log(transformedContact);
// Output: {
//   email: 'john@example.com',
//   phone: '5551234567'
// }
```

## API Reference

### `mtMap.object(properties)`

Creates an object mapper that transforms object properties.

**Parameters:**

- `properties`: Record of field mappings

**Returns:** Object mapper with `transformFrom` and `transformTo` methods

### `mtMap.objectField(fromKey, mapper)`

Creates a field mapping configuration.

**Parameters:**

- `fromKey`: Source field name
- `mapper`: Mapper for the field value

**Returns:** Field mapping configuration

### `mtMap.date()`

Creates a date mapper that converts between strings and Date objects.

**Returns:** Date mapper

### `mtMap.array(elementMapper)`

Creates an array mapper that applies element-level transformation.

**Parameters:**

- `elementMapper`: Mapper for array elements

**Returns:** Array mapper

### `mtMap.union(options)`

Creates a union mapper for handling different types.

**Parameters:**

- `options`: Array of union options

**Returns:** Union mapper

### `mtMap.unionOption(type, predicate, mapper?)`

Creates a union option configuration.

**Parameters:**

- `type`: Option type name
- `predicate`: Function to determine if value matches this option
- `mapper`: Optional mapper for the option

**Returns:** Union option configuration

### `mtMap.passthrough()`

Creates a passthrough mapper that doesn't transform values.

**Returns:** Passthrough mapper

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
