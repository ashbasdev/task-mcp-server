import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: 'task-mcp-server',
  version: '1.0.0'
});

// Simple in-memory storage
let tasks: Array<{id: number, text: string, done: boolean}> = [];
let nextId = 1;

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

server.registerTool(
  'add-task',
  {
    description: 'Add a task',
    inputSchema: {
      text: z.string().describe('Task description')
    }
  },
  async ({ text }) => {
    const task = { id: nextId++, text, done: false };
    tasks.push(task);

    return {
      content: [{ type: 'text', text: `Added task: ${task.text}` }]
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
