import { Metorial } from 'metorial';
import Anthropic from '@anthropic-ai/sdk';

let metorial = new Metorial({ apiKey: process.env.METORIAL_API_KEY! });
let anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

let [googleCalOAuthSession, slackOAuthSession] = await Promise.all([
  metorial.oauth.sessions.create({ serverDeploymentId: process.env.GoogleCalendarServerDeploymentId! }), // use the Google Calendar server deployment id
  metorial.oauth.sessions.create({ serverDeploymentId: process.env.SlackServerDeploymentId! }) // use the Slack server deployment id
]);

console.log('OAuth URLs for user authentication:');
console.log(`   Google Calendar: ${googleCalOAuthSession.url}`);
console.log(`   Slack: ${slackOAuthSession.url}`);

await metorial.oauth.waitForCompletion([googleCalOAuthSession, slackOAuthSession]);

console.log('OAuth sessions completed!');

let result = await metorial.run({
  message: `Look in Slack for mentions of potential partners. Use Exa to research their background, company, and email.
  Schedule a 30-minute intro call with them for an open slot on Dec 13th, 2025 SF time and send me the calendar link.
  Proceed without asking for any confirmations.`,

  serverDeployments: [
    { serverDeploymentId: process.env.GoogleCalendarServerDeploymentId!, oauthSessionId: googleCalOAuthSession.id },
    { serverDeploymentId: process.env.SlackServerDeploymentId!, oauthSessionId: slackOAuthSession.id },
    { serverDeploymentId: process.env.ExaServerDeploymentId! } // use the Exa server deployment id
  ],
  client: anthropic,
  model: 'claude-sonnet-4-20250514'
});

console.log(result.text);
