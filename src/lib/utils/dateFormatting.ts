const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Format a date as relative time (Today, Yesterday, X days ago) or short date
 */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Format a date as full readable format (Monday, January 28, 2025)
 */
export function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date with a specific format pattern
 */
export function formatDate(date: Date, format: 'MMM dd' | 'MMM yyyy' | 'short' | 'iso'): string {
  switch (format) {
    case 'MMM dd':
      return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
    case 'MMM yyyy':
      return `${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    case 'short':
      return `${date.getMonth() + 1}/${date.getDate()}`;
    case 'iso':
    default:
      return date.toISOString().split('T')[0];
  }
}
