import { useState, useEffect, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProjects();
      setProjects(res.data.data || res.data.projects || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addProject = async (data) => {
    const res = await createProject(data);
    const project = res.data.data || res.data.project;
    setProjects((prev) => [project, ...prev]);
    toast.success('Project created successfully! 🚀');
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
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.success('Project deleted.');
  };

  return { projects, loading, error, fetchProjects, addProject, editProject, removeProject };
};

export default useProjects;
