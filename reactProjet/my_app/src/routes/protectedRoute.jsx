

import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext.jsx';

const normalizeRole = (value) => {
  if (!value) return '';
  return String(value).trim().toLowerCase();
};

const hasRequiredRole = (user, requiredRole) => {
  if (!requiredRole) return true;
  if (!user) return false;

  const userRole = normalizeRole(user.role || user.type || (user.isAdmin ? 'admin' : ''));
  const expected = Array.isArray(requiredRole)
    ? requiredRole.map(normalizeRole)
    : [normalizeRole(requiredRole)];

  return expected.includes(userRole);
};

const hasForbiddenRole = (user, forbiddenRole) => {
  if (!forbiddenRole) return false;
  if (!user) return false;

  const userRole = normalizeRole(user.role || user.type || (user.isAdmin ? 'admin' : ''));
  const forbidden = Array.isArray(forbiddenRole)
    ? forbiddenRole.map(normalizeRole)
    : [normalizeRole(forbiddenRole)];

  return forbidden.includes(userRole);
};

const ProtectedRoute = ({ requiredRole, forbiddenRole, redirectTo }) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Chargement de l'authentification...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hasForbiddenRole(user, forbiddenRole)) {
    return <Navigate to={redirectTo || '/admin'} replace />;
  }

  if (!hasRequiredRole(user, requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
