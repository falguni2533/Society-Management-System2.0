import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Shield,
  Building,
  Users,
  Activity,
  Loader2,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await authService.getAdminDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Loading admin dashboard...</p>
      </div>
    );
  }

  const counts = data?.counts || {
    residents: 0,
    securityStaff: 0,
    admins: 0,
    totalUsers: 0,
    flats: { total: 0, occupied: 0, vacant: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-3">
              <Shield className="w-3.5 h-3.5" /> Society Committee Admin
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Administrative Control Center
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Logged in as <span className="font-semibold text-white">{user?.name}</span> ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-xs text-slate-300 font-medium">System Status</div>
              <div className="text-sm font-bold text-white">Database Connected & Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Counts Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Residents
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{counts.residents}</p>
          <div className="text-xs text-slate-500 mt-1">Active registered residents</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Flats
            </p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{counts.flats.total}</p>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-emerald-600 font-semibold">{counts.flats.occupied} Occupied</span>
            <span>•</span>
            <span className="text-slate-500">{counts.flats.vacant} Vacant</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Security Staff
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{counts.securityStaff}</p>
          <div className="text-xs text-emerald-600 font-medium mt-1">Checkpoints Active</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total System Users
            </p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{counts.totalUsers}</p>
          <div className="text-xs text-purple-700 font-medium mt-1">
            {counts.admins} Admin accounts
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

