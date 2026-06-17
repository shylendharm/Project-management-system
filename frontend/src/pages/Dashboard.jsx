import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboardApi';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import TaskCard from '../components/TaskCard';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.data || res.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading dashboard…" />;

  const statCards = [
    {
      icon: '📁',
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      gradient: 'linear-gradient(135deg,#6378ff,#a78bfa)',
    },
    {
      icon: '✅',
      label: 'Total Tasks',
      value: stats?.totalTasks ?? 0,
      gradient: 'linear-gradient(135deg,#22d3a4,#059669)',
    },
    {
      icon: '🔄',
      label: 'In Progress',
      value: stats?.inProgressTasks ?? 0,
      gradient: 'linear-gradient(135deg,#38bdf8,#0284c7)',
    },
    {
      icon: '⚠️',
      label: 'Overdue Tasks',
      value: stats?.overdueTasks ?? 0,
      gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)',
    },
  ];

  const recentProjects = stats?.recentProjects || [];
  const recentTasks    = stats?.recentTasks    || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {getGreeting()},{' '}
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {user?.fullName?.split(' ')[0] || 'there'}
            </span>{' '}👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <Link to="/projects" id="new-project-link" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>

      {/* Two-column section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}
           className="dashboard-cols">

        {/* Recent Projects */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">📁 Recent Projects</h2>
            <Link to="/projects" className="btn btn-secondary btn-sm" id="view-all-projects-link">
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span className="empty-state__icon">📭</span>
              <span className="empty-state__title">No projects yet</span>
              <Link to="/projects" className="btn btn-primary btn-sm">Create your first project</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {recentProjects.slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">✅ Recent Tasks</h2>
            <Link to="/tasks" className="btn btn-secondary btn-sm" id="view-all-tasks-link">
              View all
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span className="empty-state__icon">📋</span>
              <span className="empty-state__title">No tasks yet</span>
              <Link to="/tasks" className="btn btn-primary btn-sm">Create your first task</Link>
            </div>
          ) : (
            <div className="tasks-list">
              {recentTasks.slice(0, 5).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

export default Dashboard;
