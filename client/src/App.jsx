import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResidentDashboard from './pages/ResidentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProtectedRoute from './components/ProtectedRoute';

const RootRedirect = () => {
  const { user, isAuthenticated, loading, getRedirectPath } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRedirectPath(user.role)} replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes inside Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<RootRedirect />} />

        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={['resident', 'admin']}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security"
          element={
            <ProtectedRoute allowedRoles={['security', 'admin']}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

export default App;
