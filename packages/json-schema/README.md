# @metorial/json-schema

JSON Schema utilities for Metorial. Provides utilities for converting between JSON Schema and OpenAPI Schema formats with comprehensive type support.

## Installation

```bash
npm install @metorial/json-schema
# or
yarn add @metorial/json-schema
# or
pnpm add @metorial/json-schema
# or
bun add @metorial/json-schema
```

## Usage

### Basic Schema Conversion

```typescript
import { jsonSchemaToOpenApi } from '@metorial/json-schema';

// JSON Schema definition
let jsonSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'User ID'
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      description: 'User name'
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'User email address'
    },
    age: {
      type: 'number',
      minimum: 0,
      maximum: 150,
      description: 'User age'
    },
    isActive: {
      type: 'boolean',
      default: true,
      description: 'Whether the user is active'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      },
      uniqueItems: true,
      description: 'User tags'
    }
  },
  required: ['id', 'name', 'email']
};

// Convert to OpenAPI Schema
let openApiSchema = jsonSchemaToOpenApi(jsonSchema);

console.log(JSON.stringify(openApiSchema, null, 2));
```

### Handling Null Types

```typescript
import { jsonSchemaToOpenApi } from '@metorial/json-schema';

// JSON Schema with null types
let jsonSchema = {
  type: ['string', 'null'],
  description: 'Optional string that can be null'
};

// Convert with different null handling strategies
let nullableResult = jsonSchemaToOpenApi(jsonSchema, {
  nullHandling: 'nullable' // Default - converts to nullable: true
});

let removeResult = jsonSchemaToOpenApi(jsonSchema, {
  nullHandling: 'remove' // Removes null type entirely
});

let preserveResult = jsonSchemaToOpenApi(jsonSchema, {
  nullHandling: 'preserve' // Keeps type: null (OpenAPI 3.1+)
});

console.log('Nullable:', nullableResult);
// Output: { type: 'string', nullable: true }

console.log('Remove:', removeResult);
// Output: { type: 'string' }

console.log('Preserve:', preserveResult);
// Output: { type: 'null' }
```

### Complex Schema Conversion

```typescript
import { jsonSchemaToOpenApi } from '@metorial/json-schema';

// Complex JSON Schema with references and composition
let jsonSchema = {
  type: 'object',
  properties: {
    user: {
      $ref: '#/$defs/User'
    },
    metadata: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      }
    },
    permissions: {
      type: 'array',
      items: {
        anyOf: [
          { type: 'string', enum: ['read', 'write', 'admin'] },
          { $ref: '#/$defs/CustomPermission' }
        ]
      }
    }
  },
  $defs: {
    User: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' }
      },
      required: ['id', 'name']
    },
    CustomPermission: {
      type: 'object',
      properties: {
        action: { type: 'string' },
        resource: { type: 'string' }
      },
      required: ['action', 'resource']
    }
  }
};

// Convert with OpenAPI 3.1.0 target
let openApiSchema = jsonSchemaToOpenApi(jsonSchema, {
  openApiVersion: '3.1.0',
  preserveJsonSchemaKeywords: false
});

console.log(JSON.stringify(openApiSchema, null, 2));
```

### API Response Schema Conversion

```typescript
import { jsonSchemaToOpenApi } from '@metorial/json-schema';

// API response schema
let responseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: ['string', 'null'],
            format: 'date-time'
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            default: []
          }
        },
        required: ['id', 'title', 'content', 'createdAt']
      }
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        total: { type: 'integer', minimum: 0 },
        hasMore: { type: 'boolean' }
      },
      required: ['page', 'limit', 'total', 'hasMore']
    }
  },
  required: ['data', 'pagination']
};

let openApiResponse = jsonSchemaToOpenApi(responseSchema);
```

### Type Definitions

```typescript
import type { JsonSchema, OpenApiSchema } from '@metorial/json-schema';

// Use the type definitions for your own schemas
let myJsonSchema: JsonSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    }
  }
};

let myOpenApiSchema: OpenApiSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    }
  }
};
```

## API Reference

### `jsonSchemaToOpenApi(jsonSchema, options?)`

Converts a JSON Schema to an OpenAPI Schema.

**Parameters:**

- `jsonSchema`: The JSON Schema to convert
- `options`: Conversion options (optional)

**Options:**

- `openApiVersion`: Target OpenAPI version ('3.0.0' | '3.1.0', default: '3.0.0')
- `preserveJsonSchemaKeywords`: Whether to preserve JSON Schema specific keywords (default: false)
- `nullHandling`: How to handle null types ('nullable' | 'remove' | 'preserve', default: 'nullable')

**Returns:** OpenAPI Schema object

### Type Definitions

- `JsonSchema`: Complete JSON Schema type definition
- `OpenApiSchema`: Complete OpenAPI Schema type definition

### Conversion Features

- **Type Conversion**: Handles all JSON Schema types (string, number, integer, boolean, array, object)
- **Composition**: Converts allOf, anyOf, oneOf, not keywords
- **References**: Transforms $ref paths to OpenAPI format
- **Validation**: Preserves validation keywords (minLength, maxLength, pattern, etc.)
- **Formats**: Maintains format specifications
- **Examples**: Converts examples array to example (OpenAPI 3.0) or examples (OpenAPI 3.1)

### Reference Transformation

The converter automatically transforms JSON Schema references to OpenAPI format:

- `#/$defs/...` → `#/components/schemas/...`
- `#/definitions/...` → `#/components/schemas/...`

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
