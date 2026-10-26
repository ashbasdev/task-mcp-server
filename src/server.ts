import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new McpServer({
  name: 'my-first-mcp-server',
  version: '1.0.0'
});

server.registerTool(
  'ping',
  {
    description: 'Health check tool that returns pong'
  },
  async () => {
    return {
      content: [
        {
          type: 'text',
          text: 'pong'
        }
      ]
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
