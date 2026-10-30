import React from 'react';
import { IconPlus, IconDownload, IconFilter } from './Icons';

export const Composer = ({
  onAddStudent,
  onExportCSV,
  onToggleFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="fb-composer-card">
      <div className="composer-top">
        <div className="composer-avatar">AD</div>
        <button
          type="button"
          className="composer-input-fake"
          onClick={onAddStudent}
          aria-haspopup="dialog"
        >
          <span>Enroll or register a new student to CampusConnect...</span>
        </button>
      </div>

      <div className="composer-divider" />

      <div className="composer-actions">
        <button
          type="button"
          className="composer-action-btn add-btn"
          onClick={onAddStudent}
        >
          <IconPlus size={18} className="action-icon plus-icon" />
          <span>New Student</span>
        </button>

        <button
          type="button"
          className="composer-action-btn export-btn"
          onClick={onExportCSV}
        >
          <IconDownload size={18} className="action-icon export-icon" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          className={`composer-action-btn filter-btn ${hasActiveFilters ? 'has-filter' : ''}`}
          onClick={onToggleFilters}
        >
          <IconFilter size={18} className="action-icon filter-icon" />
          <span>{hasActiveFilters ? 'Filters Active' : 'Filter & Sort'}</span>
        </button>
      </div>
    </div>
  );
};
