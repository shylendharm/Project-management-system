// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// Check if date is overdue
export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() && new Date(dateStr).toDateString() !== new Date().toDateString();
};

// Get initials from name
export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// Extract error message from Axios error
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Something went wrong. Please try again.';

// Status → badge class map
export const statusBadge = (status) => {
  const map = {
    NOT_STARTED: 'badge-muted',
    PENDING:     'badge-muted',
    IN_PROGRESS: 'badge-info',
    COMPLETED:   'badge-primary',
  };
  return map[status] || 'badge-muted';
};

// Priority → badge class map
export const priorityBadge = (priority) => {
  const map = {
    LOW:      'badge-muted',
    MEDIUM:   'badge-info',
    HIGH:     'badge-warning',
  };
  return map[priority] || 'badge-muted';
};

// Priority → icon map
export const priorityIcon = (priority) => {
  const map = {
    LOW: '🔽', MEDIUM: '➡️', HIGH: '🔼', CRITICAL: '🔴',
  };
  return map[priority] || '➡️';
};

// Calculate task completion %
export const completionPercent = (tasks = []) => {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === 'COMPLETED').length;
  return Math.round((done / tasks.length) * 100);
};

// Truncate long text
export const truncate = (str = '', max = 80) =>
  str.length > max ? str.slice(0, max) + '…' : str;
