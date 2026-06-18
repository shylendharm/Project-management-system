import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Pagination state ──────────────────────────────────────────
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 9;

  // ── Sort state ────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder]   = useState('desc');

  const fetchProjects = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const mergedParams = { page, limit: LIMIT, sortBy, order, ...params };
      const res = await getProjects(mergedParams);
      setProjects(res.data.data || []);
      if (res.data.meta) {
        setTotal(res.data.meta.total ?? 0);
        setTotalPages(res.data.meta.totalPages ?? 1);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Mutations (optimistic-free: refetch after mutation) ───────
  const addProject = async (data) => {
    const res = await createProject(data);
    const project = res.data.data || res.data.project;
    toast.success('Project created successfully!');
    // Go to page 1 to see the newest item. If already on page 1, manually fetch to update.
    if (page === 1) {
      fetchProjects({ page: 1 });
    } else {
      setPage(1);
    }
    return project;
  };

  const editProject = async (id, data) => {
    const res = await updateProject(id, data);
    const updated = res.data.data || res.data.project;
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    toast.success('Project updated.');
    return updated;
  };

  const removeProject = async (id) => {
    await deleteProject(id);
    // If we deleted the last item on a page > 1, go back, else refetch
    if (projects.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      fetchProjects();
    }
    toast.success('Project deleted.');
  };

  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const changeSortBy = (field) => {
    if (field === sortBy) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };

  return {
    projects, loading, error, fetchProjects,
    addProject, editProject, removeProject,
    // pagination
    page, totalPages, total, goToPage,
    // sorting
    sortBy, order, changeSortBy,
  };
};

export default useProjects;
