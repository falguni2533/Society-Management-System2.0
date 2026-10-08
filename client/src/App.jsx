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
<<<<<<< HEAD

import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminSecurityPage from './pages/AdminSecurityPage';

import SecurityDashboard from './pages/SecurityDashboard';

=======
import ResidentBillsPage from './pages/ResidentBillsPage';
import ResidentVisitorsPage from './pages/ResidentVisitorsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import AdminNoticesPage from './pages/AdminNoticesPage';
import AdminBillsPage from './pages/AdminBillsPage';
import AdminVisitorsPage from './pages/AdminVisitorsPage';
import SecurityDashboard from './pages/SecurityDashboard';
import SecurityVisitorsPage from './pages/SecurityVisitorsPage';
>>>>>>> origin/main
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
        <Route
          path="/resident/bills"
          element={
            <ProtectedRoute allowedRoles={['resident', 'admin']}>
              <ResidentBillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resident/visitors"
          element={
            <ProtectedRoute allowedRoles={['resident', 'admin']}>
              <ResidentVisitorsPage />
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
        <Route
          path="/admin/bills"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/visitors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminVisitorsPage />
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
<<<<<<< HEAD

=======
        <Route
          path="/security/visitors"
          element={
            <ProtectedRoute allowedRoles={['security', 'admin']}>
              <SecurityVisitorsPage />
            </ProtectedRoute>
          }
        />
>>>>>>> origin/main
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