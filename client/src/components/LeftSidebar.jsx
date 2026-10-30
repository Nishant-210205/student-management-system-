import React from 'react';
import {
  IconHome,
  IconUsers,
  IconLayers,
  IconBookOpen,
  IconPlus,
  IconDownload,
  IconGithub,
  IconExternalLink,
} from './Icons';

export const LeftSidebar = ({
  activeTab,
  onTabChange,
  departmentFilter,
  onDepartmentChange,
  departments = [],
  deptDistribution = {},
  totalStudents = 0,
  semesterCount = 0,
  onAddStudent,
  onExportCSV,
  isOpen = false,
  onClose,
}) => {
  return (
    <aside className={`fb-left-sidebar ${isOpen ? 'drawer-open' : ''}`} role="complementary" aria-label="Sidebar Navigation">
      {/* User Profile Card */}
      <div className="fb-sidebar-profile">
        <div className="fb-profile-avatar">AD</div>
        <div className="fb-profile-text">
          <span className="profile-name">Campus Administrator</span>
          <span className="profile-role">Student Records Manager</span>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Main Shortcuts Navigation */}
      <nav className="fb-sidebar-nav" aria-label="Shortcuts">
        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'feed' && !departmentFilter ? 'active' : ''}`}
          onClick={() => {
            onTabChange('feed');
            onDepartmentChange('');
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper home-icon">
            <IconHome size={18} />
          </div>
          <span className="nav-label">Home Feed</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => {
            onTabChange('directory');
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper students-icon">
            <IconUsers size={18} />
          </div>
          <span className="nav-label">All Students</span>
          <span className="nav-badge">{totalStudents}</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => {
            onTabChange('departments');
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper dept-icon">
            <IconLayers size={18} />
          </div>
          <span className="nav-label">Departments</span>
          <span className="nav-badge">{departments.length}</span>
        </button>

        <button
          type="button"
          className="sidebar-nav-item"
          onClick={() => {
            onTabChange('analytics');
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper sem-icon">
            <IconBookOpen size={18} />
          </div>
          <span className="nav-label">Semesters</span>
          <span className="nav-badge">{semesterCount}</span>
        </button>

        <button
          type="button"
          className="sidebar-nav-item"
          onClick={() => {
            onAddStudent();
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper add-icon">
            <IconPlus size={18} />
          </div>
          <span className="nav-label">Register Student</span>
        </button>

        <button
          type="button"
          className="sidebar-nav-item"
          onClick={() => {
            onExportCSV();
            onClose?.();
          }}
        >
          <div className="nav-icon-wrapper export-icon">
            <IconDownload size={18} />
          </div>
          <span className="nav-label">Export CSV</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Department Quick Filter List */}
      <div className="fb-sidebar-section">
        <div className="sidebar-section-header">
          <span className="section-title">Department Filters</span>
          {departmentFilter && (
            <button
              type="button"
              className="btn-clear-dept"
              onClick={() => onDepartmentChange('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="dept-filter-list">
          <button
            type="button"
            className={`dept-filter-btn ${departmentFilter === '' ? 'active' : ''}`}
            onClick={() => onDepartmentChange('')}
          >
            <span className="dept-filter-dot" />
            <span className="dept-filter-name">All Departments</span>
            <span className="dept-filter-count">{totalStudents}</span>
          </button>

          {departments.map((d) => (
            <button
              key={d}
              type="button"
              className={`dept-filter-btn ${departmentFilter.toLowerCase() === d.toLowerCase() ? 'active' : ''}`}
              onClick={() => onDepartmentChange(d)}
            >
              <span className="dept-filter-dot" />
              <span className="dept-filter-name">{d}</span>
              <span className="dept-filter-count">{deptDistribution[d] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Sidebar Footer Info */}
      <div className="fb-sidebar-footer">
        <a
          href="https://github.com/co2023smniyazi/three-tier-student-management-system"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-footer-link"
        >
          <IconGithub size={14} />
          <span>GitHub Repository</span>
          <IconExternalLink size={10} />
        </a>
        <p className="sidebar-copyright">CampusConnect • MIT License</p>
      </div>
    </aside>
  );
};
