import React, { useState } from 'react';
import useAdmin from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const ACTION_LABELS = {
  USER_REGISTERED:  'User Registered',
  USER_LOGIN:       'User Login',
  USER_ROLE_CHANGED:'Role Changed',
  USER_DELETED:     'User Deleted',
  PROJECT_CREATED:  'Project Created',
  PROJECT_DELETED:  'Project Deleted',
  TASK_CREATED:     'Task Created',
  TASK_COMPLETED:   'Task Completed',
  TASK_DELETED:     'Task Deleted',
};

const ACTION_COLORS = {
  USER_REGISTERED:  '#22d3a4',
  USER_LOGIN:       '#6378ff',
  USER_ROLE_CHANGED:'#f59e0b',
  USER_DELETED:     '#f43f5e',
  PROJECT_CREATED:  '#22d3a4',
  PROJECT_DELETED:  '#f43f5e',
  TASK_CREATED:     '#22d3a4',
  TASK_COMPLETED:   '#6378ff',
  TASK_DELETED:     '#f43f5e',
};

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const { users, logs, loading, logsLoading, changeRole, removeUser, fetchLogs } = useAdmin();

  const [tab, setTab] = useState('users'); // 'users' | 'logs'

  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [changingRole, setChangingRole] = useState(false);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'logs' && logs.length === 0) {
      fetchLogs(1);
    }
  };

  const confirmRoleChange = async () => {
    if (!userToChangeRole) return;
    setChangingRole(true);
    try {
      await changeRole(userToChangeRole.userId, userToChangeRole.nextRole);
      setUserToChangeRole(null);
    } catch (err) {
      // Error toast is already handled by hook
    } finally {
      setChangingRole(false);
    }
  };

  const handleRoleChange = (userId, currentRole, email) => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    setUserToChangeRole({ userId, nextRole, email });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await removeUser(userToDelete.id);
      setUserToDelete(null);
    } catch (err) {
      // Error toast is already handled by hook
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader text="Loading user database…" />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Control Panel</h1>
          <p className="page-subtitle">Manage users, adjust system roles, and view audit logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--clr-border)' }}>
        {['users', 'logs'].map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            style={{
              padding: '8px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
              borderBottom: tab === t ? '2px solid var(--clr-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.15s',
            }}
          >
            {t === 'users' ? 'Users' : 'Audit Logs'}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Projects</th>
                <th>Tasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: 'var(--space-lg)' }}>
                    No users found in database.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isSelf = currentUser?.id === user.id;
                  return (
                    <tr key={user.id}>
                      <td className="font-bold">
                        {user.fullName} {isSelf && <span style={{ fontWeight: 'normal', color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>(You)</span>}
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>{user._count?.projects ?? 0}</td>
                      <td>{user._count?.tasks ?? 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={isSelf}
                            onClick={() => handleRoleChange(user.id, user.role, user.email)}
                            style={{ minWidth: '70px' }}
                          >
                            {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={isSelf}
                            onClick={() => setUserToDelete({ id: user.id, email: user.email })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AUDIT LOGS TAB ── */}
      {tab === 'logs' && (
        <div>
          {logsLoading ? (
            <Loader text="Loading audit logs…" />
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Details</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--clr-text-muted)', padding: 'var(--space-lg)' }}>
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: `${ACTION_COLORS[log.action] || '#6378ff'}22`,
                            color: ACTION_COLORS[log.action] || '#6378ff',
                            whiteSpace: 'nowrap',
                          }}>
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td style={{ color: 'var(--clr-text-secondary)', fontSize: '0.85rem' }}>{log.details || '—'}</td>
                        <td>{log.user?.fullName || '—'}</td>
                        <td>
                          <span className={`badge ${log.user?.role === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>
                            {log.user?.role || '—'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ROLE CHANGE MODAL ── */}
      {userToChangeRole && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="role-change-title">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal__header">
              <h2 className="modal__title" id="role-change-title">Change User Role</h2>
              <button className="modal__close" onClick={() => setUserToChangeRole(null)} aria-label="Close modal">x</button>
            </div>
            <div style={{ padding: 'var(--space-md) var(--space-xl)', color: 'var(--clr-text)' }}>
              <p style={{ marginBottom: 'var(--space-sm)' }}>
                Are you sure you want to change the role of <strong>{userToChangeRole.email}</strong> to{' '}
                <span className={`badge ${userToChangeRole.nextRole === 'ADMIN' ? 'badge-admin' : 'badge-user'}`}>{userToChangeRole.nextRole}</span>?
              </p>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setUserToChangeRole(null)} disabled={changingRole}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={confirmRoleChange} disabled={changingRole}>
                {changingRole ? (
                  <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Updating…</>
                ) : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE USER MODAL ── */}
      {userToDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-user-title">
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: 'var(--space-md)' }}>
            <div className="modal__header">
              <h2 className="modal__title" id="delete-user-title">Delete User</h2>
              <button className="modal__close" onClick={() => setUserToDelete(null)} aria-label="Close modal">x</button>
            </div>
            <div style={{ padding: 'var(--space-md) var(--space-xl)', color: 'var(--clr-text)' }}>
              <p style={{ marginBottom: 'var(--space-sm)' }}>
                Are you sure you want to delete user <strong>{userToDelete.email}</strong>?
              </p>
              <p style={{ color: 'var(--clr-danger)' }}>
                This action is irreversible and will permanently delete all of their projects and tasks.
              </p>
            </div>
            <div className="modal__actions">
              <button type="button" className="btn btn-ghost" onClick={() => setUserToDelete(null)} disabled={deleting}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmDeleteUser} disabled={deleting}>
                {deleting ? (
                  <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Deleting…</>
                ) : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
