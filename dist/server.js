import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const server = new McpServer({
    name: 'task-mcp-server',
    version: '1.0.0'
});
// Persisted storage
let tasks = [];
let nextId = 1;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.resolve(__dirname, '../data/tasks.json');
async function loadTasks() {
    try {
        const raw = await fs.readFile(dataFile, 'utf8');
        const parsed = JSON.parse(raw);
        tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        nextId = typeof parsed.nextId === 'number'
            ? parsed.nextId
            : tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    }
    catch {
        tasks = [];
        nextId = 1;
    }
}
async function saveTasks() {
    await fs.writeFile(dataFile, JSON.stringify({ tasks, nextId }, null, 2), 'utf8');
}
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
// Add task
server.registerTool('add-task', {
    description: 'Add a task',
    inputSchema: {
        text: z.string().describe('Task description')
    }
}, async ({ text }) => {
    const task = { id: nextId++, text, done: false };
    tasks.push(task);
    await saveTasks();
    return {
        content: [{ type: 'text', text: `Added task: ${task.text}` }]
    };
});
// List tasks
server.registerTool('list-tasks', {
    description: 'Show all tasks'
}, async () => {
    if (tasks.length === 0) {
        return {
            content: [{ type: 'text', text: 'No tasks yet' }]
        };
    }
    const list = tasks
        .map((t) => `${t.id}. [${t.done ? '✅' : '⭐'}] ${t.text}`)
        .join('\n');
    return {
        content: [{ type: 'text', text: list }]
    };
});
// Complete a task
server.registerTool('complete-task', {
    description: 'Mark a task as done',
    inputSchema: {
        id: z.number().int().positive().describe('Task id to mark complete')
    }
}, async ({ id }) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) {
        return {
            content: [{ type: 'text', text: `Task ${id} not found` }],
            isError: true
        };
    }
    task.done = true;
    await saveTasks();
    return {
        content: [{ type: 'text', text: `Completed task: ${task.text}` }]
    };
});
// Reopen a task
server.registerTool('reopen-task', {
    description: 'Set task as not done',
    inputSchema: {
        id: z.number().int().positive().describe('Task id to mark as not done')
    }
}, async ({ id }) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) {
        return {
            content: [{ type: 'text', text: `Task ${id} not found` }],
            isError: true
        };
    }
    task.done = false;
    await saveTasks();
    return {
        content: [{ type: 'text', text: `Not completed task: ${task.text}` }]
    };
});
async function main() {
    await loadTasks();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP server running on stdio');
}
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map