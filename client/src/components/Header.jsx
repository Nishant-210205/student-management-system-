import React from 'react';
import {
  IconGraduationCap,
  IconSun,
  IconMoon,
  IconPlus,
  IconRefresh,
} from './Icons';

export const Header = ({
  dbStatus,
  theme,
  onToggleTheme,
  onAddStudent,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="app-header" role="banner">
      <div className="header-brand">
        <div className="brand-icon-wrapper" aria-hidden="true">
          <IconGraduationCap size={28} className="brand-icon" />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Student Portal</h1>
          <p className="brand-subtitle">
            Three-Tier Student Management System • React + Express + MongoDB Atlas
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div
          className={`health-badge status-${dbStatus}`}
          title={`Database status: ${dbStatus}`}
          role="status"
          aria-live="polite"
        >
          <span className="pulse-dot" aria-hidden="true" />
          <span className="badge-label">
            DB: <strong>{dbStatus}</strong>
          </span>
        </div>

        <button
          type="button"
          className="btn-icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <IconRefresh size={18} className={isRefreshing ? 'spin-icon' : ''} />
        </button>

        <button
          type="button"
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onAddStudent}
          aria-haspopup="dialog"
        >
          <IconPlus size={18} />
          <span>Add Student</span>
        </button>
      </div>
    </header>
  );
};

