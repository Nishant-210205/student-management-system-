import React, { useState, useMemo } from 'react';
import { useStudents } from './hooks/useStudents';
import { useTheme } from './hooks/useTheme';
import { useDebounce } from './hooks/useDebounce';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StoriesBar } from './components/StoriesBar';
import { Composer } from './components/Composer';
import { StudentCard } from './components/StudentCard';
import { StudentTable } from './components/StudentTable';
import { StudentFormModal } from './components/StudentFormModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast } from './components/Toast';
import { EmptyState } from './components/EmptyState';
import { SkeletonMobileCard } from './components/Skeleton';
import { MobileNav } from './components/MobileNav';
import { Footer } from './components/Footer';
import {
  IconGrid,
  IconList,
  IconSortAsc,
  IconSortDesc,
  IconX,
  IconFilter,
} from './components/Icons';
import { exportStudentsToCSV } from './utils/csvExport';
import { api } from './api';
import './App.css';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Navigation & View Mode state
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'directory' | 'departments' | 'analytics'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);

  // Search, Filter & Sort state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' | 'name' | 'studentId' | 'department'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Modal & Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification toast state
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // Data hook
  const {
    students,
    loading,
    error,
    dbStatus,
    isWakingUp,
    stats,
    refresh,
    checkHealth,
  } = useStudents(debouncedSearch);

  // Department & semester lists
  const availableDepartments = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [students]);

  const availableSemesters = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.semester) set.add(s.semester);
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(String(a).match(/\d+/)?.[0] || '0', 10);
      const numB = parseInt(String(b).match(/\d+/)?.[0] || '0', 10);
      return numA - numB;
    });
  }, [students]);

  // Client-side filtering and sorting
  const processedStudents = useMemo(() => {
    let result = [...students];

    if (departmentFilter) {
      result = result.filter(
        (s) => s.department?.toLowerCase() === departmentFilter.toLowerCase()
      );
    }

    if (semesterFilter) {
      result = result.filter(
        (s) => s.semester?.toLowerCase() === semesterFilter.toLowerCase()
      );
    }

    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, departmentFilter, semesterFilter, sortBy, sortOrder]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), checkHealth()]);
      showToast('success', 'Records & server health refreshed.');
    } catch {
      showToast('error', 'Failed to refresh records from server.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const success = exportStudentsToCSV(
      processedStudents,
      `campusconnect-students-${new Date().toISOString().slice(0, 10)}.csv`
    );
    if (success) {
      showToast('success', `Exported ${processedStudents.length} student records to CSV.`);
    } else {
      showToast('error', 'No student records available to export.');
    }
  };

  // Open modal handlers
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (!isSubmitting) {
      setIsFormOpen(false);
      setEditingStudent(null);
    }
  };

  // Submit form (create or edit)
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const idToUpdate = editingStudent._id || editingStudent.studentId;
        await api.updateStudent(idToUpdate, formData);
        showToast('success', `Updated details for ${formData.name}.`);
      } else {
        await api.createStudent(formData);
        showToast('success', `Enrolled ${formData.name} successfully!`);
      }
      setIsFormOpen(false);
      setEditingStudent(null);
      refresh();
    } catch (err) {
      showToast('error', err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete student handlers
  const handleOpenDelete = (student) => {
    setStudentToDelete(student);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const idToDelete = studentToDelete._id || studentToDelete.studentId;
      await api.deleteStudent(idToDelete);
      showToast('success', `Deleted record for ${studentToDelete.name}.`);
      setIsConfirmOpen(false);
      setStudentToDelete(null);
      refresh();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete student.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Tab change handler (sync view mode if needed)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'directory') {
      setViewMode('table');
    } else if (tab === 'feed') {
      setViewMode('cards');
    }
  };

  const hasActiveFilters = Boolean(searchInput || departmentFilter || semesterFilter);

  return (
    <div className="fb-app-wrapper">
      {/* Top Sticky Navigation */}
      <Navbar
        search={searchInput}
        onSearchChange={setSearchInput}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        dbStatus={dbStatus}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onAddStudent={handleOpenAdd}
        onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Main 3-Column Social Container */}
      <div className="fb-layout-container">
        {/* Mobile Backdrop for drawer */}
        {isMobileDrawerOpen && (
          <div
            className="mobile-drawer-backdrop"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Column 1: Left Navigation Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          departmentFilter={departmentFilter}
          onDepartmentChange={(dept) => {
            setDepartmentFilter(dept);
            setActiveTab('feed');
          }}
          departments={availableDepartments}
          deptDistribution={stats?.deptDistribution || {}}
          totalStudents={students.length}
          semesterCount={availableSemesters.length}
          onAddStudent={handleOpenAdd}
          onExportCSV={handleExportCSV}
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Column 2: Center Feed Stream */}
        <main className="fb-center-feed" id="main-feed" role="main">
          {/* Stories-Style Department Quick Filter Row */}
          <StoriesBar
            departments={availableDepartments}
            deptDistribution={stats?.deptDistribution || {}}
            totalStudents={students.length}
            activeDepartment={departmentFilter}
            onSelectDepartment={setDepartmentFilter}
          />

          {/* Social Composer Card */}
          <Composer
            onAddStudent={handleOpenAdd}
            onExportCSV={handleExportCSV}
            onToggleFilters={() => setShowFilterBar((prev) => !prev)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Collapsible Filter & Sort Options Bar */}
          {showFilterBar && (
            <div className="fb-filter-bar">
              <div className="filter-bar-group">
                <label htmlFor="dept-select">Department:</label>
                <select
                  id="dept-select"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {availableDepartments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-bar-group">
                <label htmlFor="sem-select">Semester:</label>
                <select
                  id="sem-select"
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {availableSemesters.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-bar-group">
                <label htmlFor="sort-select">Sort By:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Date Enrolled</option>
                  <option value="name">Student Name</option>
                  <option value="studentId">Student ID</option>
                  <option value="department">Department</option>
                  <option value="semester">Semester</option>
                </select>
              </div>

              <button
                type="button"
                className="fb-icon-btn"
                onClick={() => setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'))}
                title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder === 'asc' ? <IconSortAsc size={16} /> : <IconSortDesc size={16} />}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearchInput('');
                    setDepartmentFilter('');
                    setSemesterFilter('');
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Feed Controls Header */}
          <div className="fb-feed-controls">
            <div className="feed-status-info">
              <span className="feed-count">
                Showing <strong>{processedStudents.length}</strong> of <strong>{students.length}</strong> students
              </span>
              {departmentFilter && (
                <span className="active-filter-pill">
                  {departmentFilter}
                  <button
                    type="button"
                    onClick={() => setDepartmentFilter('')}
                    aria-label="Remove department filter"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              )}
            </div>

            {/* View Toggle: Cards vs Table */}
            <div className="fb-view-toggle" role="group" aria-label="View format">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Post Cards View"
                aria-pressed={viewMode === 'cards'}
              >
                <IconGrid size={16} />
                <span>Cards</span>
              </button>

              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table Directory View"
                aria-pressed={viewMode === 'table'}
              >
                <IconList size={16} />
                <span>Table</span>
              </button>
            </div>
          </div>

          {/* Feed Stream Content */}
          {isWakingUp ? (
            <EmptyState type="cold-start" />
          ) : error && students.length === 0 ? (
            <EmptyState type="error" errorMessage={error} onRetry={handleRefresh} />
          ) : loading && students.length === 0 ? (
            <div className="fb-cards-feed">
              <SkeletonMobileCard />
              <SkeletonMobileCard />
              <SkeletonMobileCard />
            </div>
          ) : processedStudents.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                type="search"
                searchQuery={searchInput || departmentFilter}
                onClearSearch={() => {
                  setSearchInput('');
                  setDepartmentFilter('');
                  setSemesterFilter('');
                }}
              />
            ) : (
              <EmptyState type="empty" onAddStudent={handleOpenAdd} />
            )
          ) : viewMode === 'cards' ? (
            <div className="fb-cards-feed">
              {processedStudents.map((student) => (
                <StudentCard
                  key={student._id || student.studentId}
                  student={student}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          ) : (
            <StudentTable
              students={processedStudents}
              loading={loading}
              isWakingUp={isWakingUp}
              error={error}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field) => {
                if (sortBy === field) {
                  setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSortBy(field);
                  setSortOrder('asc');
                }
              }}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onClearFilters={() => {
                setSearchInput('');
                setDepartmentFilter('');
                setSemesterFilter('');
              }}
              onAddStudent={handleOpenAdd}
              onRetry={handleRefresh}
              hasActiveFilters={hasActiveFilters}
            />
          )}
        </main>

        {/* Column 3: Right Sidebar (Analytics & Recent) */}
        <RightSidebar
          stats={stats}
          recentStudents={students}
          onEditStudent={handleOpenEdit}
        />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddStudent={handleOpenAdd}
        onToggleDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
      />

      {/* Honest, Clean Footer */}
      <Footer />

      {/* Modals & Dialogs */}
      <StudentFormModal
        isOpen={isFormOpen}
        isEditing={Boolean(editingStudent)}
        initialData={editingStudent}
        onSubmit={handleFormSubmit}
        onClose={handleCloseForm}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        student={studentToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
            setStudentToDelete(null);
          }
        }}
        isConfirming={isDeleting}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
