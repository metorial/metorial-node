import {
  MetorialMcpSession,
  MetorialMcpSessionInit,
  MetorialMcpToolManager
} from '@metorial/mcp-session';

export interface McpSessionLike {
  getToolManager(): Promise<MetorialMcpToolManager>;
}

export interface McpSDK {
  mcp: {
    createSession(init: MetorialMcpSessionInit): MetorialMcpSession;
  };
}

export let createMcpSdk =
  <I = void>() =>
  <T>(
    handler: (d: {
      session: McpSessionLike;
      tools: MetorialMcpToolManager;
      input: I;
    }) => Promise<T>
  ) => {
    let ofSession = async (session: McpSessionLike, input: I) => {
      let tools = await session.getToolManager();

      return handler({
        session,
        tools,
        input
      });
    };

    let ofSdk = async (sdk: McpSDK, init: MetorialMcpSessionInit, input: I) => {
      let session = sdk.mcp.createSession(init);
      return ofSession(session, input as I);
    };

    return Object.assign(ofSession, {
      ofSession,
      ofSdk
    });
  };
