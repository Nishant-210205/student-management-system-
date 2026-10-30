import React, { useState } from 'react';
import {
  IconEdit,
  IconTrash,
  IconMail,
  IconPhone,
  IconBookOpen,
  IconLayers,
  IconMoreHorizontal,
  IconCheck,
} from './Icons';
import { getInitials, getAvatarGradient, formatRelativeTime } from '../utils/avatarHelper';

export const StudentCard = ({
  student,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyId = () => {
    if (student.studentId) {
      navigator.clipboard?.writeText(student.studentId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="fb-post-card" aria-label={`Student card for ${student.name}`}>
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-wrapper">
          <div
            className="post-avatar"
            style={{ background: getAvatarGradient(student.name) }}
            aria-hidden="true"
          >
            {getInitials(student.name)}
          </div>
          <div className="post-author-meta">
            <h3 className="post-author-name">{student.name}</h3>
            <div className="post-sub-info">
              <span className="post-student-id">ID: {student.studentId}</span>
              <span className="post-bullet">•</span>
              <span className="post-timestamp">{formatRelativeTime(student.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* More Actions Dropdown */}
        <div className="post-options-wrapper">
          <button
            type="button"
            className="post-options-btn"
            onClick={() => setShowMenu((prev) => !prev)}
            aria-label="Student options menu"
            aria-expanded={showMenu}
          >
            <IconMoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="post-menu-dropdown" role="menu">
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowMenu(false);
                  onEdit(student);
                }}
              >
                <IconEdit size={15} />
                <span>Edit Student</span>
              </button>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  setShowMenu(false);
                  handleCopyId();
                }}
              >
                {copied ? <IconCheck size={15} /> : <IconLayers size={15} />}
                <span>{copied ? 'ID Copied!' : 'Copy Student ID'}</span>
              </button>
              <button
                type="button"
                className="dropdown-item danger-item"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(student);
                }}
              >
                <IconTrash size={15} />
                <span>Delete Student</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Content / Details Grid */}
      <div className="post-content">
        <div className="academic-badges">
          <div className="academic-badge dept-badge">
            <IconLayers size={14} />
            <span>{student.department}</span>
          </div>

          <div className="academic-badge sem-badge">
            <IconBookOpen size={14} />
            <span>Semester {student.semester}</span>
          </div>
        </div>

        <div className="contact-info-grid">
          <a
            href={`mailto:${student.email}`}
            className="contact-item email-link"
            title={`Send email to ${student.email}`}
          >
            <IconMail size={15} className="contact-icon" />
            <span className="contact-text">{student.email}</span>
          </a>

          <a
            href={`tel:${student.contact}`}
            className="contact-item phone-link"
            title={`Call ${student.contact}`}
          >
            <IconPhone size={15} className="contact-icon" />
            <span className="contact-text">{student.contact}</span>
          </a>
        </div>
      </div>

      {/* Post Actions Footer */}
      <div className="post-divider" />
      <div className="post-actions">
        <button
          type="button"
          className="post-action-btn edit-action"
          onClick={() => onEdit(student)}
        >
          <IconEdit size={16} />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          className="post-action-btn copy-action"
          onClick={handleCopyId}
        >
          {copied ? <IconCheck size={16} /> : <IconLayers size={16} />}
          <span>{copied ? 'ID Copied' : 'Copy ID'}</span>
        </button>

        <button
          type="button"
          className="post-action-btn delete-action"
          onClick={() => onDelete(student)}
        >
          <IconTrash size={16} />
          <span>Delete</span>
        </button>
      </div>
    </article>
  );
};
