import React, { useState, useEffect, useRef } from 'react';
import { IconX } from './Icons';

export const StudentFormModal = ({
  isOpen,
  isEditing,
  initialData,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    department: '',
    semester: '',
    contact: '',
  });

  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);

  // Sync initialData when modal opens or editing student changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          studentId: initialData.studentId || '',
          name: initialData.name || '',
          email: initialData.email || '',
          department: initialData.department || '',
          semester: initialData.semester || '',
          contact: initialData.contact || '',
        });
      } else {
        setFormData({
          studentId: '',
          name: '',
          email: '',
          department: '',
          semester: '',
          contact: '',
        });
      }
      setErrors({});
      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (formData.studentId.length < 2) {
      newErrors.studentId = 'Student ID must be at least 2 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.semester.trim()) {
      newErrors.semester = 'Semester is required';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="student-modal-title" className="modal-title">
              {isEditing ? 'Edit Student Details' : 'Add New Student'}
            </h2>
            <p className="modal-subtitle">
              {isEditing
                ? 'Update student record information in MongoDB Atlas.'
                : 'Fill in details below to register a new student record.'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-grid">
            {/* Student ID */}
            <div className={`form-field ${errors.studentId ? 'has-error' : ''}`}>
              <label htmlFor="field-studentId">
                Student ID <span className="req">*</span>
              </label>
              <input
                id="field-studentId"
                ref={firstInputRef}
                name="studentId"
                type="text"
                placeholder="e.g. STU1001 or sahil"
                value={formData.studentId}
                onChange={handleChange}
                disabled={isSubmitting || isEditing}
                required
              />
              {isEditing && (
                <span className="field-hint">Student ID serves as the primary unique key</span>
              )}
              {errors.studentId && <span className="field-error">{errors.studentId}</span>}
            </div>

            {/* Full Name */}
            <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="field-name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="field-name"
                name="name"
                type="text"
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="field-email">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="field-email"
                name="email"
                type="email"
                placeholder="e.g. jane.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Department */}
            <div className={`form-field ${errors.department ? 'has-error' : ''}`}>
              <label htmlFor="field-department">
                Department <span className="req">*</span>
              </label>
              <input
                id="field-department"
                name="department"
                type="text"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>

            {/* Semester */}
            <div className={`form-field ${errors.semester ? 'has-error' : ''}`}>
              <label htmlFor="field-semester">
                Semester <span className="req">*</span>
              </label>
              <input
                id="field-semester"
                name="semester"
                type="text"
                placeholder="e.g. 5 or Semester 5"
                value={formData.semester}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.semester && <span className="field-error">{errors.semester}</span>}
            </div>

            {/* Contact */}
            <div className={`form-field ${errors.contact ? 'has-error' : ''}`}>
              <label htmlFor="field-contact">
                Contact Number <span className="req">*</span>
              </label>
              <input
                id="field-contact"
                name="contact"
                type="text"
                placeholder="e.g. +1 555-0199 or 9876543210"
                value={formData.contact}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              />
              {errors.contact && <span className="field-error">{errors.contact}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

