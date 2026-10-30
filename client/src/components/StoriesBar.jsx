import React from 'react';
import { IconLayers, IconGraduationCap } from './Icons';
import { getAvatarGradient } from '../utils/avatarHelper';

export const StoriesBar = ({
  departments = [],
  deptDistribution = {},
  totalStudents = 0,
  activeDepartment = '',
  onSelectDepartment,
}) => {
  return (
    <div className="fb-stories-container" role="region" aria-label="Department Stories">
      <div className="fb-stories-scroll">
        {/* Story 1: All Departments */}
        <button
          type="button"
          className={`fb-story-card ${activeDepartment === '' ? 'active' : ''}`}
          onClick={() => onSelectDepartment('')}
          aria-pressed={activeDepartment === ''}
        >
          <div className="story-ring-wrapper">
            <div className="story-ring all-depts-ring">
              <IconGraduationCap size={20} />
            </div>
          </div>
          <span className="story-title">All Records</span>
          <span className="story-badge">{totalStudents}</span>
        </button>

        {/* Stories for each department */}
        {departments.map((dept) => {
          const count = deptDistribution[dept] || 0;
          const isActive = activeDepartment.toLowerCase() === dept.toLowerCase();
          return (
            <button
              key={dept}
              type="button"
              className={`fb-story-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectDepartment(isActive ? '' : dept)}
              aria-pressed={isActive}
            >
              <div className="story-ring-wrapper">
                <div
                  className="story-ring"
                  style={{ background: getAvatarGradient(dept) }}
                >
                  <IconLayers size={18} />
                </div>
              </div>
              <span className="story-title">{dept}</span>
              <span className="story-badge">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
