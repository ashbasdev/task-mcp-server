import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
const server = new McpServer({
    name: 'task-mcp-server',
    version: '1.0.0'
});
// Simple in-memory storage
let tasks = [];
let nextId = 1;
server.registerTool('ping', {
    description: 'Health check tool that returns pong'
}, async () => {
    return {
        content: [
            {
                type: 'text',
                text: 'pong'
            }
        ]
    };
});
server.registerTool('add-task', {
    description: 'Task description'
}, async (args) => {
    const task = {
        id: nextId++,
        text: args.text,
        done: false
    };
    tasks.push(task);
    return `Added task: ${task.text}`;
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map