import React from 'react';
import {
  IconUsers,
  IconLayers,
  IconBookOpen,
  IconClock,
  IconEdit,
  IconExternalLink,
} from './Icons';
import { getInitials, getAvatarGradient, formatRelativeTime } from '../utils/avatarHelper';

export const RightSidebar = ({
  stats,
  recentStudents = [],
  onEditStudent,
}) => {
  const {
    total = 0,
    deptCount = 0,
    avgSemester = '0',
    deptDistribution = {},
  } = stats || {};

  const deptEntries = Object.entries(deptDistribution);

  return (
    <aside className="fb-right-sidebar" role="complementary" aria-label="System Metrics & Insights">
      {/* 1. Quick Stats Card */}
      <div className="fb-right-card">
        <div className="right-card-header">
          <h4 className="right-card-title">System Metrics</h4>
          <span className="live-indicator">LIVE</span>
        </div>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <div className="quick-stat-icon users-bg">
              <IconUsers size={16} />
            </div>
            <div className="quick-stat-content">
              <span className="quick-stat-value">{total}</span>
              <span className="quick-stat-label">Students</span>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="quick-stat-icon dept-bg">
              <IconLayers size={16} />
            </div>
            <div className="quick-stat-content">
              <span className="quick-stat-value">{deptCount}</span>
              <span className="quick-stat-label">Departments</span>
            </div>
          </div>

          <div className="quick-stat-item">
            <div className="quick-stat-icon sem-bg">
              <IconBookOpen size={16} />
            </div>
            <div className="quick-stat-content">
              <span className="quick-stat-value">{avgSemester}</span>
              <span className="quick-stat-label">Avg Semester</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Department Share Visualizer (SVG/CSS Chart) */}
      {deptEntries.length > 0 && (
        <div className="fb-right-card">
          <div className="right-card-header">
            <h4 className="right-card-title">Department Share</h4>
            <span className="right-card-meta">{deptEntries.length} depts</span>
          </div>
          <div className="mini-chart-list">
            {deptEntries.map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="mini-chart-item">
                  <div className="mini-chart-info">
                    <span className="mini-dept-name">{dept}</span>
                    <span className="mini-dept-count">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="mini-chart-track">
                    <div
                      className="mini-chart-bar"
                      style={{
                        width: `${pct}%`,
                        background: getAvatarGradient(dept),
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Recently Added Students */}
      {recentStudents.length > 0 && (
        <div className="fb-right-card">
          <div className="right-card-header">
            <h4 className="right-card-title">Recently Enrolled</h4>
            <IconClock size={15} className="clock-icon" />
          </div>
          <div className="recent-students-list">
            {recentStudents.slice(0, 4).map((student) => (
              <div
                key={student._id || student.studentId}
                className="recent-student-item"
                onClick={() => onEditStudent(student)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onEditStudent(student);
                  }
                }}
                title={`Click to edit ${student.name}`}
              >
                <div
                  className="recent-avatar"
                  style={{ background: getAvatarGradient(student.name) }}
                >
                  {getInitials(student.name)}
                </div>
                <div className="recent-info">
                  <span className="recent-name">{student.name}</span>
                  <span className="recent-sub">
                    {student.department} • {formatRelativeTime(student.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  className="recent-edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStudent(student);
                  }}
                  aria-label={`Edit ${student.name}`}
                >
                  <IconEdit size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Architecture Attribution Card */}
      <div className="fb-right-card about-card">
        <h4 className="right-card-title">CampusConnect System</h4>
        <p className="about-desc">
          Three-tier production architecture operating on verified cloud free tiers.
        </p>

        <div className="tier-flow">
          <div className="tier-node">
            <span className="node-title">Tier 1: Client</span>
            <span className="node-tech">React 18 + Vite (Vercel)</span>
          </div>
          <div className="tier-arrow">↓</div>
          <div className="tier-node">
            <span className="node-title">Tier 2: Server</span>
            <span className="node-tech">Express API (Render)</span>
          </div>
          <div className="tier-arrow">↓</div>
          <div className="tier-node">
            <span className="node-title">Tier 3: Database</span>
            <span className="node-tech">MongoDB Atlas M0</span>
          </div>
          <div className="tier-arrow">↔</div>
          <div className="tier-node mcp-node">
            <span className="node-title">AI Layer: MCP</span>
            <span className="node-tech">Claude Desktop Tools</span>
          </div>
        </div>

        <div className="about-footer">
          <a
            href="https://three-tier-student-management-system.onrender.com/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            <span>Live Health Status</span>
            <IconExternalLink size={12} />
          </a>
        </div>
      </div>
    </aside>
  );
};
