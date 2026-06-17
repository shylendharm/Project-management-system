import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { getProjects } from '../api/projectApi';
import { useEffect } from 'react';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import Loader from '../components/Loader';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ── Task Modal ─────────────────────────────────────────────── */
const TaskModal = ({ task, projects, onClose, onSave }) => {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task
      ? {
          title:       task.title,
          description: task.description || '',
          status:      task.status,
          priority:    task.priority,
          dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
          projectId:   task.projectId || '',
        }
      : { status: 'PENDING', priority: 'MEDIUM', projectId: '' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };
      if (!payload.projectId) delete payload.projectId;
      await onSave(payload);
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
            {task ? '✏️ Edit Task' : '➕ New Task'}
          </h2>
          <button id="close-task-modal-btn" className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form id="task-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">Title *</label>
            <input
              id="task-title"
              className={`form-input${errors.title ? ' error' : ''}`}
              placeholder="e.g. Write unit tests"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'At least 3 characters' },
                validate: (v) => v.trim().length > 0 || 'Title cannot be blank',
              })}
            />
            {errors.title && <span className="form-error">⚠ {errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">Description</label>
            <textarea id="task-desc" className="form-textarea" style={{ minHeight: 70 }}
              placeholder="Details…" {...register('description')} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="task-project">Project</label>
            <select id="task-project" className="form-select" {...register('projectId')}>
              <option value="">— No project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
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
            <label className="form-label" htmlFor="task-due">Due Date</label>
            <input id="task-due" type="date" className="form-input" {...register('dueDate')} />
          </div>

          <div className="modal__actions">
            <button id="cancel-task-modal-btn" type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-task-modal-btn" type="submit" className="btn btn-primary" disabled={submitting}>
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

/* ── Tasks Page ─────────────────────────────────────────────── */
const Tasks = () => {
  const { tasks, loading, addTask, editTask: updateTaskHook, completeTask, removeTask } = useTasks();

  const [projects, setProjects]         = useState([]);
  const [taskModal, setTaskModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [confirmId, setConfirmId]       = useState(null);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data.data || res.data.projects || []))
      .catch(() => {});
  }, []);

  const filtered = tasks.filter((t) => {
    const matchSearch   = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus   = statusFilter   === 'ALL' || t.status   === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleSave = async (data) => {
    if (editTarget) {
      await updateTaskHook(editTarget.id, data);
    } else {
      await addTask(data);
    }
  };

  const todoCount       = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const doneCount       = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">
            {todoCount} to do · {inProgressCount} in progress · {doneCount} completed
          </p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={() => { setEditTarget(null); setTaskModal(true); }}>
          + New Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-box__icon">🔍</span>
          <input
            id="task-search"
            className="form-input"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>STATUS:</span>
          {['ALL', ...TASK_STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              id={`status-filter-${s.toLowerCase().replace('_', '-')}`}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>PRIORITY:</span>
          {['ALL', ...TASK_PRIORITY_OPTIONS].map((p) => (
            <button
              key={p}
              id={`priority-filter-${p.toLowerCase()}`}
              className={`btn btn-sm ${priorityFilter === p ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <Loader text="Loading tasks…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">{searchQuery ? '🔍' : '📋'}</span>
          <span className="empty-state__title">
            {searchQuery ? 'No tasks match your search' : 'No tasks yet'}
          </span>
          <span className="empty-state__desc">
            {searchQuery ? 'Try a different keyword.' : 'Create your first task to get started.'}
          </span>
          {!searchQuery && (
            <button id="empty-create-task-btn" className="btn btn-primary" onClick={() => { setEditTarget(null); setTaskModal(true); }}>
              + Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-list">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onEdit={(t) => { setEditTarget(t); setTaskModal(true); }}
              onDelete={(id) => setConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      {taskModal && (
        <TaskModal
          task={editTarget}
          projects={projects}
          onClose={() => { setTaskModal(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {confirmId && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal__header">
              <h2 className="modal__title">🗑️ Delete Task</h2>
              <button className="modal__close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this task? This cannot be undone.
            </p>
            <div className="modal__actions">
              <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>Cancel</button>
              <button id="confirm-delete-task-btn" className="btn btn-danger" onClick={() => { removeTask(confirmId); setConfirmId(null); }}>
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
