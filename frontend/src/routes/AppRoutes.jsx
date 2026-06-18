import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import MainLayout from '../layouts/MainLayout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import Tasks from '../pages/Tasks';
import AdminPanel from '../pages/AdminPanel';
import Loader from '../components/Loader';

const AppRoutes = () => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) return <Loader fullPage text="Loading Gestion…" />;

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected routes under MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/projects"         element={isAdmin ? <Navigate to="/dashboard" replace /> : <Projects />} />
        <Route path="/projects/:id"     element={isAdmin ? <Navigate to="/dashboard" replace /> : <ProjectDetails />} />
        <Route path="/tasks"            element={isAdmin ? <Navigate to="/dashboard" replace /> : <Tasks />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
      </Route>

      {/* Fallback redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
