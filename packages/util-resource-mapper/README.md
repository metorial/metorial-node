# Compact generated mappers

Generated TypeScript SDKs import `mapObject<T>(fields)` and `createMapper<T>(descriptor)` from
`@metorial/util-resource-mapper/compact`. Both return a `MetorialMapper<T>` with `transformFrom`
(wire → SDK) and `transformTo` (SDK → wire). The compact entry point is independent of the legacy
builders documented below, so a bundle using only compact mappers excludes the legacy runtime.

```typescript
import { mapObject } from '@metorial/util-resource-mapper/compact';

export let mapper = /* @__PURE__ */ mapObject([
  'network_policies',
  ['created_at', 1, 4],
  ['rules', 0, [2, [1, [['custom_special_name', 'customSPECIALname']]]]]
]);
```

Descriptors:

| Descriptor        | Operation       |
| ----------------- | --------------- |
| `0`               | Identity        |
| `4`               | Date conversion |
| `[1, fields]`     | Object          |
| `[2, descriptor]` | Array elements  |
| `[3, branches]`   | Union           |

An object field is a string for an automatic rename, `[source, target]` for a rename only, or
`[source, target, descriptor]` for a rename and/or value transformation. Tuple targets are an
explicit string, `0` to keep the source name, or `1` for snake case to camel case. Automatic
renaming replaces underscore-plus-lowercase-letter with the uppercase letter; the generator
uses it only for canonical snake case names whose result matches its SDK naming rules.
Other names use explicit targets. Unlisted fields retain both their names and their values.

Union branches are `[kind, descriptor]`, where kinds are `0` object, `1` array, `2` Date instance,
`3` string, `4` number, and `5` boolean. A date branch uses descriptor `4`. Strings and numbers
use their explicit branches first; when that branch is absent, a date branch may parse a valid
string or timestamp. Unmatched values and invalid dates pass through. Date conversion is the
same in both directions, preserving existing Date instances; serialization remains the caller's
responsibility. Arrays map their elements, including nested arrays and heterogeneous unions.

Identity mappings reuse the original object or array. Mappings that transform a container create
a copy without mutating input. Empty arrays, null, undefined, missing fields, and incompatible
input types pass through. Only own enumerable string fields are mapped. Unknown fields remain
untouched and take precedence when they collide with a mapped destination. Rename chains and
swaps read from the original input. Records and arbitrary JSON are not recursively mapped.

The generator rejects schema fields that normalize to the same SDK property, including conflicts
between merged union object alternatives. Existing legacy builders and custom mappers retain
their API and behavior.

## Date defaults and generic patterns (3.2.0)

Both `mapObject(fields, flags = 0)` and `createMapper(descriptor, flags = 0)` accept an optional
numeric flags argument. Bit `1` enables date conversion by default for **listed** source fields
ending in `_at` when their value descriptor is omitted. Existing calls without the flag keep
their 3.1.0 behavior. Defaults propagate through nested objects, arrays, unions, and list items.

```typescript
let output = mapObject(['created_at', ['pagination', 0, 6]], 1);
let query = mapObject([['created_at', 1, 5]], 1);
let logs = mapObject(
  [
    ['first_seen_at', 1, 0],
    ['metadata_at', 1, 0]
  ],
  1
);
let list = createMapper([7, 8]);
```

Explicit descriptors override the default: `['first_seen_at', 1, 0]` renames the field without
parsing its string value; `['metadata_at', 1, 0]` preserves the raw record, including all nested
keys and values. Unlisted fields, records, and arbitrary JSON are never scanned for `_at` keys.
The generator omits the flags argument when the descriptor does not use inferred dates.

| Descriptor            | Canonical mapping                                                 |
| --------------------- | ----------------------------------------------------------------- |
| `5`                   | Object with date-converted `gt` and `lt` fields                   |
| `6`                   | Object renaming `has_more_before` and `has_more_after`            |
| `[7, itemDescriptor]` | Object mapping each `items` element and standard pagination       |
| `8`                   | Object renaming and date-converting `created_at` and `updated_at` |

Special descriptors expand into the normal mapping engine at construction; `5`, `6`, and `8`
share cached compiled plans. They work without the date-default flag and preserve the normal
handling of unknown fields, nullable/missing values, collisions, and input immutability.
No pattern detection occurs while transforming payloads. Descriptor IDs are stable; unknown
numeric descriptors throw during construction.

---

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
