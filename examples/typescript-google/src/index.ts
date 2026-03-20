import { metorialGoogle } from "@metorial/google";
import Metorial from "metorial";
import { GoogleGenAI } from "@google/genai";

let metorial = new Metorial({
  apiKey: process.env.METORIAL_API_KEY!,
});

let genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

// To use a different provider (e.g. GitHub, Slack), create a deployment at https://platform.metorial.com
let deployment = await metorial.providerDeployments.create({
  name: "Metorial Search",
  providerId: "metorial-search",
});


let session = await metorial.connect({
  adapter: metorialGoogle(),
  providers: [
    { providerDeploymentId: deployment.id },
  ],
});

let response = await genAI.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: "Search the web for the latest news about AI agents and summarize the top 3 stories.",
        },
      ],
    },
  ],
  config: {
    tools: session.tools(),
  },
});

let text = response.candidates?.[0]?.content?.parts?.[0]?.text;

let functionCalls = response.candidates?.[0]?.content?.parts
  ?.filter((part) => part.functionCall)
  .map((part) => part.functionCall!);

if (functionCalls && functionCalls.length > 0) {
  console.log(
    `🔧 Using tools: ${functionCalls.map((fc) => fc.name).join(", ")}`
  );
  let toolResponses = await session.callTools(functionCalls);
  console.log("Tool responses:", toolResponses);
}

if (text) {
  console.log(text);
}
