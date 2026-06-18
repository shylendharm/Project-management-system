import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatDate, statusBadge, completionPercent, truncate } from '../../utils/helpers';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const percent = completionPercent(project.tasks || []);

  const handleCardClick = (e) => {
    // Prevent navigation when clicking action buttons or if user is admin
    if (e.target.closest('.project-card__actions') || isAdmin) return;
    navigate(`/projects/${project.id}`);
  };

  return (
    <article
      className="project-card animate-fade-in-up"
      onClick={handleCardClick}
      role={isAdmin ? "region" : "button"}
      tabIndex={isAdmin ? undefined : 0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick(e)}
      aria-label={isAdmin ? `Project: ${project.name}` : `View project: ${project.name}`}
      style={isAdmin ? { cursor: 'default' } : {}}
    >
      <div className="project-card__header">
        <h3 className="project-card__title">{project.name}</h3>
        <div className="project-card__actions" style={{ display: 'flex', gap: 'var(--space-xs)' }}>
          {onEdit && (
            <button
              id={`edit-project-${project.id}`}
              className="btn btn-ghost btn-sm"
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              title="Edit project"
              aria-label={`Edit ${project.name}`}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              id={`delete-project-${project.id}`}
              className="btn btn-danger btn-sm"
              onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
              title="Delete project"
              aria-label={`Delete ${project.name}`}
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {project.description && (
        <p className="project-card__desc">{truncate(project.description, 100)}</p>
      )}

      {/* Task progress */}
      {project.tasks && project.tasks.length > 0 && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginBottom: 4 }}>
            <span>Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      )}

      <div className="project-card__meta">
        <span className={`badge ${statusBadge(project.status)}`}>
          {project.status?.replace('_', ' ')}
        </span>

        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          {project.tasks && (
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
              {project.tasks.filter((t) => t.status === 'COMPLETED').length}/{project.tasks.length} tasks
            </span>
          )}
          {project.endDate && (
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
              Due {formatDate(project.endDate)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
