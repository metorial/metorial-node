import { Metorial } from '../metorial';

export type WithProviderSessionFunction = Metorial['_pulsarWithProviderSession'];

export interface RunResult {
  text: string;
  steps: number;
  toolResponses?: any;
}

export interface StreamChunk {
  content?: string;
  type: 'text' | 'tool_call' | 'tool_result' | 'done';
  toolCall?: any;
  toolResult?: any;
  step?: number;
}

export interface RunStreamResult {
  stream: AsyncIterable<StreamChunk>;
  steps: Promise<number>;
}
