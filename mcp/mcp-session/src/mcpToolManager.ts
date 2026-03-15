import { MetorialMcpSession } from './mcpSession';
import { Capability, MetorialMcpTool } from './mcpTool';

export class MetorialMcpToolManager {
  #toolList: MetorialMcpTool[];
  #toolsByKey = new Map<string, MetorialMcpTool>();

  private constructor(
    private readonly session: MetorialMcpSession,
    tools: MetorialMcpTool[]
  ) {
    this.#toolList = tools;
    for (let tool of tools) {
      this.#toolsByKey.set(tool.id, tool);
      this.#toolsByKey.set(tool.name, tool);
    }
  }

  static async fromCapabilities(session: MetorialMcpSession, capabilities: Capability[]) {
    return new MetorialMcpToolManager(
      session,
      capabilities.map(c => MetorialMcpTool.fromCapability(session, c))
    );
  }

  getTool(idOrName: string): MetorialMcpTool | undefined {
    return this.#toolsByKey.get(idOrName);
  }

  getTools(): MetorialMcpTool[] {
    return this.#toolList;
  }

  callTool(idOrName: string, args: any): Promise<any> {
    let tool = this.getTool(idOrName);
    if (!tool) throw new Error(`Tool not found: ${idOrName}`);
    return tool.call(args);
  }
}
