import { metorialOpenAI } from '@metorial/openai';
import { Metorial } from 'metorial';
import OpenAI from 'openai';

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!
});

let openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// ── Example 1: Metorial Search (runs out of the box) ────────────────
// Create a deployment for the built-in Metorial Search provider.
// No auth or dashboard setup needed — just METORIAL_API_KEY + OPENAI_API_KEY.

let deployment = await metorial.providerDeployments.create({
  name: 'Metorial Search',
  providerId: 'metorial-search'
});

await metorial.withProviderSession(
  metorialOpenAI.chatCompletions,
  {
    providers: [{ providerDeploymentId: deployment.id }]
  },
  async session => {
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content:
          'Search the web for the latest news about AI agents and summarize the top 3 stories.'
      }
    ];

    for (let i = 0; i < 10; i++) {
      let response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        tools: session.tools
      });
      let choice = response.choices[0]!;
      let toolCalls = choice.message.tool_calls;

      if (!toolCalls) {
        console.log('Example 1:', choice.message.content);
        break;
      }

      console.log(`🔧 Using tools: ${toolCalls.map(tc => tc.function.name).join(', ')}`);
      let toolResponses = await session.callTools(toolCalls);
      messages.push({ role: 'assistant', tool_calls: toolCalls }, ...toolResponses);
    }
  }
);

// ── Example 2: Pre-configured deployment ID ─────────────────────────
// Use a deployment created in the Metorial dashboard (e.g. Exa, Tavily).
// Set PROVIDER_DEPLOYMENT_ID in your .env file.

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [{ providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID! }],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Hello!" }],
//       tools: session.tools,
//     });
//     console.log("Example 2:", response.choices[0]?.message.content);
//   }
// );

// ── Example 3: Provider auth config ID ──────────────────────────────
// Reference a pre-created auth config (e.g. OAuth credentials stored
// in the Metorial dashboard)

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [
//       {
//         providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
//         providerAuthConfigId: process.env.PROVIDER_AUTH_CONFIG_ID!,
//       },
//     ],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Hello with auth config!" }],
//       tools: session.tools,
//     });
//     console.log("Example 3:", response.choices[0]?.message.content);
//   }
// );

// ── Example 4: Inline provider auth config ──────────────────────────
// Pass credentials directly without pre-creating them in the dashboard

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [
//       {
//         providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
//         providerAuthConfig: {
//           providerAuthMethodId: process.env.PROVIDER_AUTH_METHOD_ID!,
//           credentials: {
//             access_token: process.env.PROVIDER_ACCESS_TOKEN!,
//           },
//         },
//       },
//     ],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Hello with inline auth!" }],
//       tools: session.tools,
//     });
//     console.log("Example 4:", response.choices[0]?.message.content);
//   }
// );

// ── Example 5: Tool filters ─────────────────────────────────────────
// Limit which tools are exposed to the LLM

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [
//       {
//         providerDeploymentId: process.env.PROVIDER_DEPLOYMENT_ID!,
//         toolFilters: [
//           { type: "tool_keys", keys: ["search", "read_file"] },
//         ],
//       },
//     ],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Hello with filtered tools!" }],
//       tools: session.tools,
//     });
//     console.log("Example 5:", response.choices[0]?.message.content);
//   }
// );

// ── Example 6: Multiple providers in one session ────────────────────
// Combine multiple providers (e.g. search + Slack + GitHub)

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [
//       { providerDeploymentId: process.env.SEARCH_PROVIDER_DEPLOYMENT_ID! },
//       {
//         providerDeploymentId: process.env.SLACK_PROVIDER_DEPLOYMENT_ID!,
//         providerAuthConfigId: process.env.SLACK_AUTH_CONFIG_ID!,
//       },
//       {
//         providerDeploymentId: process.env.GITHUB_PROVIDER_DEPLOYMENT_ID!,
//         providerAuthConfig: {
//           providerAuthMethodId: process.env.GITHUB_AUTH_METHOD_ID!,
//           credentials: { access_token: process.env.GITHUB_ACCESS_TOKEN! },
//         },
//       },
//     ],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Search for Metorial and post findings in Slack." }],
//       tools: session.tools,
//     });
//     console.log("Example 6:", response.choices[0]?.message.content);
//   }
// );

// ── Example 7: Session template ─────────────────────────────────────
// Use a pre-configured session template from the dashboard.
// Templates let you bundle providers + auth configs into a reusable ID.

// await metorial.withProviderSession(
//   metorialOpenAI.chatCompletions,
//   {
//     providers: [
//       { sessionTemplateId: process.env.SESSION_TEMPLATE_ID! },
//     ],
//   },
//   async (session) => {
//     let response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: "Hello with session template!" }],
//       tools: session.tools,
//     });
//     console.log("Example 7:", response.choices[0]?.message.content);
//   }
// );
