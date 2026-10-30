/**
 * Export student data to CSV format and trigger browser download
 * Zero external dependencies.
 */
export const exportStudentsToCSV = (students, filename = 'students.csv') => {
  if (!students || students.length === 0) {
    return false;
  }

  const headers = ['Student ID', 'Full Name', 'Email', 'Department', 'Semester', 'Contact Number', 'Created At'];

  const rows = students.map((s) => [
    s.studentId || '',
    s.name || '',
    s.email || '',
    s.department || '',
    s.semester || '',
    s.contact || '',
    s.createdAt ? new Date(s.createdAt).toISOString() : '',
  ]);

  const escapeCSV = (val) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
};

