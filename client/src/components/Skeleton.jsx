import React from 'react';

export const SkeletonRow = ({ columns = 7 }) => (
  <tr className="skeleton-row" aria-hidden="true">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i}>
        <div
          className="skeleton-cell"
          style={{ width: `${50 + (i * 17) % 45}%` }}
        />
      </td>
    ))}
  </tr>
);

export const SkeletonMobileCard = () => (
  <div className="student-mobile-card skeleton-mobile-card" aria-hidden="true">
    <div className="skeleton-cell skeleton-name" />
    <div className="skeleton-cell skeleton-sub" />
    <div className="skeleton-cell skeleton-sub" />
  </div>
);

