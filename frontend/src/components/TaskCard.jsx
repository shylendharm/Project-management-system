import { formatDate, statusBadge, priorityBadge, isOverdue } from '../utils/helpers';

const TaskCard = ({ task, onComplete, onEdit, onDelete }) => {
  const isDone = task.status === 'COMPLETED';
  const overdue = !isDone && isOverdue(task.dueDate);

  return (
    <div className={`task-card animate-fade-in${isDone ? ' opacity-60' : ''}`} style={{ opacity: isDone ? 0.7 : 1 }}>
      {/* Checkbox / Complete toggle */}
      <button
        id={`complete-task-${task.id}`}
        className={`task-card__checkbox${isDone ? ' done' : ''}`}
        onClick={() => onComplete && !isDone && onComplete(task.id)}
        disabled={isDone}
        title={isDone ? 'Completed' : 'Mark as complete'}
        aria-label={isDone ? `${task.title} completed` : `Mark ${task.title} as complete`}
      >
        {isDone && '✓'}
      </button>

      {/* Task body */}
      <div className="task-card__body">
        <div className={`task-card__title${isDone ? ' done' : ''}`}>{task.title}</div>
        <div className="task-card__meta">
          <span className={`badge ${statusBadge(task.status)}`} style={{ fontSize: '0.68rem' }}>
            {task.status?.replace('_', ' ')}
          </span>
          <span className={`badge ${priorityBadge(task.priority)}`} style={{ fontSize: '0.68rem' }}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span style={{
              fontSize: '0.72rem',
              color: overdue ? 'var(--clr-danger)' : 'var(--clr-text-muted)',
              fontWeight: overdue ? 600 : 400,
            }}>
              {overdue ? '⚠️ ' : '📅 '}{formatDate(task.dueDate)}
            </span>
          )}
          {task.project && (
            <span className="task-card__project">📁 {task.project.name}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="task-card__actions">
        {onEdit && (
          <button
            id={`edit-task-${task.id}`}
            className="btn btn-ghost btn-sm btn-icon"
            onClick={() => onEdit(task)}
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button
            id={`delete-task-${task.id}`}
            className="btn btn-danger btn-sm btn-icon"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
