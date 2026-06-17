import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/projects',  icon: '📁', label: 'Projects' },
  { to: '/tasks',     icon: '✅', label: 'My Tasks' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`} id="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">⚡</div>
        <span className="sidebar__logo-text">ProManage</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" role="navigation" aria-label="Main navigation">
        <span className="sidebar__section-label">Main Menu</span>

        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            id={`nav-${label.toLowerCase().replace(' ', '-')}`}
            className={({ isActive }) => `sidebar__link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <span className="sidebar__link-icon">{icon}</span>
            {label}
          </NavLink>
        ))}

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
          <span className="sidebar__link-icon">🚪</span>
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
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
