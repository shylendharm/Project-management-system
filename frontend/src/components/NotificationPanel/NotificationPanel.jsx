import { useState, useEffect, useRef, useCallback } from 'react';
import { getNotifications } from '../../api/dashboardApi';

const POLL_INTERVAL = 60_000; // refresh every 60 seconds

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'Just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const typeStyle = {
  danger:  { bg: 'rgba(220,38,38,0.08)',  dot: '#dc2626', border: 'rgba(220,38,38,0.15)'  },
  warning: { bg: 'rgba(217,119,6,0.08)',  dot: '#d97706', border: 'rgba(217,119,6,0.15)'  },
  info:    { bg: 'rgba(37,99,235,0.08)',  dot: '#2563eb', border: 'rgba(37,99,235,0.15)'  },
  success: { bg: 'rgba(5,150,105,0.08)',  dot: '#059669', border: 'rgba(5,150,105,0.15)'  },
};

const NotificationPanel = () => {
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState([]);
  const [read, setRead]           = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('nf_read') || '[]')); }
    catch { return new Set(); }
  });
  const [loading, setLoading]     = useState(false);
  const panelRef                  = useRef(null);
  const intervalRef               = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications();
      setItems(res.data.data || []);
    } catch {
      // silent – don't spam the user with errors in the notification bell
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = items.filter((n) => !read.has(n.id)).length;

  const markAllRead = () => {
    const all = new Set(items.map((n) => n.id));
    setRead(all);
    localStorage.setItem('nf_read', JSON.stringify([...all]));
  };

  const markRead = (id) => {
    const next = new Set(read);
    next.add(id);
    setRead(next);
    localStorage.setItem('nf_read', JSON.stringify([...next]));
  };

  const toggle = () => {
    setOpen((v) => !v);
    if (!open) fetchNotifications(); // refresh on open
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        id="notifications-btn"
        className="btn btn-ghost btn-icon"
        title="Notifications"
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="notif-panel" role="dialog" aria-label="Notifications">
          {/* Header */}
          <div className="notif-panel__header">
            <span className="notif-panel__title">
              Notifications
              {unreadCount > 0 && (
                <span className="notif-panel__unread-chip">{unreadCount} new</span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={markAllRead}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="notif-panel__body">
            {loading && items.length === 0 ? (
              <div className="notif-panel__empty">
                <div className="spinner spinner-sm" />
                <span>Loading…</span>
              </div>
            ) : items.length === 0 ? (
              <div className="notif-panel__empty">
                <span style={{ fontWeight: 600 }}>All caught up!</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                  No overdue or upcoming tasks.
                </span>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {items.map((n) => {
                  const isUnread = !read.has(n.id);
                  const style    = typeStyle[n.type] || typeStyle.info;
                  return (
                    <li
                      key={n.id}
                      className={`notif-item${isUnread ? ' notif-item--unread' : ''}`}
                      onClick={() => markRead(n.id)}
                      style={{
                        background: isUnread ? style.bg : 'transparent',
                        borderLeft: isUnread ? `3px solid ${style.dot}` : '3px solid transparent',
                      }}
                    >
                      <div className="notif-item__body" style={{ paddingLeft: 'var(--space-xs)' }}>
                        <div className="notif-item__title">
                          {n.title}
                          {isUnread && (
                            <span
                              style={{
                                display: 'inline-block',
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: style.dot,
                                marginLeft: 6,
                                verticalAlign: 'middle',
                              }}
                            />
                          )}
                        </div>
                        <div className="notif-item__message">{n.message}</div>
                        <div className="notif-item__time">{timeAgo(n.time)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="notif-panel__footer">
              <button
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}
                onClick={fetchNotifications}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
