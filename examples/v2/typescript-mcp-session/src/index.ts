import { Metorial } from "@metorial/sdk";

// Initialize Metorial client
// Get your API key at https://app.metorial.com
let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

// Provider deployment IDs - create these at https://app.metorial.com
let providerDeploymentId = process.env.PROVIDER_DEPLOYMENT_ID!;
let oauthProviderDeploymentId = process.env.OAUTH_PROVIDER_DEPLOYMENT_ID!;
let oauthProviderId = process.env.OAUTH_PROVIDER_ID!;
let oauthAuthMethodId = process.env.OAUTH_PROVIDER_AUTH_METHOD_ID!;

// ── Setup session for OAuth provider ────────────────────────────────
let setupSession = await metorial.providerDeployments.setupSessions.create({
  providerId: oauthProviderId,
  providerAuthMethodId: oauthAuthMethodId
});

console.log('Setup session created:', setupSession.id);
console.log('Complete OAuth at:', setupSession.url);

let [completedSession] = await metorial.providerDeployments.setupSessions.waitForCompletion([
  setupSession
]);

console.log('OAuth completed! Auth config:', completedSession.authConfig?.id);

// Create a v2 (Magnetar) MCP session directly
let session = await metorial.mcp.session({
  providers: [
    // Normal provider (no auth required)
    { providerDeploymentId },
    // OAuth provider (uses the auth config from the setup session)
    {
      providerDeploymentId: oauthProviderDeploymentId,
      providerAuthConfigId: completedSession.authConfig!.id
    }
  ],
});

// Get the tool manager
console.log("🔄 Getting tool manager...");
let toolManager = session.getToolManager();
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
await session.close();
console.log("✅ MCP session closed successfully!");
