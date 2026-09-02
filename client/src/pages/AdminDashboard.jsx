import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Shield,
  Building,
  Users,
  Activity,
  Loader2,
  AlertCircle,
  Bell,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
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

  const stats = data?.stats || {
    totalComplaints: 0,
    openComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
    totalNotices: 0,
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

      {/* Complaints & Notices Operational Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Complaints Summary</h2>
                  <p className="text-xs text-slate-500">Maintenance & service tickets</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                {stats.totalComplaints} Total
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-center">
                <div className="text-xl font-bold text-blue-700">{stats.openComplaints}</div>
                <div className="text-[11px] font-medium text-blue-600 mt-0.5">Open</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100 text-center">
                <div className="text-xl font-bold text-amber-700">{stats.inProgressComplaints}</div>
                <div className="text-[11px] font-medium text-amber-600 mt-0.5">In Progress</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-xl font-bold text-emerald-700">{stats.resolvedComplaints}</div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Resolved</div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/complaints"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-200 text-xs font-semibold text-purple-900 transition-all mt-2 group"
          >
            <span>Manage & resolve tickets</span>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Notices Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Notice Board</h2>
                  <p className="text-xs text-slate-500">Official circulars & broadcasts</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                {stats.totalNotices} Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed my-4">
              Publish society maintenance announcements, meeting notices, rules, and circulars visible to all residents and security personnel.
            </p>
          </div>

          <Link
            to="/admin/notices"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-purple-50/60 border border-slate-200 hover:border-purple-200 text-xs font-semibold text-purple-900 transition-all mt-2 group"
          >
            <span>Publish & manage notices</span>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Maintenance Billing Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Maintenance & Dues</h2>
                  <p className="text-xs text-slate-500">Society financial collections</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {stats.billing?.totalBills || 0} Invoices
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-center">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="text-lg font-extrabold text-emerald-700">
                  ${stats.billing?.totalCollectedDues?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Collected</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
                <div className="text-lg font-extrabold text-amber-700">
                  ${stats.billing?.totalPendingDues?.toFixed(2) || stats.pendingDues?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] font-medium text-amber-600 mt-0.5">Outstanding Dues</div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/bills"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-emerald-900 transition-all mt-2 group"
          >
            <span>Manage society bills & invoices</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Visitor Operations Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Gate & Visitors</h2>
                  <p className="text-xs text-slate-500">Security checkpoint records</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                {stats.visitors?.totalVisitors || 0} Total Visits
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-center">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                <div className="text-lg font-extrabold text-blue-700">
                  {stats.visitors?.expectedToday || stats.expectedVisitorsToday || 0}
                </div>
                <div className="text-[11px] font-medium text-blue-600 mt-0.5">Expected Today</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="text-lg font-extrabold text-emerald-700">
                  {stats.visitors?.currentlyInside || stats.activeVisitorsInside || 0}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Currently Inside</div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/visitors"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-blue-900 transition-all mt-2 group"
          >
            <span>View gate logs & visitor registry</span>
            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
