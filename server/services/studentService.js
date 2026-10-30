import { Student } from '../models/Student.js';
import mongoose from 'mongoose';

// Validation helper for student fields
export const validateStudentInput = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.studentId !== undefined) {
    if (!data.studentId || typeof data.studentId !== 'string' || !data.studentId.trim()) {
      errors.push('studentId is required and must be a non-empty string');
    }
  }

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.push('name is required and must be a non-empty string');
    }
  }

  if (!isUpdate || data.email !== undefined) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!data.email || typeof data.email !== 'string' || !emailRegex.test(data.email.trim())) {
      errors.push('a valid email address is required');
    }
  }

  if (!isUpdate || data.department !== undefined) {
    if (!data.department || typeof data.department !== 'string' || !data.department.trim()) {
      errors.push('department is required and must be a non-empty string');
    }
  }

  if (!isUpdate || data.semester !== undefined) {
    if (data.semester === undefined || data.semester === null || `${data.semester}`.trim() === '') {
      errors.push('semester is required');
    }
  }

  if (!isUpdate || data.contact !== undefined) {
    if (!data.contact || typeof data.contact !== 'string' || !data.contact.trim()) {
      errors.push('contact is required and must be a non-empty string');
    }
  }

  if (data.emailVerified !== undefined) {
    if (typeof data.emailVerified !== 'boolean' && data.emailVerified !== 'true' && data.emailVerified !== 'false') {
      errors.push('emailVerified must be a boolean');
    }
  }

  return errors;
};

// Find student helper (by MongoDB _id or studentId)
export const findStudentByIdOrCode = async (identifier) => {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const student = await Student.findById(identifier);
    if (student) return student;
  }
  return await Student.findOne({ studentId: identifier });
};

// Service: List all students with optional search, sorting, and pagination
export const listStudents = async (search = '', options = {}) => {
  const filter = {};
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { name: searchRegex },
      { studentId: searchRegex },
      { department: searchRegex },
    ];
  }

  const { sortBy = 'createdAt', sortOrder = 'desc', page, limit } = options;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortCriteria = { [sortBy]: sortDirection };

  let query = Student.find(filter).sort(sortCriteria);

  if (limit && Number(limit) > 0) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    query = query.skip(skip).limit(limitNum);

    const [students, total] = await Promise.all([
      query.exec(),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  return await query.exec();
};

// Service: Get aggregate dashboard stats
export const getStudentStats = async () => {
  const total = await Student.countDocuments();

  const [deptAggregation, semAggregation, recentStudent] = await Promise.all([
    Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Student.aggregate([
      { $group: { _id: '$semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Student.findOne().sort({ createdAt: -1 }),
  ]);

  return {
    total,
    departmentCount: deptAggregation.length,
    departments: deptAggregation.reduce((acc, curr) => {
      acc[curr._id || 'Unassigned'] = curr.count;
      return acc;
    }, {}),
    semesters: semAggregation.reduce((acc, curr) => {
      acc[curr._id || 'Unassigned'] = curr.count;
      return acc;
    }, {}),
    recentStudent: recentStudent
      ? {
          studentId: recentStudent.studentId,
          name: recentStudent.name,
          department: recentStudent.department,
          semester: recentStudent.semester,
          createdAt: recentStudent.createdAt,
        }
      : null,
  };
};

// Service: Get a single student
export const getStudent = async (identifier) => {
  const student = await findStudentByIdOrCode(identifier);
  if (!student) {
    const err = new Error(`Student not found with identifier: ${identifier}`);
    err.statusCode = 404;
    throw err;
  }
  return student;
};

// Service: Create a new student
export const createStudent = async (data) => {
  const validationErrors = validateStudentInput(data, false);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(', '));
    err.statusCode = 400;
    throw err;
  }

  const existing = await Student.findOne({ studentId: data.studentId.trim() });
  if (existing) {
    const err = new Error(`Student with ID '${data.studentId.trim()}' already exists`);
    err.statusCode = 409;
    throw err;
  }

  const newStudent = new Student({
    studentId: data.studentId.trim(),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    department: data.department.trim(),
    semester: `${data.semester}`.trim(),
    contact: data.contact.trim(),
    emailVerified: data.emailVerified !== undefined ? Boolean(data.emailVerified) : false,
  });

  return await newStudent.save();
};

// Service: Update student
export const updateStudent = async (identifier, data) => {
  const validationErrors = validateStudentInput(data, true);
  if (validationErrors.length > 0) {
    const err = new Error(validationErrors.join(', '));
    err.statusCode = 400;
    throw err;
  }

  const student = await findStudentByIdOrCode(identifier);
  if (!student) {
    const err = new Error(`Student not found with identifier: ${identifier}`);
    err.statusCode = 404;
    throw err;
  }

  // If changing studentId, ensure new studentId isn't taken
  if (data.studentId && data.studentId.trim() !== student.studentId) {
    const existing = await Student.findOne({ studentId: data.studentId.trim() });
    if (existing && existing._id.toString() !== student._id.toString()) {
      const err = new Error(`Student with ID '${data.studentId.trim()}' already exists`);
      err.statusCode = 409;
      throw err;
    }
    student.studentId = data.studentId.trim();
  }

  if (data.name !== undefined) student.name = data.name.trim();
  if (data.email !== undefined) student.email = data.email.trim().toLowerCase();
  if (data.department !== undefined) student.department = data.department.trim();
  if (data.semester !== undefined) student.semester = `${data.semester}`.trim();
  if (data.contact !== undefined) student.contact = data.contact.trim();
  if (data.emailVerified !== undefined) student.emailVerified = Boolean(data.emailVerified);

  return await student.save();
};

// Service: Delete student
export const deleteStudent = async (identifier) => {
  const student = await findStudentByIdOrCode(identifier);
  if (!student) {
    const err = new Error(`Student not found with identifier: ${identifier}`);
    err.statusCode = 404;
    throw err;
  }

  await Student.findByIdAndDelete(student._id);
  return student;
};
