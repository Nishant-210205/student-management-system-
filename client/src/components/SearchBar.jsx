import React from 'react';
import {
  IconSearch,
  IconX,
  IconDownload,
  IconSortAsc,
  IconSortDesc,
} from './Icons';

export const SearchBar = ({
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  semesterFilter,
  onSemesterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  departments = [],
  semesters = [],
  totalCount = 0,
  filteredCount = 0,
  onExportCSV,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(search || departmentFilter || semesterFilter);

  return (
    <div className="search-filter-card" role="search" aria-label="Search and filter students">
      <div className="search-filter-primary">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <IconSearch size={18} className="search-icon" />
          <input
            type="search"
            className="search-input"
            placeholder="Search by name, ID, email, department..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search students"
          />
          {search && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => onSearchChange('')}
              title="Clear search text"
              aria-label="Clear search text"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Export CSV Button */}
        <button
          type="button"
          className="btn btn-secondary btn-export"
          onClick={onExportCSV}
          disabled={filteredCount === 0}
          title="Export current view to CSV"
        >
          <IconDownload size={16} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="search-filter-secondary">
        {/* Department Filter */}
        <div className="filter-item">
          <label htmlFor="dept-filter" className="filter-label">
            Department:
          </label>
          <select
            id="dept-filter"
            className="filter-select"
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div className="filter-item">
          <label htmlFor="sem-filter" className="filter-label">
            Semester:
          </label>
          <select
            id="sem-filter"
            className="filter-select"
            value={semesterFilter}
            onChange={(e) => onSemesterChange(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Field */}
        <div className="filter-item">
          <label htmlFor="sort-field" className="filter-label">
            Sort by:
          </label>
          <select
            id="sort-field"
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="studentId">Student ID</option>
            <option value="department">Department</option>
            <option value="semester">Semester</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>

        {/* Sort Direction Toggle */}
        <button
          type="button"
          className="btn-icon sort-direction-btn"
          onClick={onToggleSortOrder}
          title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          aria-label={`Toggle sort order, currently ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          {sortOrder === 'asc' ? <IconSortAsc size={16} /> : <IconSortDesc size={16} />}
        </button>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-text-clear"
            onClick={onResetFilters}
            title="Reset search and filters"
          >
            Clear Filters
          </button>
        )}

        <div className="filter-result-count">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong>
        </div>
      </div>
    </div>
  );
};

