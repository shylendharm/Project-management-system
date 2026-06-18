import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { getProject, updateProject, deleteProject } from '../api/projectApi';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import {
  formatDate, statusBadge, completionPercent,
  getErrorMessage, isOverdue,
} from '../utils/helpers';
import {
  PROJECT_STATUS_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../utils/constants';
import toast from 'react-hot-toast';

/* ── Task Modal ─────────────────────────────────────────────── */
const TaskModal = ({ task, projectId, onClose, onSave }) => {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task
      ? {
          title:       task.title,
          description: task.description || '',
          status:      task.status,
          priority:    task.priority,
          dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
        }
      : { status: 'PENDING', priority: 'MEDIUM' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onSave({ ...data, projectId });
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="task-modal-title">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button id="close-task-modal" className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form id="task-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Task Title *</label>
            <input
              id="task-title"
              className={`form-input${errors.title ? ' error' : ''}`}
              placeholder="e.g. Design the homepage"
              {...register('title', {
                required: 'Task title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                validate: (v) => v.trim().length > 0 || 'Title cannot be blank',
              })}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Add task details…"
              style={{ minHeight: 80 }}
              {...register('description')}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="task-status">Status</label>
              <select id="task-status" className="form-select" {...register('status')}>
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" className="form-select" {...register('priority')}>
                {TASK_PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-duedate">Due Date</label>
            <input id="task-duedate" type="date" className="form-input" {...register('dueDate')} />
          </div>

          <div className="modal__actions">
            <button id="cancel-task-btn" type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Saving…
                </>
              ) : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Project Details Page ───────────────────────────────────── */
const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]       = useState(null);
  const [projLoading, setProjLoading] = useState(true);
  const [taskModal, setTaskModal]   = useState(false);
  const [editTask, setEditTask]     = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(null);

  const { tasks, loading: tasksLoading, addTask, editTask: updateTaskHook, completeTask, removeTask } = useTasks(id);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProject(id);
        const data = res.data.data || res.data.project;
        setProject(data);
        reset({
          name:        data.name,
          description: data.description || '',
          status:      data.status,
          endDate:     data.endDate ? data.endDate.slice(0, 10) : '',
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/projects');
      } finally {
        setProjLoading(false);
      }
    };
    load();
  }, [id, navigate, reset]);

  const handleProjectUpdate = async (data) => {
    try {
      const res = await updateProject(id, data);
      setProject(res.data.data || res.data.project);
      setEditMode(false);
      toast.success('Project updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleProjectDelete = async () => {
    try {
      await deleteProject(id);
      toast.success('Project deleted.');
      navigate('/projects');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleTaskSave = async (data) => {
    if (editTask) {
      await updateTaskHook(editTask.id, data);
    } else {
      await addTask(data);
    }
  };

  const filteredTasks = tasks.filter((t) => statusFilter === 'ALL' || t.status === statusFilter);
  const percent = completionPercent(tasks);

  if (projLoading) return <Loader text="Loading project…" />;
  if (!project) return null;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/projects">Projects</Link>
        <span className="breadcrumb__sep">›</span>
        <span>{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="page-header" style={{ marginTop: 'var(--space-sm)' }}>
        <div style={{ flex: 1 }}>
          {editMode ? (
            <form id="edit-project-form" onSubmit={handleSubmit(handleProjectUpdate)}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <input
                  id="edit-project-name"
                  className="form-input"
                  style={{ fontSize: '1.4rem', fontWeight: 700, maxWidth: 360 }}
                  {...register('name', { required: true })}
                />
                <select id="edit-project-status" className="form-select" style={{ width: 150 }} {...register('status')}>
                  {PROJECT_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
                <input id="edit-project-duedate" type="date" className="form-input" style={{ width: 160 }} {...register('endDate')} />
              </div>
              <textarea
                id="edit-project-desc"
                className="form-textarea"
                style={{ marginTop: 'var(--space-sm)', minHeight: 60 }}
                placeholder="Description…"
                {...register('description')}
              />
              <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                <button id="save-edit-project-btn" type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                <button id="cancel-edit-project-btn" type="button" className="btn btn-ghost btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-xs)' }}>
                <h1 className="page-title">{project.name}</h1>
                <span className={`badge ${statusBadge(project.status)}`}>{project.status?.replace('_', ' ')}</span>
              </div>
              {project.description && (
                <p className="page-subtitle" style={{ maxWidth: 600 }}>{project.description}</p>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-sm)', color: 'var(--clr-text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                {project.endDate && (
                  <span style={{ color: isOverdue(project.endDate) ? 'var(--clr-danger)' : 'inherit' }}>
                    Due {formatDate(project.endDate)}
                  </span>
                )}
                <span>Created {formatDate(project.createdAt)}</span>
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button id="edit-project-btn" className="btn btn-secondary" onClick={() => setEditMode(true)}>Edit</button>
            <button id="delete-project-btn" className="btn btn-danger" onClick={handleProjectDelete}>Delete</button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-secondary)' }}>
              Task Completion
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--clr-primary)' }}>
              {percent}% ({tasks.filter((t) => t.status === 'COMPLETED').length}/{tasks.length})
            </span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      {/* Tasks section */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Tasks ({tasks.length})</h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button id="add-task-btn" className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setTaskModal(true); }}>
              Add Task
            </button>
          </div>
        </div>

        {/* Task filters */}
        <div className="filter-group" style={{ marginBottom: 'var(--space-lg)' }}>
          {['ALL', ...TASK_STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              id={`task-filter-${s.toLowerCase().replace('_', '-')}`}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {tasksLoading ? (
          <Loader text="Loading tasks…" />
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state" style={{ minHeight: 180 }}>
            <span className="empty-state__title">No tasks {statusFilter !== 'ALL' ? `with status "${statusFilter.replace('_',' ')}"` : 'yet'}</span>
            {statusFilter === 'ALL' && (
              <button id="empty-add-task-btn" className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setTaskModal(true); }}>
                Add First Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={completeTask}
                onEdit={(t) => { setEditTask(t); setTaskModal(true); }}
                onDelete={(taskId) => setConfirmDeleteTask(taskId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {taskModal && (
        <TaskModal
          task={editTask}
          projectId={id}
          onClose={() => { setTaskModal(false); setEditTask(null); }}
          onSave={handleTaskSave}
        />
      )}

      {/* Delete Task Confirm */}
      {confirmDeleteTask && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal__header">
              <h2 className="modal__title">Delete Task</h2>
              <button className="modal__close" onClick={() => setConfirmDeleteTask(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this task? This cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDeleteTask(null)}>Cancel</button>
              <button id="confirm-delete-task-btn" className="btn btn-danger" onClick={() => { removeTask(confirmDeleteTask); setConfirmDeleteTask(null); }}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
