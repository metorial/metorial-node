import { MetorialMcpToolManager } from '@metorial/mcp-session';

type MetorialSession = { getToolManager(): Promise<MetorialMcpToolManager> };

export interface MetorialAdapter<T> {
  __resolve(session: MetorialSession): Promise<T>;
}

export let createMcpSdk =
  <T>(
    handler: (d: { tools: MetorialMcpToolManager }) => Promise<T>
  ): (() => MetorialAdapter<T>) => {
    let resolve = async (session: MetorialSession) => {
      let tools = await session.getToolManager();
      return handler({ tools });
    };

    return () => ({ __resolve: resolve });
  };
