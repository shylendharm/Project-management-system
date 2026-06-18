import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PROJECT_STATUS_OPTIONS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/helpers';
import toast from 'react-hot-toast';

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
            {project ? 'Edit Project' : 'New Project'}
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
            {errors.name && <span className="form-error">{errors.name.message}</span>}
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
            {errors.description && <span className="form-error">{errors.description.message}</span>}
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

export default ProjectModal;
