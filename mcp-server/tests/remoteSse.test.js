import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { server } from '../index.js';

describe('Remote Streamable HTTP / SSE MCP Transport Test Suite', () => {
  let httpServer;
  let serverPort;
  const transports = new Map();

  before(async () => {
    httpServer = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

      // Test auth enforcement
      if (process.env.TEST_MCP_AUTH === 'true') {
        const auth = req.headers.authorization;
        if (!auth || auth !== 'Bearer valid-secret-token') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized' }));
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
          res.end(JSON.stringify({ error: 'Session not found' }));
          return;
        }
        await transport.handlePostMessage(req, res);
      } else if (url.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy', transport: 'sse' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise((resolve) => {
      httpServer.listen(0, () => {
        serverPort = httpServer.address().port;
        resolve();
      });
    });
  });

  after(async () => {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
  });

  it('Remote client connects via SSE and discovers all 8 tools', async () => {
    const client = new Client({ name: 'remote-test-client', version: '1.0.0' }, { capabilities: {} });
    const sseTransport = new SSEClientTransport(new URL(`http://localhost:${serverPort}/sse`));

    await client.connect(sseTransport);

    const toolsResponse = await client.listTools();
    const toolNames = toolsResponse.tools.map((t) => t.name);

    assert.equal(toolNames.length, 8, 'Should discover all 8 tools over remote SSE');
    assert.ok(toolNames.includes('list_students'));
    assert.ok(toolNames.includes('search_students'));
    assert.ok(toolNames.includes('get_student_statistics'));
    assert.ok(toolNames.includes('get_database_status'));

    await client.close();
  });

  it('Health endpoint reports healthy status for remote MCP service', async () => {
    const res = await fetch(`http://localhost:${serverPort}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'healthy');
    assert.equal(body.transport, 'sse');
  });

  it('Rejects unauthorized requests when authentication is required', async () => {
    process.env.TEST_MCP_AUTH = 'true';
    try {
      const res = await fetch(`http://localhost:${serverPort}/sse`);
      assert.equal(res.status, 401, 'Should reject without auth header');
    } finally {
      delete process.env.TEST_MCP_AUTH;
    }
  });
});
