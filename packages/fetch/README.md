# @metorial/fetch

Cross-platform fetch utilities for Metorial. Provides standardized HTTP client functionality across different JavaScript environments.

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

## Features

- 🌐 **Cross-Platform**: Works in Node.js, browsers, and other JavaScript environments
- 🔧 **Standardized Interface**: Consistent fetch API across platforms
- ⚡ **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Usage

```typescript
import { fetch } from '@metorial/fetch';

// Use standardized fetch across platforms
const response = await fetch('https://api.example.com/data');
const data = await response.json();
```

## Dependencies

- `cross-fetch`: Cross-platform fetch implementation

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
