import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  ShieldCheck,
  Users,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';

const SecurityDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const res = await authService.getSecurityDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch security dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm">Loading gate checkpoint dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Main Gate Checkpoint
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Security Operations Center
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              Officer On Duty: <span className="font-semibold text-white">{user?.name}</span> ({user?.phone})
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-xs text-teal-200 font-medium">Shift Status</div>
              <div className="text-sm font-bold text-white">Active Duty • Main Gate 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expected Today
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">0</p>
          <div className="text-xs text-slate-500 mt-1">Pre-registered by residents</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Currently Inside
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">0</p>
          <div className="text-xs text-emerald-600 font-medium mt-1">Active on premises</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Flats Registered
            </p>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {data?.societyOverview?.totalFlats || 10}
          </p>
          <div className="text-xs text-slate-500 mt-1">Wings A, B, and C</div>
        </div>
      </div>

      {/* Security Scope & Privacy Compliance */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Security Access Control & Data Isolation
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          In strict compliance with society security policies, security personnel have dedicated access to visitor verification and gate logs, with zero access to private resident financial records or bills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900 mb-1">✓ Visitor Management</div>
            <div className="text-xs text-slate-500">
              Verify pre-approved guests and record visitor check-ins & exits.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-semibold text-slate-900 mb-1">✓ Society Directory</div>
            <div className="text-xs text-slate-500">
              Quick look up of wing and flat numbers for guest assistance.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-900">
            <div className="font-semibold mb-1">🔒 RBAC Protected</div>
            <div className="text-xs text-emerald-700">
              Financial data and administrative controls are securely restricted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
