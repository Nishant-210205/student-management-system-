import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { server } from '../index.js';

describe('MCP Server Tool Discovery and Execution', () => {
  let client;
  let mockServer;
  let mockServerPort;

  before(async () => {
    // Start a lightweight mock backend REST API to test tool execution
    mockServer = http.createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json');

      if (req.url === '/api/students' && req.method === 'GET') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            data: [
              {
                studentId: 'STU999',
                name: 'Test Student',
                email: 'test@example.com',
                department: 'Computer Science',
                semester: '4',
                contact: '1234567890',
              },
            ],
          })
        );
      } else if (req.url === '/api/students' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const parsed = JSON.parse(body);
          res.writeHead(201);
          res.end(
            JSON.stringify({
              success: true,
              data: { _id: 'mockid123', ...parsed },
            })
          );
        });
      } else if (req.url === '/api/students/STU999' && req.method === 'GET') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            data: {
              studentId: 'STU999',
              name: 'Test Student',
              email: 'test@example.com',
              department: 'Computer Science',
              semester: '4',
              contact: '1234567890',
            },
          })
        );
      } else if (req.url === '/api/students/STU999' && req.method === 'PUT') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          const parsed = JSON.parse(body);
          res.writeHead(200);
          res.end(
            JSON.stringify({
              success: true,
              data: { studentId: 'STU999', ...parsed },
            })
          );
        });
      } else if (req.url === '/api/students/STU999' && req.method === 'DELETE') {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            message: 'Student deleted successfully',
          })
        );
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, message: 'Not found' }));
      }
    });

    await new Promise((resolve) => {
      mockServer.listen(0, () => {
        mockServerPort = mockServer.address().port;
        process.env.API_BASE_URL = `http://localhost:${mockServerPort}/api`;
        resolve();
      });
    });

    // Connect client and server via linked pair of in-memory transports
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: {} });

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  after(async () => {
    if (mockServer) {
      await new Promise((resolve) => mockServer.close(resolve));
    }
  });

  it('Requirement 13: MCP tools are discoverable via listTools', async () => {
    const response = await client.listTools();
    const toolNames = response.tools.map((t) => t.name);

    assert.ok(toolNames.includes('list_students'), 'list_students should be discoverable');
    assert.ok(toolNames.includes('get_student'), 'get_student should be discoverable');
    assert.ok(toolNames.includes('create_student'), 'create_student should be discoverable');
    assert.ok(toolNames.includes('update_student'), 'update_student should be discoverable');
    assert.ok(toolNames.includes('delete_student'), 'delete_student should be discoverable');
    assert.equal(toolNames.length, 5, 'Exactly 5 student management tools should be registered');
  });

  it('Requirement 14: MCP tool list_students executes successfully', async () => {
    const res = await client.callTool({
      name: 'list_students',
      arguments: {},
    });

    assert.ok(!res.isError, 'Tool execution should not report error');
    assert.ok(Array.isArray(res.content), 'Content should be an array');
    const output = JSON.parse(res.content[0].text);
    assert.equal(output.length, 1);
    assert.equal(output[0].studentId, 'STU999');
  });

  it('Requirement 14: MCP tool get_student executes successfully', async () => {
    const res = await client.callTool({
      name: 'get_student',
      arguments: { id: 'STU999' },
    });

    assert.ok(!res.isError);
    const output = JSON.parse(res.content[0].text);
    assert.equal(output.studentId, 'STU999');
    assert.equal(output.name, 'Test Student');
  });

  it('Requirement 14: MCP tool create_student executes successfully', async () => {
    const res = await client.callTool({
      name: 'create_student',
      arguments: {
        studentId: 'STU1002',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        department: 'Electronics',
        semester: '3',
        contact: '9876543210',
      },
    });

    assert.ok(!res.isError);
    assert.ok(res.content[0].text.includes('Student created successfully'));
    assert.ok(res.content[0].text.includes('STU1002'));
  });

  it('Requirement 14: MCP tool update_student executes successfully', async () => {
    const res = await client.callTool({
      name: 'update_student',
      arguments: {
        id: 'STU999',
        name: 'Updated Name',
      },
    });

    assert.ok(!res.isError);
    assert.ok(res.content[0].text.includes('Student updated successfully'));
    assert.ok(res.content[0].text.includes('Updated Name'));
  });

  it('Requirement 14: MCP tool delete_student executes successfully', async () => {
    const res = await client.callTool({
      name: 'delete_student',
      arguments: {
        id: 'STU999',
      },
    });

    assert.ok(!res.isError);
    assert.ok(res.content[0].text.includes('Student deleted successfully'));
  });

  it('Requirement 3: MCP tools validate input strictly', async () => {
    // Missing required field 'id' for get_student
    const res = await client.callTool({
      name: 'get_student',
      arguments: {},
    });

    assert.equal(res.isError, true, 'Should return isError true when required parameter is missing');
    assert.ok(
      res.content.some((c) => /id/i.test(c.text) || /invalid/i.test(c.text) || /required/i.test(c.text)),
      'Error message should indicate invalid/missing parameter'
    );
  });
});
