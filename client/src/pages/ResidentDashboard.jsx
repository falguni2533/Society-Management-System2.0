import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Home,
  AlertCircle,
  CreditCard,
  Bell,
  Users,
  Bot,
  CheckCircle2,
  Phone,
  Mail,
  Building,
  Loader2,
  Calendar,
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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Complaints
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0 Active</p>
            <p className="text-xs text-slate-500 mt-1">No issues raised</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Maintenance Due
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">$0.00</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">All Dues Cleared</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expected Visitors
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0 Scheduled</p>
            <p className="text-xs text-slate-500 mt-1">Gate pre-approval</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Society Notices
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">0 Unread</p>
            <p className="text-xs text-slate-500 mt-1">Broadcast bulletin</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
        </div>
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
              Society Services & Guidelines
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Resident Quick Info
            </span>
          </div>

          <p className="text-sm text-slate-600 mb-5">
            Important resident services and security guidelines for SocietySphere residents:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                1
              </div>
              <div>
                <div className="font-semibold text-slate-800">Visitor Entry Registration</div>
                <div className="text-xs text-slate-500">Pre-approve guests for faster checkpoint entry at Main Gate.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                2
              </div>
              <div>
                <div className="font-semibold text-slate-800">Maintenance & Dues</div>
                <div className="text-xs text-slate-500">Track monthly maintenance bills and payment history online.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                3
              </div>
              <div>
                <div className="font-semibold text-slate-800">Complaints & Helpdesk</div>
                <div className="text-xs text-slate-500">Raise maintenance or facility tickets directly to the administration.</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                4
              </div>
              <div>
                <div className="font-semibold text-slate-800">Society Bulletins</div>
                <div className="text-xs text-slate-500">Stay updated on AGM notices, maintenance drives, and community events.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;

