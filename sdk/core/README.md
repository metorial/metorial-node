# @metorial/core

Core package for Metorial. Provides essential functionalities and shared components across different providers.

## Installation

```bash
npm install @metorial/core
# or
yarn add @metorial/core
# or
pnpm add @metorial/core
# or
bun add @metorial/core
```

## Features

- 🔧 **Core Functions**: Provides common interfaces and utilities for Metorial
- 🔨 **Shared Components**: Base classes and types for provider-specific packages
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions
- 📡 **API Client**: Core API client functionality

## Usage

This package is typically used internally by other Metorial packages and not directly by end users.

```typescript
import { Metorial } from '@metorial/core';

const metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});
```

## Dependencies

- `@metorial/generated`: Generated API client
- `@metorial/util-endpoint`: HTTP endpoint utilities

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
