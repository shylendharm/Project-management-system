import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, markComplete, deleteTask, getTasksByProject } from '../api/taskApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const useTasks = (projectId = null) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // ── Pagination state ──────────────────────────────────────────
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);
  const LIMIT = 10;

  // ── Sort state ────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder]   = useState('desc');

  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: LIMIT, sortBy, order, ...filters };
      let res;
      if (projectId) {
        res = await getTasksByProject(projectId, params);
      } else {
        res = await getTasks(params);
      }
      setTasks(res.data.data || []);
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
  }, [projectId, page, sortBy, order]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Mutations ─────────────────────────────────────────────────
  const addTask = async (data) => {
    const res = await createTask(data);
    const task = res.data.data || res.data.task;
    toast.success('Task created! ✅');
    if (page === 1) {
      fetchTasks({ page: 1 });
    } else {
      setPage(1);
    }
    return task;
  };

  const editTask = async (id, data) => {
    const res = await updateTask(id, data);
    const updated = res.data.data || res.data.task;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    toast.success('Task updated.');
    return updated;
  };

  const completeTask = async (id) => {
    const res = await markComplete(id);
    const updated = res.data.data || res.data.task;
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    toast.success('Task marked as complete! 🎉');
    return updated;
  };

  const removeTask = async (id) => {
    await deleteTask(id);
    if (tasks.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      fetchTasks();
    }
    toast.success('Task deleted.');
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
    tasks, loading, error, fetchTasks,
    addTask, editTask, completeTask, removeTask,
    // pagination
    page, totalPages, total, goToPage,
    // sorting
    sortBy, order, changeSortBy,
  };
};

export default useTasks;
