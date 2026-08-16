import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const LoginPage = () => {
  const { login, isAuthenticated, user, getRedirectPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('expired') === 'true') {
      setSessionExpiredNotice(true);
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPath(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, getRedirectPath]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const loggedInUser = await login(formData.email, formData.password);
      const targetPath =
        location.state?.from?.pathname || getRedirectPath(loggedInUser.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Login failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (email, password) => {
    setFormData({ email, password });
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          SocietySphere
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Sign in to your society management account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {sessionExpiredNotice && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>Your previous session has expired. Please sign in again.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="mt-1.5 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Phase 1 Testing */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@society.com', 'admin123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-900 text-xs font-medium transition-all"
              >
                <Shield className="w-4 h-4 text-purple-600 mb-1" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('resident@society.com', 'resident123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 text-xs font-medium transition-all"
              >
                <User className="w-4 h-4 text-blue-600 mb-1" />
                <span>Resident</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('security@society.com', 'security123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-900 text-xs font-medium transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Security</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              New resident in the society?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Register your flat
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
