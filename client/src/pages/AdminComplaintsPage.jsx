import React, { useState, useEffect } from 'react';
import complaintService from '../services/complaintService';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  X,
  Loader2,
  Wrench,
  Zap,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Edit3,
  User,
  Home,
  Phone,
  Mail,
  Search,
} from 'lucide-react';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);

  // Status Update Modal State
  const [updateStatus, setUpdateStatus] = useState('In Progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;

      const res = await complaintService.getAllComplaints(filters);
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleOpenEdit = (complaint, e) => {
    e.stopPropagation();
    setEditingComplaint(complaint);
    setUpdateStatus(complaint.status);
    setResolutionNote(complaint.resolutionNote || '');
    setUpdateError('');
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;

    try {
      setUpdating(true);
      setUpdateError('');
      const res = await complaintService.updateComplaintStatus(editingComplaint._id, {
        status: updateStatus,
        resolutionNote,
      });

      if (res.success) {
        setSuccessMessage(`Complaint status updated to ${updateStatus}!`);
        setEditingComplaint(null);
        // Refresh data via REST API
        await fetchComplaints();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update complaint status');
    } finally {
      setUpdating(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Plumbing':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'Electrical':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'Cleaning':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'Security':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case 'Open':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertCircle className="w-3 h-3" /> Open
          </span>
        );
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
            Low
          </span>
        );
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = c.title.toLowerCase().includes(q);
    const residentMatch = c.resident?.name?.toLowerCase().includes(q);
    const flatMatch = c.resident?.flat?.flatNumber?.toLowerCase().includes(q);
    return titleMatch || residentMatch || flatMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <AlertCircle className="w-6 h-6 text-purple-600" />
          Society Complaints Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, assign, and resolve maintenance tickets raised by residents.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {[
            { label: 'All Statuses', value: '' },
            { label: 'Open', value: 'Open' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Resolved', value: 'Resolved' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === item.value
                  ? 'bg-purple-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resident, title..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-48 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Complaints List Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">No complaints found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No complaints matching the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-all cursor-pointer"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                      {getCategoryIcon(complaint.category)}
                      {complaint.category}
                    </span>
                    {getPriorityBadge(complaint.priority)}
                    {getStatusBadge(complaint.status)}
                    <span className="text-xs text-slate-400">
                      • {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{complaint.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{complaint.description}</p>
                </div>

                {/* Resident metadata and Update Action */}
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-right text-xs">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5 justify-end">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {complaint.resident?.name || 'Resident'}
                    </div>
                    <div className="text-slate-500 flex items-center gap-1 justify-end mt-0.5">
                      <Home className="w-3 h-3 text-slate-400" />
                      {complaint.resident?.flat
                        ? `Wing ${complaint.resident.flat.wing} - Flat ${complaint.resident.flat.flatNumber}`
                        : 'No Flat'}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleOpenEdit(complaint, e)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Update Status
                  </button>
                </div>
              </div>

              {complaint.resolutionNote && (
                <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold">Resolution Note: </span>
                  <span>{complaint.resolutionNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Status & Resolution Update Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Update Complaint Status</h2>
              <button
                onClick={() => setEditingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <div className="mb-4 p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{editingComplaint.title}</div>
              <div className="text-slate-600">
                Resident: <span className="font-medium text-slate-800">{editingComplaint.resident?.name}</span> ({editingComplaint.resident?.phone})
              </div>
              <div className="text-slate-600">
                Flat: <span className="font-medium text-slate-800">
                  {editingComplaint.resident?.flat ? `Wing ${editingComplaint.resident.flat.wing} - Flat ${editingComplaint.resident.flat.flatNumber}` : 'N/A'}
                </span>
              </div>
            </div>

            <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Select Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Resolution / Admin Note
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Technician assigned, inspection scheduled, replacement completed..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingComplaint(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && !editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedComplaint.status)}
                {getPriorityBadge(selectedComplaint.priority)}
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {selectedComplaint.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedComplaint.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Submitted on {new Date(selectedComplaint.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Resident Info Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">Resident</span>
                  <span className="font-semibold text-slate-800">{selectedComplaint.resident?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Flat</span>
                  <span className="font-semibold text-slate-800">
                    {selectedComplaint.resident?.flat
                      ? `Wing ${selectedComplaint.resident.flat.wing} - Flat ${selectedComplaint.resident.flat.flatNumber}`
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <span className="font-medium text-slate-800">{selectedComplaint.resident?.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-medium text-slate-800">{selectedComplaint.resident?.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                {selectedComplaint.description}
              </div>

              {selectedComplaint.resolutionNote && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-900 mb-1">Resolution Note:</div>
                  <div className="text-xs text-emerald-800">{selectedComplaint.resolutionNote}</div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={(e) => handleOpenEdit(selectedComplaint, e)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-semibold border border-purple-200"
              >
                <Edit3 className="w-3.5 h-3.5" /> Update Status & Note
              </button>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintsPage;
