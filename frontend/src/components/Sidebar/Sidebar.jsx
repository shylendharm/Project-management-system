import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/projects',  label: 'Projects' },
  { to: '/tasks',     label: 'My Tasks' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      {/* Logo */}
      <div className="sidebar__logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <img src="/logo.svg" alt="Gestion Logo" width="28" height="28" />
        <span className="sidebar__logo-text">Gestion</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" role="navigation" aria-label="Main navigation">
        <span className="sidebar__section-label">Main Menu</span>

        {navItems
          .filter(({ to }) => !isAdmin || (to !== '/projects' && to !== '/tasks'))
          .map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              id={`nav-${label.toLowerCase().replace(' ', '-')}`}
              className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              {label}
            </NavLink>
          ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            id="nav-admin-panel"
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            Admin Panel
          </NavLink>
        )}

        <span className="sidebar__section-label" style={{ marginTop: 'var(--space-md)' }}>
          Account
        </span>

        <button
          id="sidebar-logout-btn"
          className="sidebar__link btn-ghost"
          onClick={handleLogout}
          style={{
            width: '100%', textAlign: 'left', border: 'none',
            background: 'none', cursor: 'pointer',
            color: 'var(--clr-danger)',
          }}
        >
          Logout
        </button>
      </nav>

      {/* Footer user info */}
      <div className="sidebar__footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {(user?.fullName || user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
            {user?.role && (
              <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`} style={{ fontSize: '0.6rem', marginTop: 4, display: 'inline-block' }}>
                {user.role}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
