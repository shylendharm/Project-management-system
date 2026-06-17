import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, markComplete, deleteTask, getTasksByProject } from '../api/taskApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const useTasks = (projectId = null) => {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (projectId) {
        res = await getTasksByProject(projectId);
      } else {
        res = await getTasks(filters);
      }
      setTasks(res.data.data || res.data.tasks || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (data) => {
    const res = await createTask(data);
    const task = res.data.data || res.data.task;
    setTasks((prev) => [task, ...prev]);
    toast.success('Task created! ✅');
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
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.success('Task deleted.');
  };

  return { tasks, loading, error, fetchTasks, addTask, editTask, completeTask, removeTask };
};

export default useTasks;
