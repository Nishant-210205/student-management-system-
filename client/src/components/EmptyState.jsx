import React from 'react';
import {
  IconUsers,
  IconSearch,
  IconRefresh,
  IconPlus,
} from './Icons';

export const EmptyState = ({
  type = 'empty',
  searchQuery = '',
  onClearSearch,
  onAddStudent,
  onRetry,
  errorMessage,
}) => {
  if (type === 'cold-start') {
    return (
      <div className="empty-state cold-start-state" role="status">
        <div className="empty-state-icon pulse-glow">
          <IconRefresh size={36} className="spin-icon" />
        </div>
        <h3 className="empty-state-title">Server is Waking Up...</h3>
        <p className="empty-state-text">
          The Render backend is hosted on a free-tier instance which spins down
          after 15 minutes of inactivity. Initial startup may take 30–50 seconds.
          Thank you for your patience!
        </p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="empty-state error-state" role="alert">
        <div className="empty-state-icon error-icon-bg">
          <IconRefresh size={32} />
        </div>
        <h3 className="empty-state-title">Unable to Connect to Backend</h3>
        <p className="empty-state-text">
          {errorMessage || 'Failed to reach the backend API. Please check your connection or try again.'}
        </p>
        {onRetry && (
          <button type="button" className="btn btn-secondary" onClick={onRetry}>
            <IconRefresh size={16} />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'search') {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon">
          <IconSearch size={32} />
        </div>
        <h3 className="empty-state-title">No Matching Students Found</h3>
        <p className="empty-state-text">
          {searchQuery
            ? `No records matched your search query "${searchQuery}".`
            : 'No records matched your selected filters.'}
        </p>
        {onClearSearch && (
          <button type="button" className="btn btn-secondary" onClick={onClearSearch}>
            Clear Search & Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon">
        <IconUsers size={36} />
      </div>
      <h3 className="empty-state-title">No Student Records Yet</h3>
      <p className="empty-state-text">
        The database is currently empty. Get started by adding your first student record.
      </p>
      {onAddStudent && (
        <button type="button" className="btn btn-primary" onClick={onAddStudent}>
          <IconPlus size={16} />
          <span>Add First Student</span>
        </button>
      )}
    </div>
  );
};

