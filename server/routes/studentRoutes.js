import express from 'express';
import {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} from '../services/studentService.js';
import { getDBDiagnostics, connectDB } from '../config/db.js';
import { requireWriteAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/health
router.get('/health', (req, res) => {
  const diag = getDBDiagnostics();
  const isHealthy = diag.database === 'connected';

  // If disconnected, trigger a quick background reconnect attempt
  if (!isHealthy && diag.hasMongoUri && diag.database === 'disconnected' && process.env.NODE_ENV !== 'test') {
    connectDB().catch(() => {});
  }

  const mem = process.memoryUsage();

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: diag.database,
    hasMongoUri: diag.hasMongoUri,
    diagnostic: diag.diagnostic,
    uptime: Math.round(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / 1024 / 1024),
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
    },
    authEnabled: process.env.AUTH_ENABLED === 'true',
  });
});

// GET /api/students/stats (Registered before /students/:id)
router.get('/students/stats', async (req, res, next) => {
  try {
    const stats = await getStudentStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students (Supports optional search, sorting, and pagination)
router.get('/students', async (req, res, next) => {
  try {
    const { search, page, limit, sortBy, sortOrder } = req.query;

    const result = await listStudents(search, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    // If paginated response
    if (result && result.pagination) {
      return res.status(200).json({
        success: true,
        count: result.students.length,
        pagination: result.pagination,
        data: result.students,
      });
    }

    // Default backward-compatible unpaginated response
    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/:id
router.get('/students/:id', async (req, res, next) => {
  try {
    const student = await getStudent(req.params.id);
    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/students (Protected by requireWriteAuth when AUTH_ENABLED=true)
router.post('/students', requireWriteAuth, async (req, res, next) => {
  try {
    const newStudent = await createStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/students/:id (Protected by requireWriteAuth when AUTH_ENABLED=true)
router.put('/students/:id', requireWriteAuth, async (req, res, next) => {
  try {
    const updatedStudent = await updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/students/:id (Protected by requireWriteAuth when AUTH_ENABLED=true)
router.delete('/students/:id', requireWriteAuth, async (req, res, next) => {
  try {
    const removedStudent = await deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: removedStudent,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
