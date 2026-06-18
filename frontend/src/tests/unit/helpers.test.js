/**
 * Unit tests for frontend/src/utils/helpers.js
 *
 * These are pure functions — no component rendering, no mocking needed.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatDate,
  isOverdue,
  getInitials,
  getErrorMessage,
  statusBadge,
  priorityBadge,
  completionPercent,
  truncate,
} from '../../utils/helpers';

// ── formatDate ──────────────────────────────────────────────────────────────
describe('formatDate', () => {
  it('should return "—" when given a null or undefined value', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('should format a valid ISO date string into a readable date', () => {
    const result = formatDate('2025-01-15T00:00:00.000Z');
    // Will be locale-specific; just check it is a non-empty string and contains "2025"
    expect(result).toContain('2025');
    expect(typeof result).toBe('string');
  });
});

// ── isOverdue ───────────────────────────────────────────────────────────────
describe('isOverdue', () => {
  it('should return false when dateStr is null', () => {
    expect(isOverdue(null)).toBe(false);
  });

  it('should return true for a date in the past', () => {
    expect(isOverdue('2020-01-01')).toBe(true);
  });

  it('should return false for a date far in the future', () => {
    expect(isOverdue('2099-12-31')).toBe(false);
  });
});

// ── getInitials ─────────────────────────────────────────────────────────────
describe('getInitials', () => {
  it('should return initials from a full name', () => {
    expect(getInitials('Alice Smith')).toBe('AS');
  });

  it('should handle single names', () => {
    expect(getInitials('Bob')).toBe('B');
  });

  it('should handle an empty string', () => {
    // name.split(' ').map(n => n[0]) with empty string gives [''], n[0] is undefined
    // slice(0,2) still returns a string
    expect(typeof getInitials('')).toBe('string');
  });

  it('should uppercase the initials', () => {
    expect(getInitials('john doe')).toBe('JD');
  });
});

// ── getErrorMessage ─────────────────────────────────────────────────────────
describe('getErrorMessage', () => {
  it('should return message from response.data.message', () => {
    const err = { response: { data: { message: 'Not found' } } };
    expect(getErrorMessage(err)).toBe('Not found');
  });

  it('should fallback to response.data.error', () => {
    const err = { response: { data: { error: 'Bad request' } } };
    expect(getErrorMessage(err)).toBe('Bad request');
  });

  it('should fallback to err.message', () => {
    const err = { message: 'Network error' };
    expect(getErrorMessage(err)).toBe('Network error');
  });

  it('should return default message when nothing is available', () => {
    expect(getErrorMessage({})).toBe('Something went wrong. Please try again.');
  });
});

// ── statusBadge ─────────────────────────────────────────────────────────────
describe('statusBadge', () => {
  it('should return the correct badge class for known statuses', () => {
    expect(statusBadge('NOT_STARTED')).toBe('badge-muted');
    expect(statusBadge('IN_PROGRESS')).toBe('badge-info');
    expect(statusBadge('COMPLETED')).toBe('badge-primary');
  });

  it('should return "badge-muted" for unknown status', () => {
    expect(statusBadge('UNKNOWN')).toBe('badge-muted');
  });
});

// ── priorityBadge ───────────────────────────────────────────────────────────
describe('priorityBadge', () => {
  it('should return the correct badge class for known priorities', () => {
    expect(priorityBadge('LOW')).toBe('badge-muted');
    expect(priorityBadge('MEDIUM')).toBe('badge-info');
    expect(priorityBadge('HIGH')).toBe('badge-warning');
  });

  it('should return "badge-muted" for unknown priority', () => {
    expect(priorityBadge('CRITICAL')).toBe('badge-muted');
  });
});

// ── completionPercent ────────────────────────────────────────────────────────
describe('completionPercent', () => {
  it('should return 0 for an empty task list', () => {
    expect(completionPercent([])).toBe(0);
  });

  it('should return 100 when all tasks are COMPLETED', () => {
    const tasks = [{ status: 'COMPLETED' }, { status: 'COMPLETED' }];
    expect(completionPercent(tasks)).toBe(100);
  });

  it('should return the correct percentage for a mixed list', () => {
    const tasks = [
      { status: 'COMPLETED' },
      { status: 'PENDING' },
      { status: 'COMPLETED' },
      { status: 'IN_PROGRESS' },
    ];
    expect(completionPercent(tasks)).toBe(50); // 2 of 4
  });
});

// ── truncate ─────────────────────────────────────────────────────────────────
describe('truncate', () => {
  it('should return the original string when it is shorter than max', () => {
    expect(truncate('Hello', 80)).toBe('Hello');
  });

  it('should truncate and append "…" when string exceeds max', () => {
    const long = 'a'.repeat(100);
    const result = truncate(long, 80);
    expect(result.length).toBe(81); // 80 chars + '…'
    expect(result.endsWith('…')).toBe(true);
  });

  it('should handle an empty string gracefully', () => {
    expect(truncate('', 80)).toBe('');
  });
});
