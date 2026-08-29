// mcp/client.js
import axios from 'axios';

class MCPClient {
  constructor(memory) {
    this.memory = memory;
    this.tools = [];
    this.servers = [];
  }

  // Discover tools from MCP server
  async discoverTools(serverUrl) {
    console.log(`[MCP] Discovering tools from: ${serverUrl}`);

    try {
      const response = await axios.get(`${serverUrl}/tools`, {
        timeout: 5000
      });

      const tools = response.data.tools || [];
      this.tools.push(...tools);
      this.servers.push({ url: serverUrl, discovered: new Date().toISOString() });

      console.log(`[MCP] ✅ Discovered ${tools.length} tools`);
      return tools;
    } catch (err) {
      console.error('[MCP] Failed to discover tools:', err.message);
      return [];
    }
  }

  // Execute a tool via MCP
  async executeTool(toolName, params) {
    console.log(`[MCP] Executing tool: ${toolName}`);

    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) {
      console.log(`[MCP] Tool ${toolName} not found`);
      return { success: false, error: 'Tool not found' };
    }

    try {
      // Find which server has this tool
      // For now, just simulate
      const result = {
        success: true,
        tool: toolName,
        params,
        result: 'Tool executed (simulated)'
      };

      this.memory.remember('mcp', `Executed tool: ${toolName}`, { result });
      return result;
    } catch (err) {
      console.error('[MCP] Tool execution failed:', err.message);
      return { success: false, error: err.message };
    }
  }

  getStats() {
    return {
      tools: this.tools.length,
      servers: this.servers.length
    };
  }
}

export default MCPClient;
