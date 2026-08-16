import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Home,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const RegisterPage = () => {
  const { register, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'resident',
    flatId: '',
  });

  const [flats, setFlats] = useState([]);
  const [loadingFlats, setLoadingFlats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchFlats = async () => {
      try {
        const data = await authService.getAvailableFlats();
        if (data.success) {
          setFlats(data.flats);
        }
      } catch (err) {
        console.error('Failed to load flats:', err);
      } finally {
        setLoadingFlats(false);
      }
    };
    fetchFlats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setErrorMessage('Please fill in all mandatory fields.');
      setSubmitting(false);
      return;
    }

    try {
      const newUser = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        flatId: formData.flatId || null,
      });

      navigate(getRedirectPath(newUser.role), { replace: true });
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Registration failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Building2 className="w-8 h-8" />
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Resident Account
        </h1>
        <p className="mt-1 text-center text-sm text-slate-600">
          Register your apartment and connect with the society portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name *
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email Address *
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                  Phone Number *
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1-555-0123"
                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password * (min 6 characters)
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="resident">Resident</option>
                  <option value="security">Security Guard</option>
                </select>
              </div>

              <div>
                <label htmlFor="flatId" className="block text-sm font-medium text-slate-700">
                  Select Flat / Apartment
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <select
                    id="flatId"
                    name="flatId"
                    value={formData.flatId}
                    onChange={handleChange}
                    disabled={loadingFlats}
                    className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:bg-slate-100"
                  >
                    <option value="">-- Choose Flat (Optional) --</option>
                    {flats.map((flat) => (
                      <option key={flat._id} value={flat._id}>
                        Wing {flat.wing} - Flat {flat.flatNumber} ({flat.type}, Floor {flat.floor}) {flat.status === 'occupied' ? '• Occupied' : '• Vacant'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
