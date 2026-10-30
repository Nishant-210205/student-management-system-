import React, { useState, useMemo } from 'react';
import {
  IconEdit,
  IconTrash,
  IconSortAsc,
  IconSortDesc,
  IconSortDefault,
  IconChevronLeft,
  IconChevronRight,
} from './Icons';
import { SkeletonRow, SkeletonMobileCard } from './Skeleton';
import { EmptyState } from './EmptyState';

export const StudentTable = ({
  students = [],
  loading = false,
  isWakingUp = false,
  error = null,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onClearFilters,
  onAddStudent,
  onRetry,
  hasActiveFilters = false,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 if total students or filters change
  const total = students.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(total / pageSize));

  // Compute paginated slice
  const paginatedStudents = useMemo(() => {
    if (pageSize === 'all') return students;
    const start = (currentPage - 1) * pageSize;
    return students.slice(start, start + pageSize);
  }, [students, currentPage, pageSize]);

  // Adjust current page if out of bounds
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Sort indicator icon helper
  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <IconSortDefault size={14} className="sort-icon-ghost" />;
    }
    return sortOrder === 'asc' ? (
      <IconSortAsc size={14} className="sort-icon-active" />
    ) : (
      <IconSortDesc size={14} className="sort-icon-active" />
    );
  };

  if (isWakingUp) {
    return <EmptyState type="cold-start" />;
  }

  if (error && students.length === 0) {
    return (
      <EmptyState
        type="error"
        errorMessage={error}
        onRetry={onRetry}
      />
    );
  }

  if (!loading && students.length === 0) {
    return hasActiveFilters ? (
      <EmptyState type="search" onClearSearch={onClearFilters} />
    ) : (
      <EmptyState type="empty" onAddStudent={onAddStudent} />
    );
  }

  return (
    <div className="table-card">
      {/* Desktop Table View */}
      <div className="table-responsive">
        <table className="student-table" aria-label="Students Directory">
          <thead>
            <tr>
              <th
                scope="col"
                className="sortable-th"
                onClick={() => onSort('studentId')}
                aria-sort={sortBy === 'studentId' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="th-content">
                  <span>Student ID</span>
                  {renderSortIcon('studentId')}
                </div>
              </th>
              <th
                scope="col"
                className="sortable-th"
                onClick={() => onSort('name')}
                aria-sort={sortBy === 'name' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="th-content">
                  <span>Full Name</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th scope="col">Email</th>
              <th
                scope="col"
                className="sortable-th"
                onClick={() => onSort('department')}
                aria-sort={sortBy === 'department' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="th-content">
                  <span>Department</span>
                  {renderSortIcon('department')}
                </div>
              </th>
              <th
                scope="col"
                className="sortable-th"
                onClick={() => onSort('semester')}
                aria-sort={sortBy === 'semester' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="th-content">
                  <span>Semester</span>
                  {renderSortIcon('semester')}
                </div>
              </th>
              <th scope="col">Contact</th>
              <th scope="col" className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : (
              paginatedStudents.map((student) => (
                <tr key={student._id || student.studentId} className="student-row">
                  <td className="cell-id">
                    <span className="id-badge">{student.studentId}</span>
                  </td>
                  <td className="cell-name">
                    <strong>{student.name}</strong>
                  </td>
                  <td className="cell-email">
                    <a href={`mailto:${student.email}`} className="email-link">
                      {student.email}
                    </a>
                  </td>
                  <td className="cell-dept">
                    <span className="dept-tag">{student.department}</span>
                  </td>
                  <td className="cell-sem">{student.semester}</td>
                  <td className="cell-contact">{student.contact}</td>
                  <td className="cell-actions">
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="btn-icon btn-action-edit"
                        onClick={() => onEdit(student)}
                        title={`Edit ${student.name}`}
                        aria-label={`Edit ${student.name}`}
                      >
                        <IconEdit size={16} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-action-delete"
                        onClick={() => onDelete(student)}
                        title={`Delete ${student.name}`}
                        aria-label={`Delete ${student.name}`}
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (< 768px) */}
      <div className="mobile-cards-list" aria-label="Students Directory Mobile View">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonMobileCard key={i} />)
        ) : (
          paginatedStudents.map((student) => (
            <div key={student._id || student.studentId} className="student-mobile-card">
              <div className="mobile-card-top">
                <span className="id-badge">{student.studentId}</span>
                <span className="dept-tag">{student.department}</span>
              </div>
              <h4 className="mobile-card-name">{student.name}</h4>
              <div className="mobile-card-detail">
                <span className="mobile-card-label">Email:</span>{' '}
                <a href={`mailto:${student.email}`} className="email-link">
                  {student.email}
                </a>
              </div>
              <div className="mobile-card-detail">
                <span className="mobile-card-label">Semester:</span> {student.semester}
              </div>
              <div className="mobile-card-detail">
                <span className="mobile-card-label">Contact:</span> {student.contact}
              </div>
              <div className="mobile-card-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onEdit(student)}
                >
                  <IconEdit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(student)}
                >
                  <IconTrash size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {total > 0 && (
        <div className="table-pagination">
          <div className="pagination-info">
            Showing{' '}
            <strong>
              {pageSize === 'all'
                ? `1–${total}`
                : `${Math.min((currentPage - 1) * pageSize + 1, total)}–${Math.min(
                    currentPage * pageSize,
                    total
                  )}`}
            </strong>{' '}
            of <strong>{total}</strong> students
          </div>

          <div className="pagination-controls">
            <div className="page-size-selector">
              <label htmlFor="page-size-select">Per page:</label>
              <select
                id="page-size-select"
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value="all">All</option>
              </select>
            </div>

            {pageSize !== 'all' && (
              <div className="pagination-nav">
                <button
                  type="button"
                  className="btn-icon btn-page-nav"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  aria-label="Previous Page"
                >
                  <IconChevronLeft size={16} />
                </button>
                <span className="pagination-page-indicator">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  type="button"
                  className="btn-icon btn-page-nav"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  aria-label="Next Page"
                >
                  <IconChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

