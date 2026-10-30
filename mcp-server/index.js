import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'http';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure mcp-server/.env is loaded regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const DEFAULT_API_BASE = 'https://three-tier-student-management-system.onrender.com/api';
const getApiBase = () => (process.env.API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');

// Create the MCP server instance
const server = new McpServer({
  name: 'student-management-mcp',
  version: '1.0.0',
});

// Helper for calling the shared backend REST API
async function apiRequest(endpoint, options = {}) {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const authHeaders = process.env.MCP_API_TOKEN
      ? { Authorization: `Bearer ${process.env.MCP_API_TOKEN}` }
      : {};

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {}),
      },
      ...options,
    });
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 503) {
        throw new Error(
          'Backend service is waking up (Render free tier spin-up in progress). Please retry in 20-30 seconds.'
        );
      }
      throw new Error(data.message || `API error (${res.status}): ${res.statusText}`);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after 25 seconds connecting to backend API at ${base}.`);
    }
    if (err.cause?.code === 'ECONNREFUSED' || err.message.includes('fetch failed')) {
      throw new Error(
        `Could not connect to backend API at ${base}. Make sure the backend server is running or set API_BASE_URL.`
      );
    }
    throw err;
  }
}

// Tool 1: list_students
server.tool(
  'list_students',
  'Retrieve all student records from MongoDB Atlas with optional search filter',
  {
    search: z.string().optional().describe('Optional search query to filter by name, student ID, or department'),
  },
  async ({ search }) => {
    try {
      const endpoint = search ? `/students?search=${encodeURIComponent(search)}` : '/students';
      const result = await apiRequest(endpoint, { method: 'GET' });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to list students: ${err.message}` }],
      };
    }
  }
);

// Tool 2: get_student
server.tool(
  'get_student',
  'Get details of a single student by their student ID (e.g. STU1001) or database _id',
  {
    id: z.string().min(1).describe('The student ID or MongoDB _id of the student'),
  },
  async ({ id }) => {
    try {
      const result = await apiRequest(`/students/${encodeURIComponent(id)}`, { method: 'GET' });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to get student: ${err.message}` }],
      };
    }
  }
);

// Tool 3: create_student
server.tool(
  'create_student',
  'Add a new student to MongoDB Atlas',
  {
    studentId: z.string().min(1).describe('Unique student identifier, e.g. STU1001'),
    name: z.string().min(1).describe('Full name of the student'),
    email: z.string().email().describe('Valid email address of the student'),
    department: z.string().min(1).describe('Department / Major, e.g. Computer Science'),
    semester: z.string().min(1).describe('Current semester or year, e.g. Semester 4'),
    contact: z.string().min(1).describe('Contact phone number'),
  },
  async ({ studentId, name, email, department, semester, contact }) => {
    try {
      const result = await apiRequest('/students', {
        method: 'POST',
        body: JSON.stringify({ studentId, name, email, department, semester, contact }),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Student created successfully:\n${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to create student: ${err.message}` }],
      };
    }
  }
);

