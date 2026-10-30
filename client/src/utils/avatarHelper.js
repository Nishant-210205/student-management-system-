/**
 * Generative Avatar & Formatting Utilities
 * Zero runtime dependencies
 */

// Gradient palettes for avatar rings
const GRADIENTS = [
  ['#1877f2', '#00c6ff'], // Classic Blue
  ['#8b5cf6', '#ec4899'], // Purple -> Pink
  ['#10b981', '#3b82f6'], // Emerald -> Blue
  ['#f59e0b', '#ef4444'], // Amber -> Coral
  ['#6366f1', '#a855f7'], // Indigo -> Violet
  ['#06b6d4', '#3b82f6'], // Cyan -> Royal
  ['#14b8a6', '#10b981'], // Teal -> Mint
  ['#f97316', '#e11d48'], // Orange -> Rose
];

/**
 * Extract 1 or 2 uppercase initials from student name
 */
export const getInitials = (name = '') => {
  if (!name) return '?';
  // Strip non-letter prefix characters like digits, underscores (e.g. 59_saim -> saim)
  const clean = name.replace(/^[\d_]+/, '').trim() || name.trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Deterministically pick a gradient for a given identifier or name
 */
export const getAvatarGradient = (str = '') => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  const [c1, c2] = GRADIENTS[index];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
};

/**
 * Format relative time or fallback date
 */
export const formatRelativeTime = (isoString) => {
  if (!isoString) return 'Enrolled recently';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Enrolled recently';

    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Enrolled recently';
  }
};
