// Base API URL configuration:
// Priority:
// 1. import.meta.env.VITE_API_BASE_URL (if configured on Vercel or locally)
// 2. Relative '/api' (proxied via vercel.json rewrite in production or vite.config.js in development)
// Automatically validates URLs, normalizes trailing slashes, and ensures resilience against misconfigured env vars
export const getApiBase = (
  rawEnvUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined
) => {
  let envUrl = (rawEnvUrl || '').trim().replace(/\/+$/, '');

  // If empty or explicitly '/api', use relative '/api'
  if (!envUrl || envUrl === '/api') {
    return '/api';
  }

  // If user passed a bare hostname (e.g. "three-tier-student-management-system.onrender.com"), prepend https://
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(envUrl)) {
    envUrl = `https://${envUrl}`;
  }

  // If not a valid absolute URL (http:// or https://) or valid leading slash (/), fall back safely to '/api'
  if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
    console.warn(`[API] Invalid VITE_API_BASE_URL ("${envUrl}"). Falling back to relative /api.`);
    return '/api';
  }

  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_BASE = getApiBase();

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  let data = {};

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON response from API, but received ${contentType || 'non-JSON content'}.`);
  }

  return data;
};

export const api = {
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  getAllStudents: async (search = '') => {
    const url = search ? `${API_BASE}/students?search=${encodeURIComponent(search)}` : `${API_BASE}/students`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  getStudentById: async (id) => {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`);
    return handleResponse(res);
  },

  createStudent: async (studentData) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  updateStudent: async (id, studentData) => {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    return handleResponse(res);
  },

  deleteStudent: async (id) => {
    const res = await fetch(`${API_BASE}/students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
