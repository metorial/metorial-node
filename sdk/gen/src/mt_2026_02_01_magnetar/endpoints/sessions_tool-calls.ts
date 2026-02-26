import { MetorialEndpointManager } from '@metorial/util-endpoint';

export type ToolCall = {
  object: 'session.tool_call';
  id: string;
  toolKey: string;
  type: string;
  status: string;
  source: string;
  transport: string;
  sessionId: string;
  messageId: string;
  sessionProviderId: string | null;
  connectionId: string | null;
  providerRunId: string | null;
  tool: Record<string, any> | null;
  input: Record<string, any> | null;
  output: Record<string, any> | null;
  error: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
};

export type ToolCallCreateBody = {
  toolId: string;
  input: Record<string, any>;
  metadata?: Record<string, any>;
};

export type ToolCallListOutput = {
  items: ToolCall[];
  pagination: { hasMoreBefore: boolean; hasMoreAfter: boolean };
};

let mapToolCallFrom = {
  transformFrom: (data: any): ToolCall => ({
    object: data.object,
    id: data.id,
    toolKey: data.tool_key,
    type: data.type,
    status: data.status,
    source: data.source,
    transport: data.transport,
    sessionId: data.session_id,
    messageId: data.message_id,
    sessionProviderId: data.session_provider_id,
    connectionId: data.connection_id,
    providerRunId: data.provider_run_id,
    tool: data.tool,
    input: data.input,
    output: data.output,
    error: data.error,
    metadata: data.metadata,
    createdAt: new Date(data.created_at)
  })
};

let mapToolCallListFrom = {
  transformFrom: (data: any): ToolCallListOutput => ({
    items: data.items.map(mapToolCallFrom.transformFrom),
    pagination: {
      hasMoreBefore: data.pagination.has_more_before,
      hasMoreAfter: data.pagination.has_more_after
    }
  })
};

/**
 * @name Session Tool Calls controller
 * @description Tool calls allow you to invoke tools on provider deployments within a session directly via REST API.
 */
export class MetorialSessionsToolCallsEndpoint {
  constructor(private readonly _manager: MetorialEndpointManager<any>) {}

  private _get(request: any) {
    return this._manager._get(request);
  }
  private _post(request: any) {
    return this._manager._post(request);
  }

  /**
   * @name Create tool call
   * @description Creates a new tool call in a session by invoking a specific tool.
   */
  create(
    sessionId: string,
    body: ToolCallCreateBody,
    opts?: { headers?: Record<string, string> }
  ): Promise<ToolCall> {
    let path = `sessions/${sessionId}/tool-calls`;

    let request = {
      path,
      body: {
        tool_id: body.toolId,
        input: body.input,
        ...(body.metadata ? { metadata: body.metadata } : {})
      },
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._post(request).transform(mapToolCallFrom);
  }

  /**
   * @name List tool calls
   * @description Returns a paginated list of tool calls for a session.
   */
  list(
    sessionId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<ToolCallListOutput> {
    let path = `sessions/${sessionId}/tool-calls`;

    let request = {
      path,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(mapToolCallListFrom);
  }

  /**
   * @name Get tool call
   * @description Retrieves a specific tool call by ID.
   */
  get(
    sessionId: string,
    toolCallId: string,
    opts?: { headers?: Record<string, string> }
  ): Promise<ToolCall> {
    let path = `sessions/${sessionId}/tool-calls/${toolCallId}`;

    let request = {
      path,
      ...(opts?.headers ? { headers: opts.headers } : {})
    } as any;

    return this._get(request).transform(mapToolCallFrom);
  }
}
