import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInitials } from '../../utils/helpers';
import NotificationPanel from '../NotificationPanel';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Page title map
  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
    '/tasks': 'My Tasks',
    '/admin': 'Admin Control Panel',
  };

  const getTitle = () => {
    if (location.pathname.startsWith('/projects/')) return 'Project Details';
    return pageTitles[location.pathname] || 'Gestion';
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__left">
        {/* Mobile hamburger */}
        <button
          id="sidebar-toggle-btn"
          className="btn btn-ghost btn-icon"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <div className="navbar__title">{getTitle()}</div>
        </div>
      </div>

      <div className="navbar__right">
        {/* Smart Notification Panel */}
        <NotificationPanel />

        {/* User menu */}
        <div className="navbar__user" style={{ position: 'relative' }}>
          <div
            id="user-avatar-btn"
            className="navbar__avatar"
            onClick={() => setDropdownOpen((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setDropdownOpen((v) => !v)}
            aria-label="User menu"
          >
            {getInitials(user?.fullName || user?.email || 'U')}
          </div>
          <span className="navbar__username">{user?.fullName || user?.email}</span>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'var(--clr-surface-2)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                minWidth: 180,
                zIndex: 99,
                overflow: 'hidden',
                animation: 'scaleIn 0.15s ease',
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--clr-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)' }}>
                    {user?.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  style={{
                    width: '100%', textAlign: 'left', padding: '11px 16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--clr-danger)', fontSize: '0.875rem', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 8,
                    transition: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
