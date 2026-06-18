/**
 * Unit tests for the Navbar component.
 *
 * We mock the external dependencies (AuthContext, react-router-dom, and the
 * NotificationPanel child) so the tests focus purely on Navbar's own logic
 * and rendering — not on unrelated features.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mocks ────────────────────────────────────────────────────────────────────
// Mock the auth hook so tests can supply any user they want
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom so we don't need a Router wrapping the component
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/dashboard' }),
}));

// Mock the NotificationPanel child to avoid its own network/context needs
vi.mock('../NotificationPanel', () => ({
  default: () => <div data-testid="notification-panel" />,
}));

import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';

// Helper to provide a default mock user
const mockUser = { fullName: 'Alice Smith', email: 'alice@test.com', role: 'USER' };

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.mockReturnValue({
    user: mockUser,
    logout: vi.fn().mockResolvedValue(undefined),
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────
describe('Navbar', () => {
  it('should render the correct page title based on current path', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render the user avatar with correct initials', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);
    // getInitials('Alice Smith') = 'AS'
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('should render the username next to the avatar', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('should render the NotificationPanel', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);
    expect(screen.getByTestId('notification-panel')).toBeInTheDocument();
  });

  it('should show the user dropdown when avatar is clicked', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);

    // Dropdown should not be visible initially
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();

    // Click the avatar to open the dropdown
    fireEvent.click(screen.getByLabelText('User menu'));

    // Logout button should now be visible
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('should display the user email inside the open dropdown', () => {
    render(<Navbar onMenuToggle={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(screen.getByText('alice@test.com')).toBeInTheDocument();
  });

  it('should call logout when the Logout button is clicked', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });

    render(<Navbar onMenuToggle={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByText('Logout'));

    // logout() is async — give it a tick to resolve
    await vi.waitFor(() => expect(mockLogout).toHaveBeenCalledTimes(1));
  });
});
