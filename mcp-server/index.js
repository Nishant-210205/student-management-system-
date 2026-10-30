import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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

// Start server using stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP Server] Student Management MCP server started running on stdio');
}

// Run if called directly
if (process.argv[1]?.endsWith('index.js')) {
  main().catch((err) => {
    console.error('[MCP Error] Server fatal error:', err);
    process.exit(1);
  });
}

export { server };
