import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api/dashboardApi';
import { createProject, updateProject, deleteProject } from '../api/projectApi';
import { markComplete, deleteTask } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import DashboardCard from '../components/DashboardCard';
import TaskCard from '../components/TaskCard';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import Loader from '../components/Loader';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editProjectTarget, setEditProjectTarget] = useState(null);

  const [confirmId, setConfirmId] = useState(null);
  const [confirmTaskId, setConfirmTaskId] = useState(null);

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

  useEffect(() => {
    fetchStats();
  }, []);

  const handleEditProject = (project) => {
    setEditProjectTarget(project);
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (data) => {
    try {
      if (editProjectTarget) {
        await updateProject(editProjectTarget.id, data);
        toast.success('Project updated.');
      } else {
        await createProject(data);
        toast.success('Project created successfully!');
      }
      await fetchStats();
      setProjectModalOpen(false);
      setEditProjectTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted.');
      setConfirmId(null);
      await fetchStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await markComplete(id);
      toast.success('Task marked as complete!');
      await fetchStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      toast.success('Task deleted.');
      setConfirmTaskId(null);
      await fetchStats();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <Loader text="Loading dashboard…" />;

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects ?? 0,
      gradient: 'linear-gradient(135deg,#6378ff,#a78bfa)',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks ?? 0,
      gradient: 'linear-gradient(135deg,#22d3a4,#059669)',
    },
    {
      label: 'In Progress',
      value: stats?.inProgressTasks ?? 0,
      gradient: 'linear-gradient(135deg,#38bdf8,#0284c7)',
    },
    {
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
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Good {getGreeting()},{' '}
            <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {user?.fullName?.split(' ')[0] || 'there'}
            </span>
          </h1>
          <p class="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        {!isAdmin && (
          <button id="new-project-btn" class="btn btn-primary" onClick={() => { setEditProjectTarget(null); setProjectModalOpen(true); }}>
            New Project
          </button>
        )}
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
            <h2 className="section-title">Recent Projects</h2>
            {!isAdmin && (
              <Link to="/projects" className="btn btn-secondary btn-sm" id="view-all-projects-link">
                View all
              </Link>
            )}
          </div>
          {recentProjects.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span className="empty-state__title">No projects yet</span>
              {!isAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => { setEditProjectTarget(null); setProjectModalOpen(true); }}>Create your first project</button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {recentProjects.slice(0, 3).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={isAdmin ? null : handleEditProject}
                  onDelete={(id) => setConfirmId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            {!isAdmin && (
              <Link to="/tasks" className="btn btn-secondary btn-sm" id="view-all-tasks-link">
                View all
              </Link>
            )}
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state" style={{ minHeight: 200 }}>
              <span className="empty-state__title">No tasks yet</span>
              {!isAdmin && (
                <Link to="/tasks" className="btn btn-primary btn-sm">Create your first task</Link>
              )}
            </div>
          ) : (
            <div className="tasks-list">
              {recentTasks.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={isAdmin ? null : handleCompleteTask}
                  onDelete={isAdmin ? (id) => setConfirmTaskId(id) : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {projectModalOpen && (
        <ProjectModal
          project={editProjectTarget}
          onClose={() => { setProjectModalOpen(false); setEditProjectTarget(null); }}
          onSave={handleSaveProject}
        />
      )}

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Project</h2>
              <button className="modal__close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this project? All associated tasks will also be deleted. This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteProject(confirmId)}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Delete Confirm Modal */}
      {confirmTaskId && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Task</h2>
              <button className="modal__close" onClick={() => setConfirmTaskId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn-ghost" onClick={() => setConfirmTaskId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteTask(confirmTaskId)}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

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
