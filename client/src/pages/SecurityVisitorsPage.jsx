import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  LogIn,
  Users,
  Car,
  Phone,
  Building,
  AlertCircle,
  Loader2,
  X,
  Plus,
  QrCode,
  ArrowRight,
  User,
  Check,
} from 'lucide-react';

const SecurityVisitorsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('TODAY'); // 'TODAY', 'INSIDE', 'ALL'
  const [visitors, setVisitors] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [stats, setStats] = useState({ expectedToday: 0, currentlyInside: 0, completedToday: 0 });
  const [loading, setLoading] = useState(true);

  // Quick Pass Code Search
  const [passCodeQuery, setPassCodeQuery] = useState('');
  const [searchedPass, setSearchedPass] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // General Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Walk-in modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinPurpose, setWalkinPurpose] = useState('Delivery');
  const [walkinFlatId, setWalkinFlatId] = useState('');
  const [walkinVehicle, setWalkinVehicle] = useState('');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTodayData = async () => {
    try {
      setLoading(true);
      const res = await visitorService.getTodayVisitors();
      if (res.success) {
        setVisitors(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch gate checkpoint visitors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const res = await visitorService.getAllVisitors();
      if (res.success) {
        setAllVisitors(res.data);
      }
    } catch (err) {
      // Ignore
    }
  };

  useEffect(() => {
    fetchTodayData();
    fetchAllData();
  }, []);

  const handleVerifyPassCode = async (e) => {
    e.preventDefault();
    if (!passCodeQuery.trim()) return;

    try {
      setSearchLoading(true);
      setSearchError('');
      setSearchedPass(null);
      const res = await visitorService.verifyPassCode(passCodeQuery.trim());
      if (res.success) {
        setSearchedPass(res.data);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || `No visitor pass found with code "${passCodeQuery}"`);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCheckIn = async (visitorId, name) => {
    try {
      const res = await visitorService.checkInVisitor(visitorId);
      if (res.success) {
        setFeedbackMsg(`✓ Visitor ${name || ''} successfully CHECKED IN at gate.`);
        setSearchedPass(null);
        setPassCodeQuery('');
        fetchTodayData();
        fetchAllData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to check in visitor');
    }
  };

  const handleCheckOut = async (visitorId, name) => {
    try {
      const res = await visitorService.checkOutVisitor(visitorId);
      if (res.success) {
        setFeedbackMsg(`✓ Visitor ${name || ''} successfully CHECKED OUT.`);
        setSearchedPass(null);
        fetchTodayData();
        fetchAllData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to check out visitor');
    }
  };

  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinName || !walkinPhone || !walkinFlatId) {
      setErrorMsg('Please specify visitor name, phone, and target flat ID');
      return;
    }

    try {
      setWalkinSubmitting(true);
      const res = await visitorService.createVisitor({
        visitorName: walkinName,
        phone: walkinPhone,
        purpose: walkinPurpose,
        flat: walkinFlatId,
        expectedDate: new Date().toISOString(),
        vehicleNumber: walkinVehicle,
      });

      if (res.success) {
        // Auto check-in the newly registered walk-in
        await visitorService.checkInVisitor(res.data._id);
        setFeedbackMsg(`✓ Walk-in guest ${walkinName} registered and checked in at gate.`);
        setShowWalkinModal(false);
        setWalkinName('');
        setWalkinPhone('');
        setWalkinVehicle('');
        fetchTodayData();
        fetchAllData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to register walk-in visitor');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  // Determine lists based on active tab
  let displayedVisitors = [];
  if (activeTab === 'TODAY') {
    displayedVisitors = visitors.filter((v) => v.status === 'Pre-Approved');
  } else if (activeTab === 'INSIDE') {
    displayedVisitors = visitors.filter((v) => v.status === 'Checked In');
  } else {
    displayedVisitors = allVisitors;
  }

  // Filter with general search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    displayedVisitors = displayedVisitors.filter(
      (v) =>
        v.visitorName?.toLowerCase().includes(term) ||
        v.phone?.toLowerCase().includes(term) ||
        v.passCode?.toLowerCase().includes(term) ||
        v.flat?.wing?.toLowerCase().includes(term) ||
        v.flat?.flatNumber?.toLowerCase().includes(term)
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Main Gate Checkpoint
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Visitor Gate Clearance Desk
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              Officer on Duty: <span className="font-bold text-white">{user?.name}</span> • Checkpoint Alpha
            </p>
          </div>

          <button
            onClick={() => {
              setShowWalkinModal(true);
              setWalkinFlatId(visitors[0]?.flat?._id || '');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            Direct Walk-in Entry
          </button>
        </div>
      </div>

      {/* Quick Pass Code Scanner Box */}
      <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Quick Pass Code Verification & Check-In
            </h2>
            <p className="text-xs text-slate-500">
              Enter the resident-issued pass code (e.g. VIS-4821) for instant clearance
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyPassCode} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter Pass Code (e.g. VIS-4821)"
              value={passCodeQuery}
              onChange={(e) => setPassCodeQuery(e.target.value.toUpperCase())}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 font-mono text-base font-bold uppercase tracking-wider focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-md"
          >
            {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verify Pass
          </button>
        </form>

        {searchError && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {searchError}
          </div>
        )}

        {/* Searched Pass Quick Action Card */}
        {searchedPass && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900 font-mono">
                    {searchedPass.passCode}
                  </span>
                  <span className="font-bold text-slate-900 text-base">{searchedPass.visitorName}</span>
                  <span className="text-xs text-slate-500">({searchedPass.purpose})</span>
                </div>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-3">
                  <span>
                    Destination: <strong>Wing {searchedPass.flat?.wing || 'A'} • Flat {searchedPass.flat?.flatNumber || '101'}</strong>
                  </span>
                  <span>•</span>
                  <span>Host: <strong>{searchedPass.resident?.name || 'Resident'}</strong></span>
                  {searchedPass.vehicleNumber && (
                    <>
                      <span>•</span>
                      <span>Vehicle: <strong className="font-mono">{searchedPass.vehicleNumber}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {searchedPass.status === 'Pre-Approved' && (
                  <button
                    onClick={() => handleCheckIn(searchedPass._id, searchedPass.visitorName)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Grant Check-In
                  </button>
                )}
                {searchedPass.status === 'Checked In' && (
                  <button
                    onClick={() => handleCheckOut(searchedPass._id, searchedPass.visitorName)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Check Out Visitor
                  </button>
                )}
                {searchedPass.status === 'Checked Out' && (
                  <span className="text-xs text-slate-500 font-medium">Already Checked Out</span>
                )}
                <button
                  onClick={() => setSearchedPass(null)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
          <button onClick={() => setFeedbackMsg('')} className="text-emerald-700 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveTab('TODAY')}
          className={`cursor-pointer bg-white rounded-xl p-5 border transition-all ${
            activeTab === 'TODAY'
              ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : 'border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expected Today
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.expectedToday}</p>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Pre-registered by residents
          </div>
        </div>

        <div
          onClick={() => setActiveTab('INSIDE')}
          className={`cursor-pointer bg-white rounded-xl p-5 border transition-all ${
            activeTab === 'INSIDE'
              ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Currently Inside
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.currentlyInside}</p>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Active guests on premises
          </div>
        </div>

        <div
          onClick={() => setActiveTab('ALL')}
          className={`cursor-pointer bg-white rounded-xl p-5 border transition-all ${
            activeTab === 'ALL'
              ? 'border-teal-500 shadow-md ring-2 ring-teal-500/20'
              : 'border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed Today
            </p>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.completedToday}</p>
          <div className="text-xs text-slate-500 mt-1">Checked out today</div>
        </div>
      </div>

      {/* Tabs & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('TODAY')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TODAY'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expected Today ({stats.expectedToday})
          </button>
          <button
            onClick={() => setActiveTab('INSIDE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'INSIDE'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Currently Inside ({stats.currentlyInside})
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Gate Logs
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search visitor, phone, flat..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Visitor List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-600 text-sm">Loading gate checkpoint records...</p>
        </div>
      ) : displayedVisitors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Visitors Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {activeTab === 'TODAY'
              ? 'No pending expected visitors registered for today.'
              : activeTab === 'INSIDE'
              ? 'No visitors are currently marked as inside the society premise.'
              : 'No gate logs match your active filter.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Visitor & Pass Code</th>
                  <th className="px-5 py-3.5">Target Destination</th>
                  <th className="px-5 py-3.5">Purpose</th>
                  <th className="px-5 py-3.5">Vehicle</th>
                  <th className="px-5 py-3.5">Timestamps</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {displayedVisitors.map((visitor) => (
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
                      <div className="font-bold text-slate-800">
                        Wing {visitor.flat?.wing || 'A'} • Flat {visitor.flat?.flatNumber || '101'}
                      </div>
                      <div className="text-slate-400">Host: {visitor.resident?.name || 'Resident'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        {visitor.purpose}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs font-mono">
                      {visitor.vehicleNumber || <span className="text-slate-400 italic">None</span>}
                    </td>

                    <td className="px-5 py-4 text-xs space-y-0.5">
                      {visitor.checkInTime ? (
                        <div className="text-emerald-700 font-medium">
                          In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          Expected: {new Date(visitor.expectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      {visitor.checkOutTime && (
                        <div className="text-slate-400">
                          Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {visitor.status === 'Pre-Approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          <Clock className="w-3 h-3" /> Pre-Approved
                        </span>
                      )}
                      {visitor.status === 'Checked In' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
                          <ShieldCheck className="w-3 h-3" /> Inside Premise
                        </span>
                      )}
                      {visitor.status === 'Checked Out' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          <CheckCircle2 className="w-3 h-3" /> Checked Out
                        </span>
                      )}
                      {visitor.status === 'Cancelled' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {visitor.status === 'Pre-Approved' && (
                        <button
                          onClick={() => handleCheckIn(visitor._id, visitor.visitorName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                        >
                          <LogIn className="w-3.5 h-3.5" /> Check In
                        </button>
                      )}
                      {visitor.status === 'Checked In' && (
                        <button
                          onClick={() => handleCheckOut(visitor._id, visitor.visitorName)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct Walk-in Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowWalkinModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Gate Walk-in</h3>
                <p className="text-xs text-slate-500">Record arrival of unscheduled guest / courier</p>
              </div>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Visitor full name"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1-555-0000"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose</label>
                  <select
                    value={walkinPurpose}
                    onChange={(e) => setWalkinPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Cab / Taxi">Cab / Taxi</option>
                    <option value="Home Service / Repair">Home Service</option>
                    <option value="Guest / Family">Guest</option>
                    <option value="Official / Business">Official</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Flat ID *</label>
                <input
                  type="text"
                  required
                  placeholder="Target Flat MongoDB ID"
                  value={walkinFlatId}
                  onChange={(e) => setWalkinFlatId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle License Plate</label>
                <input
                  type="text"
                  placeholder="Optional vehicle plate"
                  value={walkinVehicle}
                  onChange={(e) => setWalkinVehicle(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkinSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  {walkinSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  Register & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityVisitorsPage;
