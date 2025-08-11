import { MetorialMcpSession } from '@metorial/mcp-session';
import { Metorial } from 'metorial';

let metorial = new Metorial({
  apiKey: '...your-metorial-api-key...'
});

let mcpSession = new MetorialMcpSession(metorial, {
  serverDeployments: ['...server-deployment-id...']
});

// Get the session
console.log('🔄 Getting session...');
let session = await mcpSession.getSession();
console.log('📋 Session object:', session);
console.log('📋 Session type:', typeof session);
console.log('📋 Session keys:', session ? Object.keys(session) : 'null');

if (!session) {
  console.log('❌ No session returned');
  process.exit(1);
}

// Get the tool manager
console.log('🔄 Getting tool manager...');
let toolManager = await mcpSession.getToolManager();
console.log('📋 Tool manager:', toolManager);
console.log('📋 Tool manager type:', typeof toolManager);

console.log('✅ Metorial MCP session created successfully!');
console.log('🔧 Available tools:');

// Try to get tools from tool manager
if (toolManager && toolManager.getTools) {
  let tools = toolManager.getTools();
  console.log('📋 Tools from tool manager:', tools);

  for (let tool of tools) {
    console.log(`  • ${tool.name}: ${tool.description || 'No description'}`);
  }

  // Test the Tavily searchContext tool directly
  let searchContextTool = tools.find(t => t.name === 'searchContext');

  if (searchContextTool) {
    console.log('\n📡 Calling searchContext tool...');
    let toolResponse = await searchContextTool.call({
      query: 'metorial websocket explorer',
      maxResults: 3
    });

    console.log('✅ Tool call successful!');
    console.log('📄 Response type:', typeof toolResponse);
    console.log('📄 Response:', JSON.stringify(toolResponse, null, 2).slice(0, 500) + '...');
  } else {
    console.log('❌ searchContext tool not found');
  }
} else {
  console.log('❌ No tool manager or getTools method available');
}

console.log('🔄 Closing MCP session...');
await mcpSession.close();
console.log('✅ MCP session closed successfully!');
