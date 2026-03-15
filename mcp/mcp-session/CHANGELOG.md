# @metorial/mcp-session

## 2.0.2

### Patch Changes

- Add `strict-json-schema` format to `getParametersAs` for strict mode schema enforcement (sets `additionalProperties: false`, marks all properties as required, strips `format`)
- Strip JSON Schema meta keywords (`$schema`, `$id`, `$defs`, `definitions`) when returning `json-schema` format
- Improve type safety in `stripMetaKeywords` and `enforceStrictSchema` by replacing `any` with `JsonSchema` types
- Fix `getTools()` returning duplicates due to tools being keyed by both id and name in a single map

## 2.0.1

### Patch Changes

- Fixes for session creation with template and langchain sdk

## 2.0.0

### Major Changes

- Major version bump for all packages

### Patch Changes

- Updated dependencies
  - @metorial/core@2.0.0
  - @metorial/generated@2.0.0
  - @metorial/json-schema@2.0.0
  - @metorial/util-endpoint@2.0.0

## 1.0.1

### Patch Changes

- Fixed TypeScript compilation errors by adding explicit return type annotations to MCP client methods
- Added proper type imports from @modelcontextprotocol/sdk/types.js
- Fixed SetLoggingLevelRequest import name (was SetLevelRequest)

## 1.0.0

### Major Changes

- Initial release of @metorial/mcp-session package
