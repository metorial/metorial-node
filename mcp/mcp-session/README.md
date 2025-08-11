# @metorial/mcp-session

MCP session management for Metorial. Provides session handling and tool lifecycle management for Model Context Protocol.

## Installation

```bash
npm install @metorial/mcp-session
# or
yarn add @metorial/mcp-session
# or
pnpm add @metorial/mcp-session
# or
bun add @metorial/mcp-session
```

## Usage

This package provides direct MCP session management for advanced use cases.

```typescript
import { MetorialMcpSession } from '@metorial/mcp-session';
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: 'your-metorial-api-key'
});

// Create an MCP session instance
let mcpSession = new MetorialMcpSession(metorial, {
  serverDeployments: ['your-server-deployment-id']
});

// Get the session metadata
let session = await mcpSession.getSession();

// Get the tool manager
let toolManager = await mcpSession.getToolManager();

// Get available tools
let tools = toolManager.getTools();

// Call a tool directly
let searchContextTool = tools.find(t => t.name === 'searchContext');
if (searchContextTool) {
  let toolResponse = await searchContextTool.call({
    query: 'metorial websocket explorer',
    maxResults: 3
  });
  console.log('Tool response:', toolResponse);
}

// Clean up the session
await mcpSession.close();
```

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
