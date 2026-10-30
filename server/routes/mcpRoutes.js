import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} from '../services/studentService.js';
import { getDBDiagnostics } from '../config/db.js';

const router = express.Router();

// Initialize the shared MCP Server instance
const mcpServer = new McpServer({
  name: 'student-management-cloud-mcp',
  version: '1.0.0',
});

// Tool 1: list_students
mcpServer.tool(
  'list_students',
  'Retrieve student records from MongoDB Atlas with optional search filter',
  {
    search: z.string().optional().describe('Optional search query to filter by name, student ID, or department'),
  },
  async ({ search }) => {
    try {
      const data = await listStudents(search || '');
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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
mcpServer.tool(
  'get_student',
  'Get details of a single student by student ID (e.g. STU1001) or MongoDB _id',
  {
    id: z.string().min(1).describe('The student ID or MongoDB _id'),
  },
  async ({ id }) => {
    try {
      const student = await getStudent(id);
      return {
        content: [{ type: 'text', text: JSON.stringify(student, null, 2) }],
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
mcpServer.tool(
  'create_student',
  'Add a new student to MongoDB Atlas',
  {
    studentId: z.string().min(1).describe('Unique student identifier, e.g. STU1001'),
    name: z.string().min(1).describe('Full name of the student'),
    email: z.string().email().describe('Valid email address of the student'),
    department: z.string().min(1).describe('Department / Major, e.g. Computer Science'),
    semester: z.string().min(1).describe('Current semester or year, e.g. Semester 4'),
    contact: z.string().min(1).describe('Contact phone number'),
    emailVerified: z.boolean().optional().describe('Whether the email address is verified'),
  },
  async (studentData) => {
    try {
      const created = await createStudent(studentData);
      return {
        content: [
          {
            type: 'text',
            text: `Student created successfully:\n${JSON.stringify(created, null, 2)}`,
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
mcpServer.tool(
  'update_student',
  'Update an existing student record in MongoDB Atlas',
  {
    id: z.string().min(1).describe('The student ID or MongoDB _id to update'),
    studentId: z.string().optional().describe('New student ID (optional)'),
    name: z.string().optional().describe('Updated name (optional)'),
    email: z.string().email().optional().describe('Updated email (optional)'),
    department: z.string().optional().describe('Updated department (optional)'),
    semester: z.string().optional().describe('Updated semester (optional)'),
    contact: z.string().optional().describe('Updated contact number (optional)'),
    emailVerified: z.boolean().optional().describe('Updated email verification status (optional)'),
  },
  async ({ id, ...updates }) => {
    try {
      const updated = await updateStudent(id, updates);
      return {
        content: [
          {
            type: 'text',
            text: `Student updated successfully:\n${JSON.stringify(updated, null, 2)}`,
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
mcpServer.tool(
  'delete_student',
  'Delete a student record from MongoDB Atlas',
  {
    id: z.string().min(1).describe('The student ID or MongoDB _id to delete'),
  },
  async ({ id }) => {
    try {
      const deleted = await deleteStudent(id);
      return {
        content: [
          {
            type: 'text',
            text: `Student deleted successfully:\n${JSON.stringify(deleted, null, 2)}`,
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
mcpServer.tool(
  'search_students',
  'Search student records in MongoDB Atlas by name, student ID, or department keyword',
  {
    query: z.string().min(1).describe('Search query keyword to match against student records'),
    department: z.string().optional().describe('Optional department filter'),
  },
  async ({ query, department }) => {
    try {
      let students = await listStudents(query);
      if (department) {
        students = students.filter(
          (s) => s.department && s.department.toLowerCase().includes(department.toLowerCase())
        );
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(students, null, 2) }],
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
mcpServer.tool(
  'get_student_statistics',
  'Retrieve aggregated statistics about students from MongoDB Atlas (total count, department breakdown, verified count)',
  {},
  async () => {
    try {
      const stats = await getStudentStats();
      return {
        content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }],
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
mcpServer.tool(
  'get_database_status',
  'Check the MongoDB Atlas database connection health, system uptime, and memory status',
  {},
  async () => {
    try {
      const diag = getDBDiagnostics();
      const mem = process.memoryUsage();
      const statusData = {
        status: diag.database === 'connected' ? 'healthy' : 'degraded',
        database: diag.database,
        hasMongoUri: diag.hasMongoUri,
        diagnostic: diag.diagnostic,
        uptimeSeconds: Math.round(process.uptime()),
        memoryRssMb: Math.round(mem.rss / 1024 / 1024),
      };
      return {
        content: [{ type: 'text', text: JSON.stringify(statusData, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Failed to get database status: ${err.message}` }],
      };
    }
  }
);

// Active transports registry
const activeTransports = new Map();

// Helper: check optional token authentication
const isAuthorized = (req) => {
  const expectedToken = process.env.MCP_AUTH_TOKEN || process.env.MCP_API_TOKEN;
  if (!expectedToken) return true; // Open access when token is not configured

  const authHeader = req.headers.authorization;
  const queryToken = req.query?.token;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : queryToken;
  return token === expectedToken;
};

// GET /mcp/sse - Streamable HTTP Server-Sent Events entry point
router.get('/sse', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({
      error: 'Unauthorized: A valid Bearer token is required to access the remote MCP SSE endpoint.',
    });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const transport = new SSEServerTransport('/mcp/messages', res);
  activeTransports.set(transport.sessionId, transport);

  req.on('close', () => {
    activeTransports.delete(transport.sessionId);
  });

  await mcpServer.connect(transport);
});

// POST /mcp/messages - Client message delivery endpoint
router.post('/messages', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({
      error: 'Unauthorized: A valid Bearer token is required to post MCP messages.',
    });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const sessionId = req.query.sessionId;
  const transport = activeTransports.get(sessionId);

  if (!transport) {
    return res.status(404).json({
      error: 'Session not found or expired. Re-connect to /mcp/sse to establish a new session.',
    });
  }

  await transport.handlePostMessage(req, res);
});

// GET /mcp - Metadata & Discovery
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'student-management-cloud-mcp',
    version: '1.0.0',
    description: 'Remote Streamable SSE MCP Endpoint for Student Management System',
    endpoints: {
      sse: '/mcp/sse',
      messages: '/mcp/messages',
    },
    authRequired: Boolean(process.env.MCP_AUTH_TOKEN || process.env.MCP_API_TOKEN),
    tools: [
      'list_students',
      'get_student',
      'create_student',
      'update_student',
      'delete_student',
      'search_students',
      'get_student_statistics',
      'get_database_status',
    ],
  });
});

export default router;
export { mcpServer };
