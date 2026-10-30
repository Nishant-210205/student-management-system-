import React from 'react';
import {
  IconHome,
  IconUsers,
  IconPlus,
  IconLayers,
  IconBarChart,
} from './Icons';

export const MobileNav = ({
  activeTab,
  onTabChange,
  onAddStudent,
  onToggleDrawer,
}) => {
  return (
    <nav className="fb-mobile-nav" role="navigation" aria-label="Mobile Navigation">
      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => onTabChange('feed')}
        aria-label="Home Feed"
      >
        <IconHome size={22} />
        <span className="mobile-nav-label">Feed</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'directory' ? 'active' : ''}`}
        onClick={() => onTabChange('directory')}
        aria-label="Student Directory"
      >
        <IconUsers size={22} />
        <span className="mobile-nav-label">Students</span>
      </button>

      {/* Floating Action Button */}
      <div className="mobile-fab-wrapper">
        <button
          type="button"
          className="mobile-fab-btn"
          onClick={onAddStudent}
          aria-label="Register New Student"
        >
          <IconPlus size={24} />
        </button>
      </div>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'departments' ? 'active' : ''}`}
        onClick={() => onTabChange('departments')}
        aria-label="Departments"
      >
        <IconLayers size={22} />
        <span className="mobile-nav-label">Depts</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        onClick={() => {
          onTabChange('analytics');
          onToggleDrawer?.();
        }}
        aria-label="Stats & Menu"
      >
        <IconBarChart size={22} />
        <span className="mobile-nav-label">Stats</span>
      </button>
    </nav>
  );
};
