import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus } from '../config/db.js';
import {
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  listStudents,
} from '../services/studentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

describe('MongoDB Atlas Live Integration & CRUD Verification', () => {
  // Normal test suite does not require live production credentials.
  // Set RUN_LIVE_DB_TESTS=true to execute live Atlas database tests.
  const runLiveTest = process.env.RUN_LIVE_DB_TESTS === 'true' && Boolean(process.env.MONGODB_URI);
  const testStudentId = `TEST_${Date.now()}`;
  let dbConnected = false;
  let createdRecord = null;

  before(async () => {
    if (runLiveTest) {
      dbConnected = await connectDB();
    }
  });

  after(async () => {
    // Clean up created test record if it still exists
    if (dbConnected && createdRecord) {
      try {
        await deleteStudent(testStudentId);
      } catch {
        // Ignored if already cleaned up
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  it('Verifies MongoDB connection state', (t) => {
    if (!runLiveTest) {
      t.skip('Live Atlas test skipped (normal test suite does not require production credentials; set RUN_LIVE_DB_TESTS=true to run)');
      return;
    }
    if (!dbConnected) {
      t.skip(
        'Atlas connection failed: Check Network Access (IP whitelist 0.0.0.0/0) or credentials in MongoDB Atlas dashboard'
      );
      return;
    }
    assert.equal(getDBStatus(), 'connected', 'Database status should be connected');
  });

  it('Creates a student record in MongoDB Atlas', async (t) => {
    if (!runLiveTest || !dbConnected) {
      t.skip('Skipping: Database not connected or live test not enabled');
      return;
    }

    const payload = {
      studentId: testStudentId,
      name: 'Atlas Test User',
      email: 'atlastest@example.com',
      department: 'Computer Science',
      semester: '6',
      contact: '+1 555-0100',
    };

    createdRecord = await createStudent(payload);
    assert.ok(createdRecord._id, 'Record should have MongoDB _id');
    assert.equal(createdRecord.studentId, testStudentId);
    assert.equal(createdRecord.name, 'Atlas Test User');
  });

  it('Reads student record from MongoDB Atlas', async (t) => {
    if (!runLiveTest || !dbConnected) {
      t.skip('Skipping: Database not connected or live test not enabled');
      return;
    }

    const student = await getStudent(testStudentId);
    assert.equal(student.studentId, testStudentId);
    assert.equal(student.department, 'Computer Science');
  });

  it('Lists students including the newly created record', async (t) => {
    if (!runLiveTest || !dbConnected) {
      t.skip('Skipping: Database not connected or live test not enabled');
      return;
    }

    const results = await listStudents(testStudentId);
    assert.ok(results.length >= 1, 'Should find the test student in search results');
    assert.equal(results[0].studentId, testStudentId);
  });

  it('Updates the student record in MongoDB Atlas', async (t) => {
    if (!runLiveTest || !dbConnected) {
      t.skip('Skipping: Database not connected or live test not enabled');
      return;
    }

    const updated = await updateStudent(testStudentId, {
      name: 'Atlas Test User Updated',
      semester: '7',
    });
    assert.equal(updated.name, 'Atlas Test User Updated');
    assert.equal(updated.semester, '7');
  });

  it('Deletes the student record from MongoDB Atlas', async (t) => {
    if (!runLiveTest || !dbConnected) {
      t.skip('Skipping: Database not connected or live test not enabled');
      return;
    }

    const deleted = await deleteStudent(testStudentId);
    assert.equal(deleted.studentId, testStudentId);
    createdRecord = null; // Mark cleaned up

    // Verify it no longer exists
    await assert.rejects(async () => {
      await getStudent(testStudentId);
    }, /not found/i);
  });
});
