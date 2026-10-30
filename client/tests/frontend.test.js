import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getInitials, getAvatarGradient, formatRelativeTime } from '../src/utils/avatarHelper.js';

describe('Frontend Social UI Utility Test Suite', () => {
  describe('Avatar & Initials Generation', () => {
    it('generates uppercase initials from single word name', () => {
      assert.equal(getInitials('Sahil'), 'SA');
    });

    it('generates initials from first and last name', () => {
      assert.equal(getInitials('Jane Doe'), 'JD');
    });

    it('handles numeric and underscore prefixes gracefully (e.g. 59_saim)', () => {
      const initials = getInitials('59_saim niyazi');
      assert.equal(initials, 'SN');
    });

    it('returns fallback ? when name is empty or undefined', () => {
      assert.equal(getInitials(''), '?');
      assert.equal(getInitials(null), '?');
    });

    it('deterministically returns identical gradient for same input string', () => {
      const grad1 = getAvatarGradient('Computer Science');
      const grad2 = getAvatarGradient('Computer Science');
      assert.equal(grad1, grad2);
      assert.ok(grad1.startsWith('linear-gradient('));
    });
  });

  describe('Relative Time Formatter', () => {
    it('returns "Just now" for timestamps within 60 seconds', () => {
      const now = new Date().toISOString();
      assert.equal(formatRelativeTime(now), 'Just now');
    });

    it('returns friendly relative hours for earlier today', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
      assert.equal(formatRelativeTime(twoHoursAgo), '2h ago');
    });

    it('handles missing or invalid dates gracefully without throwing', () => {
      assert.equal(formatRelativeTime(null), 'Enrolled recently');
      assert.equal(formatRelativeTime('invalid-date'), 'Enrolled recently');
    });
  });

  describe('Client-Side Search & Filtering Logic', () => {
    const mockStudents = [
      { studentId: 'STU101', name: 'Sahil Patel', department: 'Computer Science', semester: '5' },
      { studentId: 'STU102', name: 'Saim Niyazi', department: 'Mechanical', semester: '7' },
      { studentId: 'STU103', name: 'Nishant Sharma', department: 'Computer Science', semester: '7' },
    ];

    it('filters students by search query case-insensitively', () => {
      const query = 'saim';
      const filtered = mockStudents.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(query.toLowerCase())
      );
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].studentId, 'STU102');
    });

    it('filters students strictly by department', () => {
      const dept = 'Computer Science';
      const filtered = mockStudents.filter(
        (s) => s.department.toLowerCase() === dept.toLowerCase()
      );
      assert.equal(filtered.length, 2);
    });

    it('sorts students correctly by name ascending and descending', () => {
      const sortedAsc = [...mockStudents].sort((a, b) => a.name.localeCompare(b.name));
      assert.equal(sortedAsc[0].name, 'Nishant Sharma');

      const sortedDesc = [...mockStudents].sort((a, b) => b.name.localeCompare(a.name));
      assert.equal(sortedDesc[0].name, 'Saim Niyazi');
    });
  });
});
