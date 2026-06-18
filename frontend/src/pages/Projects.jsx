import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import Loader from '../components/Loader';
import ProjectModal from '../components/ProjectModal';
import { PROJECT_STATUS_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ── Sort Options ──────────────────────────────────────────────── */
const PROJECT_SORT_OPTIONS = [
  { label: 'Date Created', value: 'createdAt' },
  { label: 'Name',         value: 'name'       },
  { label: 'Status',       value: 'status'     },
  { label: 'Start Date',   value: 'startDate'  },
  { label: 'End Date',     value: 'endDate'    },
];

/* ── Projects Page ─────────────────────────────────────────────── */
const Projects = () => {
  const {
    projects, loading,
    addProject, editProject, removeProject,
    page, totalPages, total, goToPage,
    sortBy, order, changeSortBy,
  } = useProjects();

  const location = useLocation();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [confirmId, setConfirmId]       = useState(null);

  useEffect(() => {
    if (location.state?.openCreateModal) {
      setEditTarget(null);
      setModalOpen(true);
      // Clear navigation state so a browser refresh doesn't reopen it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  /* NOTE: Search & status filter are client-side on the current page.
     For a full server-side filter experience the hook would need to
     accept these as params — easily extensible later. */
  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit   = (project) => { setEditTarget(project); setModalOpen(true); };
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
          <p className="page-subtitle">{total} total project{total !== 1 ? 's' : ''}</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={handleCreate}>
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <input
            id="project-search"
            className="form-input"
            placeholder="Search projects…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status filter */}
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

        {/* Sort controls */}
        <div className="sort-group">
          <span className="sort-label">Sort:</span>
          <select
            id="project-sort-select"
            className="form-select sort-select"
            value={sortBy}
            onChange={(e) => changeSortBy(e.target.value)}
          >
            {PROJECT_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            id="project-sort-order-btn"
            className="btn btn-sm btn-secondary sort-order-btn"
            onClick={() => changeSortBy(sortBy)}
            title={order === 'asc' ? 'Ascending – click to reverse' : 'Descending – click to reverse'}
          >
            {order === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader text="Loading projects…" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__title">
            {searchQuery ? 'No projects match your search' : 'No projects yet'}
          </span>
          <span className="empty-state__desc">
            {searchQuery ? 'Try a different keyword or filter.' : 'Create your first project to get started.'}
          </span>
          {!searchQuery && (
            <button id="empty-create-project-btn" className="btn btn-primary" onClick={handleCreate}>
              Create Project
            </button>
          )}
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                id="project-prev-page-btn"
                className="btn btn-sm btn-secondary"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                ← Prev
              </button>

              <div className="pagination__pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    id={`project-page-${p}-btn`}
                    className={`pagination__page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                id="project-next-page-btn"
                className="btn btn-sm btn-secondary"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
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
              <h2 className="modal__title">Delete Project</h2>
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
