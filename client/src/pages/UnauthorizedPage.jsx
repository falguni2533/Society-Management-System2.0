import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

const UnauthorizedPage = () => {
  const { user, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (user) {
      navigate(getRedirectPath(user.role), { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-sm text-slate-600 mt-2">
          Your current account role (
          <span className="font-semibold text-slate-800 uppercase text-xs px-2 py-0.5 rounded bg-slate-100">
            {user?.role || 'Guest'}
          </span>
          ) does not have permission to view this resource.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleReturn}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" /> Return to My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
