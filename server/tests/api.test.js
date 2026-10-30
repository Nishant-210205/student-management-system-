import { describe, it, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../server.js';
import { validateStudentInput } from '../services/studentService.js';
import { connectDB } from '../config/db.js';

describe('Backend API & Validation Test Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    process.env.NODE_ENV = 'test';
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('Validation Logic', () => {
    it('rejects student with missing required fields', () => {
      const errors = validateStudentInput({});
      assert.ok(errors.length >= 5, 'Should have errors for missing fields');
      assert.ok(errors.some((e) => e.includes('studentId')));
      assert.ok(errors.some((e) => e.includes('name')));
      assert.ok(errors.some((e) => e.includes('email')));
      assert.ok(errors.some((e) => e.includes('department')));
      assert.ok(errors.some((e) => e.includes('contact')));
    });

    it('rejects invalid email format', () => {
      const errors = validateStudentInput({
        studentId: 'STU101',
        name: 'John Doe',
        email: 'invalid-email-address',
        department: 'Physics',
        semester: '2',
        contact: '1234567890',
      });
      assert.ok(errors.some((e) => e.includes('valid email address')));
    });

    it('accepts optional emailVerified boolean', () => {
      const errors = validateStudentInput({
        studentId: 'STU102',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        department: 'Math',
        semester: '3',
        contact: '9876543210',
        emailVerified: true,
      });
      assert.equal(errors.length, 0);
    });

    it('rejects non-boolean emailVerified value', () => {
      const errors = validateStudentInput({
        studentId: 'STU103',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        department: 'Math',
        semester: '3',
        contact: '9876543210',
        emailVerified: 'invalid-boolean',
      });
      assert.ok(errors.some((e) => e.includes('emailVerified must be a boolean')));
    });

    it('accepts completely valid student payload', () => {
      const errors = validateStudentInput({
        studentId: 'STU101',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Computer Science',
        semester: '4',
        contact: '9876543210',
      });
      assert.equal(errors.length, 0, 'Valid payload should have zero validation errors');
    });

    it('allows partial fields for update validation', () => {
      const errors = validateStudentInput(
        {
          name: 'Jane Updated',
        },
        true
      );
      assert.equal(errors.length, 0, 'Partial update should have zero validation errors');
    });
  });

  describe('REST Endpoints & Security', () => {
    it('GET /api/health responds with status, version, uptime, and database property', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.ok([200, 503].includes(res.status), 'Health check returns 200 or 503');
      const data = await res.json();
      assert.ok(data.database !== undefined, 'Health check should report database status');
      assert.ok(data.timestamp !== undefined, 'Health check should include timestamp');
      assert.equal(data.version, '1.0.0', 'Health check should report semantic version');
      assert.ok(typeof data.uptime === 'number', 'Health check should report uptime');
      assert.ok(data.hasMongoUri !== undefined, 'Health check should report hasMongoUri boolean');
      assert.ok(data.diagnostic !== undefined, 'Health check should report safe diagnostic info');
    });

    it('GET / responds with API greeting and endpoints info', async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.message.includes('Student Management System'));
    });

    it('POST /api/students returns 400 for invalid data when unauthenticated (AUTH_ENABLED not true)', async () => {
      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.message.includes('required'));
    });

    it('GET /api/nonexistent-route returns 404', async () => {
      const res = await fetch(`${baseUrl}/api/nonexistent-route`);
      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
    });

    it('CORS headers allow localhost origins', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5173' },
      });
      assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    });

    it('CORS headers allow Vercel domains', async () => {
      const res = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'https://student-management.vercel.app' },
      });
      assert.equal(res.headers.get('access-control-allow-origin'), 'https://student-management.vercel.app');
    });

    it('Security headers (Helmet) are set on responses', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', 'Must include nosniff header');
    });
  });

  describe('Switchable Authentication (AUTH_ENABLED)', () => {
    afterEach(() => {
      delete process.env.AUTH_ENABLED;
      delete process.env.MCP_API_TOKEN;
    });

    it('enforces 401 Unauthorized on write endpoints when AUTH_ENABLED=true and no token supplied', async () => {
      process.env.AUTH_ENABLED = 'true';
      process.env.MCP_API_TOKEN = 'test-token-secret-1234';

      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Student' }),
      });

      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.message.includes('Unauthorized'));
    });

    it('enforces 403 Forbidden when AUTH_ENABLED=true and wrong token supplied', async () => {
      process.env.AUTH_ENABLED = 'true';
      process.env.MCP_API_TOKEN = 'test-token-secret-1234';

      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer wrong-token',
        },
        body: JSON.stringify({ name: 'Test Student' }),
      });

      assert.equal(res.status, 403);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.message.includes('Forbidden'));
    });

    it('allows write request through when AUTH_ENABLED=true and valid Bearer token supplied', async () => {
      process.env.AUTH_ENABLED = 'true';
      process.env.MCP_API_TOKEN = 'test-token-secret-1234';

      const res = await fetch(`${baseUrl}/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-secret-1234',
        },
        body: JSON.stringify({ name: '' }), // Invalid payload triggers 400 validation, proving auth passed!
      });

      assert.equal(res.status, 400, 'Should pass authentication and reach validation handler');
    });
  });

  describe('Connection Concurrency Guard', () => {
    it('concurrent calls to connectDB reuse the same in-flight connection promise', async () => {
      const promise1 = connectDB();
      const promise2 = connectDB();
      const promise3 = connectDB();

      assert.equal(promise1, promise2, 'Call 1 and Call 2 must share the identical Promise instance');
      assert.equal(promise2, promise3, 'Call 2 and Call 3 must share the identical Promise instance');

      await Promise.allSettled([promise1, promise2, promise3]);
    });
  });
});
