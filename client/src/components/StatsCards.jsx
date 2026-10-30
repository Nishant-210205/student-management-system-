import React from 'react';
import {
  IconUsers,
  IconLayers,
  IconBookOpen,
  IconClock,
} from './Icons';

export const StatsCards = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="stats-grid" aria-busy="true" aria-label="Loading statistics">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton-card">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-value" />
            <div className="skeleton-line skeleton-sub" />
          </div>
        ))}
      </div>
    );
  }

  const {
    total = 0,
    deptCount = 0,
    avgSemester = '0',
    deptDistribution = {},
    recentStudent = null,
  } = stats || {};

  const deptEntries = Object.entries(deptDistribution);

  return (
    <section className="stats-section" aria-label="System Metrics">
      <div className="stats-grid">
        {/* Metric 1: Total Students */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Students</span>
            <div className="stat-icon-wrapper" aria-hidden="true">
              <IconUsers size={20} />
            </div>
          </div>
          <div className="stat-value">{total}</div>
          <div className="stat-meta">
            {total === 1 ? '1 record in database' : `${total} records in database`}
          </div>
        </div>

        {/* Metric 2: Active Departments */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Departments</span>
            <div className="stat-icon-wrapper" aria-hidden="true">
              <IconLayers size={20} />
            </div>
          </div>
          <div className="stat-value">{deptCount}</div>
          <div className="stat-meta">
            {deptCount === 1 ? '1 active department' : `${deptCount} active departments`}
          </div>
        </div>

        {/* Metric 3: Average Semester */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Semester</span>
            <div className="stat-icon-wrapper" aria-hidden="true">
              <IconBookOpen size={20} />
            </div>
          </div>
          <div className="stat-value">{avgSemester}</div>
          <div className="stat-meta">Across enrolled students</div>
        </div>

        {/* Metric 4: Latest Student */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Latest Enrolled</span>
            <div className="stat-icon-wrapper" aria-hidden="true">
              <IconClock size={20} />
            </div>
          </div>
          <div className="stat-value stat-value-truncate">
            {recentStudent ? recentStudent.name : '—'}
          </div>
          <div className="stat-meta">
            {recentStudent ? `ID: ${recentStudent.studentId}` : 'No enrollments yet'}
          </div>
        </div>
      </div>

      {/* Distribution visualizer (if there are students) */}
      {total > 0 && deptEntries.length > 0 && (
        <div className="distribution-card">
          <div className="distribution-header">
            <h3 className="distribution-title">Department Distribution</h3>
            <span className="distribution-subtitle">{deptEntries.length} departments represented</span>
          </div>
          <div className="dept-bars">
            {deptEntries.map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="dept-bar-row">
                  <div className="dept-bar-info">
                    <span className="dept-name">{dept}</span>
                    <span className="dept-count">
                      {count} {count === 1 ? 'student' : 'students'} ({pct}%)
                    </span>
                  </div>
                  <div
                    className="dept-bar-track"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label={`${dept}: ${pct}%`}
                  >
                    <div className="dept-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

