import React, { useEffect, useRef } from 'react';
import { IconAlertCircle, IconX } from './Icons';

export const ConfirmDialog = ({
  isOpen,
  title = 'Delete Student Record',
  student,
  onConfirm,
  onCancel,
  isConfirming = false,
}) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen || !student) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isConfirming) {
          onCancel();
        }
      }}
    >
      <div
        className="modal-dialog modal-dialog-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="modal-header">
          <div className="confirm-icon-title">
            <div className="confirm-warning-icon" aria-hidden="true">
              <IconAlertCircle size={24} />
            </div>
            <h2 id="confirm-dialog-title" className="modal-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isConfirming}
            aria-label="Close dialog"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body" id="confirm-dialog-desc">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong>{student.name}</strong> (Student ID:{' '}
            <code>{student.studentId}</code>)?
          </p>
          <div className="danger-notice">
            This action deletes the record from the live MongoDB Atlas database.
          </div>
        </div>

        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Deleting...' : 'Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

