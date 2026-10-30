import http from 'http';

const PORT = 5000;

const mockStudents = [
  {
    _id: 'mock-1',
    studentId: 'DEMO-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@campusconnect.edu',
    department: 'Computer Science',
    semester: '6',
    contact: '+1 555-0142',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    studentId: 'DEMO-102',
    name: 'Maya Lin',
    email: 'maya.lin@campusconnect.edu',
    department: 'Data Science',
    semester: '4',
    contact: '+1 555-0188',
    createdAt: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-3',
    studentId: 'DEMO-103',
    name: 'Sarah Jenkins',
    email: 'sarah.j@campusconnect.edu',
    department: 'Computer Science',
    semester: '6',
    contact: '+1 555-0211',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-4',
    studentId: 'DEMO-104',
    name: 'David Chen',
    email: 'david.chen@campusconnect.edu',
    department: 'Electrical Eng',
    semester: '5',
    contact: '+1 555-0399',
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-5',
    studentId: 'DEMO-105',
    name: 'Elena Rostova',
    email: 'elena.r@campusconnect.edu',
    department: 'Cybersecurity',
    semester: '7',
    contact: '+1 555-0455',
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        status: 'healthy',
        version: '1.0.0',
        database: 'connected (mock)',
        hasMongoUri: true,
        diagnostic: 'Mock in-memory database for visual verification',
        uptime: Math.round(process.uptime()),
      })
    );
  }

  if (url.pathname === '/api/students') {
    const search = (url.searchParams.get('search') || '').toLowerCase();
    const filtered = search
      ? mockStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.studentId.toLowerCase().includes(search) ||
            s.department.toLowerCase().includes(search)
        )
      : mockStudents;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        success: true,
        count: filtered.length,
        data: filtered,
      })
    );
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`[Mock Backend] Running on http://localhost:${PORT} (Zero Atlas Calls)`);
});
