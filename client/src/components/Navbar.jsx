import React, { useState } from 'react';
import {
  IconGraduationCap,
  IconSearch,
  IconX,
  IconHome,
  IconUsers,
  IconLayers,
  IconBarChart,
  IconSun,
  IconMoon,
  IconRefresh,
  IconPlus,
  IconMenu,
} from './Icons';

export const Navbar = ({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  dbStatus,
  theme,
  onToggleTheme,
  onRefresh,
  isRefreshing,
  onAddStudent,
  onToggleMobileDrawer,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fb-navbar" role="banner">
      {/* Left: Brand & Search Pill */}
      <div className="fb-navbar-left">
        <button
          type="button"
          className="mobile-drawer-toggle"
          onClick={onToggleMobileDrawer}
          aria-label="Toggle navigation drawer"
        >
          <IconMenu size={22} />
        </button>

        <a href="#feed" className="fb-brand" onClick={() => onTabChange('feed')}>
          <div className="fb-brand-icon" aria-hidden="true">
            <IconGraduationCap size={22} />
          </div>
          <span className="fb-brand-name">Student Portal</span>
        </a>

        <div className="fb-search-pill" role="search">
          <IconSearch size={16} className="search-pill-icon" />
          <input
            type="search"
            placeholder="Search students, IDs, departments..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search students"
          />
          {search && (
            <button
              type="button"
              className="search-pill-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <IconX size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Center: Facebook-Style Icon Tabs */}
      <nav className="fb-navbar-center" role="navigation" aria-label="Main Navigation">
        <button
          type="button"
          className={`fb-nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => onTabChange('feed')}
          title="Home Feed"
          aria-label="Home Feed"
        >
          <IconHome size={22} />
          <span className="tab-underline" />
        </button>

        <button
          type="button"
          className={`fb-nav-tab ${activeTab === 'directory' ? 'active' : ''}`}
          onClick={() => onTabChange('directory')}
          title="Student Directory (Table View)"
          aria-label="Student Directory"
        >
          <IconUsers size={22} />
          <span className="tab-underline" />
        </button>

        <button
          type="button"
          className={`fb-nav-tab ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => onTabChange('departments')}
          title="Departments View"
          aria-label="Departments"
        >
          <IconLayers size={22} />
          <span className="tab-underline" />
        </button>

        <button
          type="button"
          className={`fb-nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
          title="Analytics & Charts"
          aria-label="Analytics"
        >
          <IconBarChart size={22} />
          <span className="tab-underline" />
        </button>
      </nav>

      {/* Right: Actions, Health, Theme, User Avatar */}
      <div className="fb-navbar-right">
        {/* DB Status Badge */}
        <div
          className={`fb-health-pill status-${dbStatus}`}
          title={`Database status: ${dbStatus}`}
          role="status"
          aria-live="polite"
        >
          <span className="fb-pulse-dot" aria-hidden="true" />
          <span className="health-label">DB: {dbStatus}</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          className="fb-round-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh database records"
          aria-label="Refresh database records"
        >
          <IconRefresh size={18} className={isRefreshing ? 'spin-icon' : ''} />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="fb-round-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        {/* Add Student CTA */}
        <button
          type="button"
          className="fb-add-btn"
          onClick={onAddStudent}
          aria-haspopup="dialog"
        >
          <IconPlus size={16} />
          <span className="add-btn-text">Add Student</span>
        </button>

        {/* User Avatar Circle */}
        <div className="fb-user-wrapper">
          <button
            type="button"
            className="fb-avatar-btn"
            onClick={() => setShowUserMenu((prev) => !prev)}
            aria-label="User profile menu"
            aria-expanded={showUserMenu}
          >
            <div className="fb-admin-avatar">AD</div>
          </button>

          {showUserMenu && (
            <div className="fb-user-dropdown" role="menu">
              <div className="dropdown-header">
                <strong>Admin Console</strong>
                <span>Student Portal Manager</span>
              </div>
              <div className="dropdown-divider" />
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  onAddStudent();
                }}
              >
                <IconPlus size={16} />
                <span>Register New Student</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowUserMenu(false);
                  onToggleTheme();
                }}
              >
                {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
                <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
              <div className="dropdown-divider" />
              <div className="dropdown-footer">
                Three-Tier Architecture • React + Express + MongoDB Atlas
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
