import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import { PROJECT_STATUS_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ── Modal Form ────────────────────────────────────────────── */
const ProjectModal = ({ project, onClose, onSave }) => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: project
      ? {
          name:        project.name,
          description: project.description || '',
          status:      project.status,
          endDate:     project.endDate ? project.endDate.slice(0, 10) : '',
        }
      : { status: 'NOT_STARTED' },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await onSave(data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title" id="project-modal-title">
            {project ? '✏️ Edit Project' : '🚀 New Project'}
          </h2>
          <button id="close-project-modal" className="modal__close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form id="project-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="project-name">Project Name *</label>
            <input
              id="project-name"
              className={`form-input${errors.name ? ' error' : ''}`}
              placeholder="e.g. Website Redesign"
              {...register('name', {
                required: 'Project name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' },
                maxLength: { value: 100, message: 'Name too long (max 100)' },
                validate: (v) => v.trim().length > 0 || 'Name cannot be blank',
              })}
            />
            {errors.name && <span className="form-error">⚠ {errors.name.message}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              className="form-textarea"
              placeholder="What is this project about?"
              {...register('description', {
                maxLength: { value: 500, message: 'Description too long (max 500)' },
              })}
            />
            {errors.description && <span className="form-error">⚠ {errors.description.message}</span>}
          </div>

          <div className="form-row">
            {/* Status */}
            <div className="form-group">
              <label className="form-label" htmlFor="project-status">Status</label>
              <select id="project-status" className="form-select" {...register('status')}>
                {PROJECT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="project-duedate">Due Date</label>
              <input
                id="project-duedate"
                type="date"
                className="form-input"
                {...register('endDate')}
              />
            </div>
          </div>

          <div className="modal__actions">
            <button id="cancel-project-btn" type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button id="save-project-btn" type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                  Saving…
                </>
              ) : project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Projects Page ─────────────────────────────────────────── */
const Projects = () => {
  const { projects, loading, addProject, editProject, removeProject } = useProjects();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmId, setConfirmId]       = useState(null);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit = (project) => { setEditTarget(project); setModalOpen(true); };
  const handleCreate = () => { setEditTarget(null); setModalOpen(true); };

  const handleSave = async (data) => {
    if (editTarget) {
      await editProject(editTarget.id, data);
    } else {
      await addProject(data);
    }
  };

  const handleDelete = async (id) => {
    await removeProject(id);
    setConfirmId(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={handleCreate}>
          + New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-box__icon">🔍</span>
          <input
            id="project-search"
            className="form-input"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          {['ALL', ...PROJECT_STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              id={`filter-${s.toLowerCase()}`}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader text="Loading projects…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">{searchQuery ? '🔍' : '📭'}</span>
          <span className="empty-state__title">
            {searchQuery ? 'No projects match your search' : 'No projects yet'}
          </span>
          <span className="empty-state__desc">
            {searchQuery ? 'Try a different keyword or filter.' : 'Create your first project to get started.'}
          </span>
          {!searchQuery && (
            <button id="empty-create-project-btn" className="btn btn-primary" onClick={handleCreate}>
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={(id) => setConfirmId(id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <ProjectModal
          project={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {confirmId && (
        <div className="modal-overlay" role="alertdialog" aria-modal="true">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal__header">
              <h2 className="modal__title">🗑️ Delete Project</h2>
              <button className="modal__close" onClick={() => setConfirmId(null)}>✕</button>
            </div>
            <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this project? All associated tasks will also be deleted. This action cannot be undone.
            </p>
            <div className="modal__actions">
              <button id="cancel-delete-btn" className="btn btn-ghost" onClick={() => setConfirmId(null)}>
                Cancel
              </button>
              <button id="confirm-delete-btn" className="btn btn-danger" onClick={() => handleDelete(confirmId)}>
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
