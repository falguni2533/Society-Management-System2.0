import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Home,
  AlertCircle,
  CreditCard,
  Bell,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  Loader2,
  ArrowRight,
} from 'lucide-react';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await authService.getResidentDashboard();
        if (res.success) {
          setDashboardData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Loading resident dashboard...</p>
      </div>
    );
  }

  const flatInfo = dashboardData?.flat || user?.flat;
  const stats = dashboardData?.stats || {
    activeComplaints: 0,
    resolvedComplaints: 0,
    totalNotices: 0,
    pendingBills: 0,
    expectedVisitorsToday: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm text-white mb-3">
              <Home className="w-3.5 h-3.5" /> Resident Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Your society residence portal is active and secure.
            </p>
          </div>

          {/* Resident Flat Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold text-lg shadow-inner">
              {flatInfo ? `${flatInfo.wing}` : 'N/A'}
            </div>
            <div>
              <div className="text-xs text-blue-200 font-medium">Assigned Flat</div>
              <div className="text-lg font-bold text-white">
                {flatInfo
                  ? `Wing ${flatInfo.wing} • Flat ${flatInfo.flatNumber}`
                  : 'No flat assigned yet'}
              </div>
              {flatInfo && (
                <div className="text-xs text-blue-200">
                  Floor {flatInfo.floor} • {flatInfo.type}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/resident/complaints"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              My Complaints
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.activeComplaints} Active
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              View tickets <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/resident/notices"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Society Notices
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalNotices} Available
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              Read circulars <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/resident/bills"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Maintenance Due
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              ${stats.totalPendingAmount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs font-medium mt-1 flex items-center gap-1">
              {stats.pendingBills > 0 ? (
                <span className="text-amber-600 font-semibold">{stats.pendingBills} Pending Invoice(s)</span>
              ) : (
                <span className="text-emerald-600">All Dues Cleared</span>
              )}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/resident/visitors"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expected Visitors
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.expectedVisitorsToday || 0} Scheduled
            </p>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              Gate pre-approval <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Resident Profile & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Resident Information
          </h2>
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Name</span>
              <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Role Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                Verified Resident
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-700 text-xs">
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Society Guidelines & Helpdesk Card */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Society Services & Quick Links
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Resident Portal
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-5">
            Access society services directly from your dashboard:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
            <Link
              to="/resident/complaints"
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-blue-700">
                  Maintenance Complaints
                </div>
                <div className="text-xs text-slate-500">Raise and track plumbing, electrical, or cleaning tickets.</div>
              </div>
            </Link>

            <Link
              to="/resident/notices"
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-blue-50/60 hover:border-blue-200 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-purple-700">
                  Society Circulars
                </div>
                <div className="text-xs text-slate-500">Stay updated on society meetings, rules, and announcements.</div>
              </div>
            </Link>

            <Link
              to="/resident/bills"
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-emerald-700">Maintenance & Dues</div>
                <div className="text-xs text-slate-500">View bill statements and payment status.</div>
              </div>
            </Link>

            <Link
              to="/resident/visitors"
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-teal-50/60 hover:border-teal-200 transition-all flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 group-hover:text-teal-700">Visitor Pre-Approval</div>
                <div className="text-xs text-slate-500">Register expected guests for gate clearance.</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
