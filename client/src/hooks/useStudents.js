import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';

export const useStudents = (search = '') => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('checking');
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // Check backend & DB health
  const checkHealth = useCallback(async () => {
    try {
      const data = await api.checkHealth();
      setDbStatus(data.database || 'connected');
    } catch {
      setDbStatus('disconnected');
    }
  }, []);

  // Load students with Render free-tier cold-start detector
  const loadStudents = useCallback(async (query = '') => {
    setLoading(true);
    setError(null);

    // If request takes > 3.5 seconds, notify user that the server is waking up
    const wakeTimer = setTimeout(() => {
      setIsWakingUp(true);
    }, 3500);

    try {
      const res = await api.getAllStudents(query);
      setStudents(res.data || []);
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      setLastUpdated(Date.now());
    } catch (err) {
      clearTimeout(wakeTimer);
      setIsWakingUp(false);
      setError(err.message || 'Failed to load student records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    loadStudents(search);
  }, [loadStudents, search]);

  // Aggregate statistics for the dashboard
  const stats = useMemo(() => {
    const total = students.length;
    const depts = new Set(students.map((s) => s.department).filter(Boolean));
    const deptCount = depts.size;

    // Parse numeric semester values
    const numericSemesters = students
      .map((s) => {
        const match = String(s.semester || '').match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
      })
      .filter((n) => n !== null);

    const avgSemester =
      numericSemesters.length > 0
        ? (numericSemesters.reduce((a, b) => a + b, 0) / numericSemesters.length).toFixed(1)
        : total > 0
        ? 'N/A'
        : '0';

    // Distribution by department
    const deptDistribution = {};
    students.forEach((s) => {
      const d = s.department || 'Unassigned';
      deptDistribution[d] = (deptDistribution[d] || 0) + 1;
    });

    // Distribution by semester
    const semDistribution = {};
    students.forEach((s) => {
      const sem = s.semester || 'Other';
      semDistribution[sem] = (semDistribution[sem] || 0) + 1;
    });

    const recentStudent = students[0] || null;

    return {
      total,
      deptCount,
      avgSemester,
      deptDistribution,
      semDistribution,
      recentStudent,
      departmentsList: Array.from(depts).sort(),
    };
  }, [students]);

  return {
    students,
    loading,
    error,
    dbStatus,
    isWakingUp,
    stats,
    lastUpdated,
    refresh: () => loadStudents(search),
    checkHealth,
  };
};

