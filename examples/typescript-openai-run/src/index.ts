import { Metorial } from '@metorial/sdk';
import OpenAI from 'openai';

let metorial = new Metorial({ apiKey: '...your-metorial-api-key...' });
let openai = new OpenAI({ apiKey: '...your-openai-api-key...' });

let result = await metorial.run({
  message: 'Get the top stories for today.',
  serverDeployments: ['server-deployment-1', 'server-deployment-2'],
  model: 'gpt-4o',
  client: openai,
  maxSteps: 10,
  // Optional: specify which tools to use
  // tools: ['get_top_stories'],

  // Further client specific options can be passed directly
  temperature: 0.7,
  max_tokens: 1500
});

console.log(`Response (completed in ${result.steps} steps):`);
console.log(result.text);
