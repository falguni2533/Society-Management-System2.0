import React from 'react';

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';

import ResidentDashboard from './pages/ResidentDashboard';
import ResidentComplaintsPage from './pages/ResidentComplaintsPage';
import ResidentNoticesPage from './pages/ResidentNoticesPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminSecurityPage from './pages/AdminSecurityPage';

import SecurityDashboard from './pages/SecurityDashboard';

import UnauthorizedPage from './pages/UnauthorizedPage';

import ProtectedRoute from './components/ProtectedRoute';


const RootRedirect = () => {

  const {
    user,
    isAuthenticated,
    loading,
    getRedirectPath,
  } = useAuth();


  if (loading) {
    return null;
  }


  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return (
    <Navigate
      to={getRedirectPath(user.role)}
      replace
    />
  );
};


function App() {

  return (

    <Routes>

      {/* PUBLIC */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/unauthorized"
        element={<UnauthorizedPage />}
      />


      {/* =================================================
          PROTECTED PORTALS
      ================================================= */}

      <Route element={<MainLayout />}>


        {/* =========================
            RESIDENT
        ========================= */}

        <Route
          path="/resident"
          element={
            <ProtectedRoute
              allowedRoles={[
                'resident',
                'admin',
              ]}
            >
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/resident/complaints"
          element={
            <ProtectedRoute
              allowedRoles={[
                'resident',
                'admin',
              ]}
            >
              <ResidentComplaintsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/resident/notices"
          element={
            <ProtectedRoute
              allowedRoles={[
                'resident',
                'admin',
              ]}
            >
              <ResidentNoticesPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/complaints"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            >
              <AdminComplaintsPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            >
              <AdminNoticesPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN SECURITY
            This is intentionally different
            from the Security Portal.
        ========================= */}

        <Route
          path="/admin/security"
          element={
            <ProtectedRoute
              allowedRoles={['admin']}
            >
              <AdminSecurityPage />
            </ProtectedRoute>
          }
        />


        {/* =========================
            SECURITY PORTAL
            SECURITY USER ONLY
        ========================= */}

        <Route
          path="/security"
          element={
            <ProtectedRoute
              allowedRoles={['security']}
            >
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />

      </Route>


      {/* FALLBACK */}

      <Route
        path="*"
        element={<RootRedirect />}
      />

    </Routes>
  );
}


export default App;