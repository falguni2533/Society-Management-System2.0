import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import {
  Users,
  Plus,
  QrCode,
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
  X,
  Share2,
  Building,
  Ban,
  Copy,
  Check,
} from 'lucide-react';

const ResidentVisitorsPage = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVisitorPass, setSelectedVisitorPass] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form State
  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [purpose, setPurpose] = useState('Guest / Family');
  const [expectedDate, setExpectedDate] = useState('');
  const [expectedTime, setExpectedTime] = useState('14:00');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await visitorService.getMyVisitors(params);
      if (res.success) {
        setVisitors(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load visitors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter]);

  useEffect(() => {
    // Default expected date = today
    const today = new Date().toISOString().split('T')[0];
    setExpectedDate(today);
  }, []);

  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName || !phone || !expectedDate) {
      setError('Please provide visitor name, phone number, and arrival date');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const visitorData = {
        visitorName,
        phone,
        purpose,
        expectedDate,
        expectedTime,
        vehicleNumber,
        notes,
      };

      const res = await visitorService.createVisitor(visitorData);
      if (res.success) {
        setSuccessMsg(`Visitor pass generated! Pass Code: ${res.data.passCode}`);
        setShowCreateModal(false);
        // Show pass preview
        setSelectedVisitorPass(res.data);
        // Reset form
        setVisitorName('');
        setPhone('');
        setVehicleNumber('');
        setNotes('');
        fetchVisitors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to pre-approve visitor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelVisitor = async (visitorId) => {
    if (!window.confirm('Are you sure you want to cancel this visitor pre-approval?')) return;

    try {
      const res = await visitorService.cancelVisitor(visitorId);
      if (res.success) {
        setSuccessMsg('Visitor pre-approval cancelled');
        fetchVisitors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel visitor pass');
    }
  };

  const handleCopyPassCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredVisitors = visitors.filter((v) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      v.visitorName?.toLowerCase().includes(term) ||
      v.phone?.toLowerCase().includes(term) ||
      v.passCode?.toLowerCase().includes(term) ||
      v.purpose?.toLowerCase().includes(term) ||
      v.vehicleNumber?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pre-Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Pre-Approved
          </span>
        );
      case 'Checked In':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Inside Premise
          </span>
        );
      case 'Checked Out':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            Completed Visit
          </span>
        );
      case 'Cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <Ban className="w-3.5 h-3.5 text-red-600" />
            Cancelled
          </span>
        );
    }
  };

  const expectedCount = visitors.filter((v) => v.status === 'Pre-Approved').length;
  const insideCount = visitors.filter((v) => v.status === 'Checked In').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-200 border border-teal-400/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Gate Clearance & Security
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Visitor Pre-Approval Portal
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              Pre-authorize expected guests, delivery drivers, and service staff for smooth gate entry.
            </p>
          </div>

          <button
            onClick={() => {
              setShowCreateModal(true);
              setError('');
              setSuccessMsg('');
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold text-sm shadow-lg shadow-teal-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            Pre-Approve Visitor
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {error}
          </div>
          <button onClick={() => setError('')} className="text-red-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Expected Passes
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{expectedCount}</p>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Pre-approved for gate entry
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Currently on Premises
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{insideCount}</p>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Checked in at Main Gate
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Passes Created
            </p>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{visitors.length}</p>
          <div className="text-xs text-slate-500 mt-1">All visitor history</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pre-Approved', 'Checked In', 'Checked Out', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Visits' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, phone..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Visitor List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-600 text-sm">Loading visitor records...</p>
        </div>
      ) : filteredVisitors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Visitor Records</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No visitors match your search filter.'
              : 'You have not pre-approved any visitors yet. Click "Pre-Approve Visitor" to generate your first digital pass.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVisitors.map((visitor) => (
            <div
              key={visitor._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {visitor.purpose}
                  </span>
                  {getStatusBadge(visitor.status)}
                </div>

                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900">{visitor.visitorName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {visitor.phone}
                  </div>
                </div>

                {/* Pass Code Card */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-3.5 my-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">
                        Digital Gate Pass
                      </div>
                      <div className="text-xl font-extrabold tracking-wider font-mono text-white mt-0.5">
                        {visitor.passCode}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyPassCode(visitor.passCode)}
                      title="Copy Pass Code"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Expected:{' '}
                      <strong>
                        {new Date(visitor.expectedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </strong>{' '}
                      {visitor.expectedTime && `at ${visitor.expectedTime}`}
                    </span>
                  </div>

                  {visitor.vehicleNumber && (
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Vehicle: <strong className="font-mono">{visitor.vehicleNumber}</strong></span>
                    </div>
                  )}

                  {visitor.checkInTime && (
                    <div className="text-emerald-700 text-[11px] pt-1">
                      ✓ Checked in: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}

                  {visitor.checkOutTime && (
                    <div className="text-slate-500 text-[11px]">
                      • Checked out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedVisitorPass(visitor)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Share2 className="w-3.5 h-3.5" /> View Pass
                </button>

                {visitor.status === 'Pre-Approved' && (
                  <button
                    onClick={() => handleCancelVisitor(visitor._id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    <Ban className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pre-Approve Visitor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Pre-Approve Visitor</h3>
                <p className="text-xs text-slate-500">Issue gate entry clearance for your guest</p>
              </div>
            </div>

            <form onSubmit={handleCreateVisitor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Davis"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+1-555-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purpose of Visit</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Guest / Family">Guest / Family</option>
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Home Service / Repair">Home Service / Repair</option>
                    <option value="Cab / Taxi">Cab / Taxi</option>
                    <option value="Official / Business">Official / Business</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Date *</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 14:30 or 2:30 PM"
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vehicle License Plate (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-AB-1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="Optional gate instructions for security officer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Generate Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / View Pass Card Modal */}
      {selectedVisitorPass && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 text-center">
            <button
              onClick={() => setSelectedVisitorPass(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="text-xs text-teal-600 font-bold uppercase tracking-widest">
              SocietySphere Gate Pass
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {selectedVisitorPass.visitorName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{selectedVisitorPass.purpose}</p>

            {/* Pass Code Visual Box */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-indigo-500/20 mb-4">
              <div className="text-[11px] text-teal-300 font-semibold tracking-wider uppercase">
                Checkpoint Pass Code
              </div>
              <div className="text-3xl font-black font-mono tracking-widest text-teal-300 my-2">
                {selectedVisitorPass.passCode}
              </div>
              <div className="text-[11px] text-slate-300">
                Destination: <strong>Wing {selectedVisitorPass.flat?.wing || user?.flat?.wing || 'A'} • Flat {selectedVisitorPass.flat?.flatNumber || user?.flat?.flatNumber || '101'}</strong>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Host Resident: {user?.name}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
              Share this code with your visitor. The security guard at Main Gate will verify this pass code for immediate entry clearance.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopyPassCode(selectedVisitorPass.passCode)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied to Clipboard' : 'Copy Pass Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentVisitorsPage;
