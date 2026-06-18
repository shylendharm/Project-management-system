import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUserRole, deleteUser, getLogs } from '../api/adminApi';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

const useAdmin = () => {
  const [users, setUsers]     = useState([]);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError]     = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLogsLoading(true);
      const res = await getLogs(page, 20);
      setLogs(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const changeRole = async (id, role) => {
    try {
      setError(null);
      const res = await updateUserRole(id, role);
      const updated = res.data.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u))
      );
      toast.success(`User role updated to ${updated.role}`);
      return updated;
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      throw err;
    }
  };

  const removeUser = async (id) => {
    try {
      setError(null);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User and their data deleted.');
    } catch (err) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      throw err;
    }
  };

  return {
    users,
    logs,
    loading,
    logsLoading,
    error,
    fetchUsers,
    fetchLogs,
    changeRole,
    removeUser,
  };
};

export default useAdmin;
