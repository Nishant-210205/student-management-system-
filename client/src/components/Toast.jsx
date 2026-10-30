import React, { useEffect } from 'react';
import { IconCheck, IconAlertCircle, IconX } from './Icons';

export const Toast = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const { type = 'info', message } = toast;

  return (
    <div
      className={`toast-container toast-${type}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon-wrapper" aria-hidden="true">
        {type === 'success' ? (
          <IconCheck size={18} />
        ) : (
          <IconAlertCircle size={18} />
        )}
      </div>
      <div className="toast-message">{message}</div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onDismiss}
        aria-label="Dismiss notification"
      >
        <IconX size={16} />
      </button>
    </div>
  );
};

