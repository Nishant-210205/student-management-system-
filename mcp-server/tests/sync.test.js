import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { server } from '../index.js';

describe('MCP and REST API Data Synchronization Test Suite', () => {
  let client;
  let mockBackendServer;
  let mockPort;
  // In-memory data store simulating the shared database
  const sharedStore = new Map();

  before(async () => {
    // Start mock backend REST server that simulates the Express + MongoDB backend
    mockBackendServer = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');

      const url = new URL(req.url, `http://localhost:${mockPort}`);
      const path = url.pathname;

      if (path === '/api/students' && req.method === 'GET') {
        const students = Array.from(sharedStore.values());
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, count: students.length, data: students }));
      } else if (path === '/api/students' && req.method === 'POST') {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          const student = JSON.parse(body);
          student._id = `mock_id_${student.studentId}`;
          sharedStore.set(student.studentId, student);
          res.writeHead(201);
          res.end(JSON.stringify({ success: true, data: student }));
        });
      } else if (path.startsWith('/api/students/') && req.method === 'GET') {
        const id = decodeURIComponent(path.replace('/api/students/', ''));
        const student = sharedStore.get(id);
        if (student) {
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, data: student }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Student not found' }));
        }
      } else if (path.startsWith('/api/students/') && req.method === 'PUT') {
        const id = decodeURIComponent(path.replace('/api/students/', ''));
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          const updates = JSON.parse(body);
          const student = sharedStore.get(id);
          if (student) {
            Object.assign(student, updates);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: student }));
          } else {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, message: 'Student not found' }));
          }
        });
      } else if (path.startsWith('/api/students/') && req.method === 'DELETE') {
        const id = decodeURIComponent(path.replace('/api/students/', ''));
        if (sharedStore.has(id)) {
          sharedStore.delete(id);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, message: 'Student deleted successfully' }));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ success: false, message: 'Student not found' }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'Route not found' }));
      }
    });

    await new Promise((resolve) => {
      mockBackendServer.listen(0, () => {
        mockPort = mockBackendServer.address().port;
        process.env.API_BASE_URL = `http://localhost:${mockPort}/api`;
        resolve();
      });
    });

    // Connect MCP client to server
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'sync-test-client', version: '1.0.0' }, { capabilities: {} });
    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);
  });

  after(async () => {
    if (client) await client.close();
    if (mockBackendServer) {
      await new Promise((resolve) => mockBackendServer.close(resolve));
    }
  });

  it('Record created via website REST API is immediately visible in MCP tool list_students and get_student', async () => {
    // 1. Simulate website frontend adding a student via REST API
    const student = {
      studentId: 'STU_WEB_01',
      name: 'Alice Website',
      email: 'alice@example.com',
      department: 'Computer Science',
      semester: '4',
      contact: '1234567890',
    };
    const res = await fetch(`http://localhost:${mockPort}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    assert.equal(res.status, 201);

    // 2. Query MCP tool list_students
    const listResult = await client.callTool({
      name: 'list_students',
      arguments: {},
    });
    assert.equal(listResult.isError, undefined);
    const parsedList = JSON.parse(listResult.content[0].text);
    assert.ok(parsedList.some((s) => s.studentId === 'STU_WEB_01'), 'Student should appear in MCP list');

    // 3. Query MCP tool get_student
    const getResult = await client.callTool({
      name: 'get_student',
      arguments: { id: 'STU_WEB_01' },
    });
    assert.equal(getResult.isError, undefined);
    const retrieved = JSON.parse(getResult.content[0].text);
    assert.equal(retrieved.name, 'Alice Website');
  });

  it('Record updated via MCP tool update_student is immediately reflected on website REST API', async () => {
    // 1. Update student via MCP tool
    const updateResult = await client.callTool({
      name: 'update_student',
      arguments: {
        id: 'STU_WEB_01',
        department: 'Artificial Intelligence',
      },
    });
    assert.equal(updateResult.isError, undefined);

    // 2. Fetch student via REST API (which frontend uses)
    const res = await fetch(`http://localhost:${mockPort}/api/students/STU_WEB_01`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.data.department, 'Artificial Intelligence', 'Website should see updated department');
  });

  it('Record deleted via MCP tool is removed from website REST API', async () => {
    // 1. Delete student via MCP tool
    const deleteResult = await client.callTool({
      name: 'delete_student',
      arguments: { id: 'STU_WEB_01' },
    });
    assert.equal(deleteResult.isError, undefined);

    // 2. Verify REST API returns 404
    const res = await fetch(`http://localhost:${mockPort}/api/students/STU_WEB_01`);
    assert.equal(res.status, 404);
  });
});