// Tool 4: update_student
server.tool(
  'update_student',
  'Update an existing student record in MongoDB Atlas',
  {
    id: z.string().min(1).describe('The current student ID or database _id to update'),
    studentId: z.string().optional().describe('New student ID (optional)'),
    name: z.string().optional().describe('Updated name (optional)'),
    email: z.string().email().optional().describe('Updated email (optional)'),
    department: z.string().optional().describe('Updated department (optional)'),
    semester: z.string().optional().describe('Updated semester (optional)'),
    contact: z.string().optional().describe('Updated contact number (optional)'),
  },
  async ({ id, ...updates }) => {
    try {
      const result = await apiRequest(`/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return {
        content: [
          {
            type: 'text',
            text: `Student updated successfully:\n${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to update student: ${err.message}` }],
      };
    }
  }
);

// Tool 5: delete_student
server.tool(
  'delete_student',
  'Delete a student record from MongoDB Atlas',
  {
    id: z.string().min(1).describe('The student ID or database _id to delete'),
  },
  async ({ id }) => {
    try {
      const result = await apiRequest(`/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return {
        content: [
          {
            type: 'text',
            text: `Student deleted successfully:\n${JSON.stringify(result.data, null, 2)}`,
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to delete student: ${err.message}` }],
      };
    }
  }
);

// Tool 6: search_students
server.tool(
  'search_students',
  'Search student records in MongoDB Atlas by name, student ID, or department keyword',
  {
    query: z.string().min(1).describe('Search query keyword to match against student name, student ID, or department'),
    department: z.string().optional().describe('Optional department filter to narrow search'),
  },
  async ({ query, department }) => {
    try {
      const endpoint = `/students?search=${encodeURIComponent(query)}`;
      const result = await apiRequest(endpoint, { method: 'GET' });
      let data = result.data || [];
      if (department) {
        data = data.filter((s) => s.department && s.department.toLowerCase().includes(department.toLowerCase()));
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to search students: ${err.message}` }],
      };
    }
  }
);

// Tool 7: get_student_statistics
server.tool(
  'get_student_statistics',
  'Retrieve aggregated statistics about students from MongoDB Atlas (total count, department breakdown, verified count)',
  {},
  async () => {
    try {
      const result = await apiRequest('/students/stats', { method: 'GET' });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to get student statistics: ${err.message}` }],
      };
    }
  }
);

// Tool 8: get_database_status
server.tool(
  'get_database_status',
  'Check the MongoDB Atlas database connection health, system uptime, and memory status',
  {},
  async () => {
    try {
      const result = await apiRequest('/health', { method: 'GET' });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to get database status: ${err.message}` }],
      };
    }
  }
);

// Start server using either SSE (if PORT or --sse is provided) or stdio transport
async function main() {
  const isSSE =
    process.argv.includes('--sse') ||
    process.argv.includes('--http') ||
    process.env.MCP_TRANSPORT === 'sse' ||
    Boolean(process.env.PORT);

  if (isSSE) {
    const port = Number(process.env.PORT) || 5001;
    const transports = new Map();

    const httpServer = http.createServer(async (req, res) => {
      // CORS headers for remote browser/web MCP clients
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      // Security: Validate Bearer token if MCP_AUTH_TOKEN is configured
      const requiredToken = process.env.MCP_AUTH_TOKEN || process.env.MCP_API_TOKEN;
      if (requiredToken) {
        const authHeader = req.headers.authorization;
        const queryToken = url.searchParams.get('token');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;
        if (token !== requiredToken) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing MCP authentication token.' }));
          return;
        }
      }

      if (url.pathname === '/sse' && req.method === 'GET') {
        const transport = new SSEServerTransport('/messages', res);
        transports.set(transport.sessionId, transport);
        req.on('close', () => transports.delete(transport.sessionId));
        await server.connect(transport);
      } else if (url.pathname === '/messages' && req.method === 'POST') {
        const sessionId = url.searchParams.get('sessionId');
        const transport = transports.get(sessionId);
        if (!transport) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Session not found or expired.' }));
          return;
        }
        await transport.handlePostMessage(req, res);
      } else if (url.pathname === '/health' || url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            name: 'student-management-mcp-server',
            status: 'healthy',
            transport: 'sse',
            sseEndpoint: '/sse',
            messageEndpoint: '/messages',
            toolsCount: 8,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    });

    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`[MCP Server] Student Management MCP server running on SSE at http://0.0.0.0:${port}/sse`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP Server] Student Management MCP server started running on stdio');
  }
}

// Run if called directly
if (process.argv[1]?.endsWith('index.js')) {
  main().catch((err) => {
    console.error('[MCP Error] Server fatal error:', err);
    process.exit(1);
  });
}

export { server };
