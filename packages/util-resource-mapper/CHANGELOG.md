## 3.2.0

- Add opt-in `_at` date defaults for explicitly listed mapper fields, with identity overrides for
  non-date values and raw records.
- Add cached date-filter (`5`), pagination (`6`), and timestamp-pair (`8`) descriptors, and paginated
  lists (`[7, itemDescriptor]`), retaining existing compact and legacy behavior by default.

## 3.1.0

- Add the independently tree-shakeable `/compact` entry point with numeric descriptors, sparse
  object mappings, identity reuse, nested arrays, and date-aware unions.
- Retain the existing mapper builders and custom mapper interface unchanged.

# @metorial/util-resource-mapper

## 3.0.0

### Major Changes

- Register new endpoints and update mcp handling

## 2.1.0

### Minor Changes

- Change withProviderSession flow to direct session use

## 2.0.0

### Major Changes

- Major version bump for all packages
