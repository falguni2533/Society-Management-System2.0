import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import {
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Car,
  Search,
  Filter,
  Loader2,
  Building2,
  Ban,
  Activity,
  Eye,
} from 'lucide-react';

const AdminVisitorsPage = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wingFilter, setWingFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (wingFilter !== 'ALL') {
        params.wing = wingFilter;
      }
      const res = await visitorService.getAllVisitors(params);
      if (res.success) {
        setVisitors(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load society visitor logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, wingFilter]);

  const filteredVisitors = visitors.filter((v) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.visitorName?.toLowerCase().includes(term) ||
      v.phone?.toLowerCase().includes(term) ||
      v.passCode?.toLowerCase().includes(term) ||
      v.resident?.name?.toLowerCase().includes(term) ||
      v.flat?.wing?.toLowerCase().includes(term) ||
      v.flat?.flatNumber?.toLowerCase().includes(term) ||
      v.vehicleNumber?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pre-Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Pre-Approved
          </span>
        );
      case 'Checked In':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Inside Premise
          </span>
        );
      case 'Checked Out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Completed
          </span>
        );
      case 'Cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            <Ban className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        );
    }
  };

  const insideCount = visitors.filter((v) => v.status === 'Checked In').length;
  const preApprovedCount = visitors.filter((v) => v.status === 'Pre-Approved').length;
  const completedCount = visitors.filter((v) => v.status === 'Checked Out').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Society Gate Security & Audits
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Visitor Registry & Gate Logs
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Comprehensive society visitor registry, check-in history, and security gate logs.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-xs text-slate-300 font-medium">Gate Security</div>
              <div className="text-sm font-bold text-white">Active Logs Connected</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Currently Inside
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{insideCount}</p>
          <div className="text-xs text-emerald-600 font-medium mt-1">Active on premises</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pre-Approved Expected
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{preApprovedCount}</p>
          <div className="text-xs text-blue-600 font-medium mt-1">Awaiting gate arrival</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed Visits
            </p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{completedCount}</p>
          <div className="text-xs text-slate-500 mt-1">Past checked-out visits</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Registry Logs
            </p>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{visitors.length}</p>
          <div className="text-xs text-slate-500 mt-1">All society visitor entries</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Status Tabs */}
          {['ALL', 'Pre-Approved', 'Checked In', 'Checked Out', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Statuses' : tab}
            </button>
          ))}

          {/* Wing Filter */}
          <select
            value={wingFilter}
            onChange={(e) => setWingFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Wings</option>
            <option value="A">Wing A</option>
            <option value="B">Wing B</option>
            <option value="C">Wing C</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search visitor, host, flat, code..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-slate-600 text-sm">Loading society visitor registry...</p>
        </div>
      ) : filteredVisitors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Visitor Records Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            No visitor logs match your selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Visitor & Pass Code</th>
                  <th className="px-5 py-3.5">Host Resident & Unit</th>
                  <th className="px-5 py-3.5">Purpose</th>
                  <th className="px-5 py-3.5">Expected Arrival</th>
                  <th className="px-5 py-3.5">Gate Timestamps</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-teal-300">
                          {visitor.passCode}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{visitor.visitorName}</div>
                          <div className="text-xs text-slate-400">{visitor.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs">
                      <div className="font-bold text-slate-900">
                        Wing {visitor.flat?.wing || 'A'} • Flat {visitor.flat?.flatNumber || '101'}
                      </div>
                      <div className="text-slate-500">Host: {visitor.resident?.name || 'Resident'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        {visitor.purpose}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div>
                        {new Date(visitor.expectedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      {visitor.expectedTime && (
                        <div className="text-slate-400 text-[11px]">{visitor.expectedTime}</div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs space-y-0.5">
                      {visitor.checkInTime ? (
                        <div className="text-emerald-700 font-medium">
                          In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not checked in</span>
                      )}
                      {visitor.checkOutTime && (
                        <div className="text-slate-400">
                          Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      {visitor.vehicleNumber || <span className="text-slate-400 italic">None</span>}
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(visitor.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVisitorsPage;
