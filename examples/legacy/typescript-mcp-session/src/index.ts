import { MetorialMcpSession } from "@metorial/mcp-session";
import { Metorial } from "metorial";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Server deployment IDs - create these at https://app.metorial.com
let normalServerDeploymentId = process.env.SERVER_DEPLOYMENT_ID!;
let oauthServerDeploymentId = process.env.OAUTH_SERVER_DEPLOYMENT_ID!;

// Create OAuth session for the OAuth-enabled server
// this just needs to be done once per user
let oauthSession = await metorial.v1.oauth.sessions.create({
  serverDeploymentId: oauthServerDeploymentId,
  // Optional: callback URL after OAuth completion
  // callbackUri: "https://your-app.com/oauth/callback",
});

console.log("🔑 OAuth URL - Complete authorization:", oauthSession.url);

// Wait for user to complete OAuth authorization
await metorial.v1.oauth.waitForCompletion([oauthSession]);
console.log("✅ OAuth authorization completed!");

// Create MCP session with both normal and OAuth server deployments
let mcpSession = new MetorialMcpSession(metorial, {
  serverDeployments: [
    // Normal server deployment
    { serverDeploymentId: normalServerDeploymentId },
    // OAuth server deployment with session
    {
      serverDeploymentId: oauthServerDeploymentId,
      oauthSessionId: oauthSession.id,
    },
  ],
});

// Get the session
console.log("🔄 Getting session...");
let session = await mcpSession.getSession();
console.log("📋 Session object:", session);
console.log("📋 Session type:", typeof session);
console.log("📋 Session keys:", session ? Object.keys(session) : "null");

if (!session) {
  console.log("❌ No session returned");
  process.exit(1);
}

// Get the tool manager
console.log("🔄 Getting tool manager...");
let toolManager = await mcpSession.getToolManager();
console.log("📋 Tool manager:", toolManager);
console.log("📋 Tool manager type:", typeof toolManager);

console.log("✅ Metorial MCP session created successfully!");
console.log("🔧 Available tools:");

// Try to get tools from tool manager
if (toolManager && toolManager.getTools) {
  let tools = toolManager.getTools();
  console.log("📋 Tools from tool manager:", tools);

  for (let tool of tools) {
    console.log(`  • ${tool.name}: ${tool.description || "No description"}`);
  }

  // Test a tool directly (example with searchContext)
  let searchContextTool = tools.find((t) => t.name === "searchContext");

  if (searchContextTool) {
    console.log("\n📡 Calling searchContext tool...");
    let toolResponse = await searchContextTool.call({
      query: "metorial websocket explorer",
      maxResults: 3,
    });

    console.log("✅ Tool call successful!");
    console.log("📄 Response type:", typeof toolResponse);
    console.log(
      "📄 Response:",
      JSON.stringify(toolResponse, null, 2).slice(0, 500) + "..."
    );
  } else {
    console.log("❌ searchContext tool not found");
  }
} else {
  console.log("❌ No tool manager or getTools method available");
}

console.log("🔄 Closing MCP session...");
await mcpSession.close();
console.log("✅ MCP session closed successfully!");
