import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import complaintService from '../services/complaintService';
import {
  AlertCircle,
  Plus,
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
  FileText,
} from 'lucide-react';

const ResidentComplaintsPage = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plumbing',
    priority: 'Medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      if (res.success) {
        setComplaints(res.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Please fill in both title and description');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const res = await complaintService.createComplaint(formData);
      if (res.success) {
        setSuccessMessage('Complaint raised successfully!');
        setFormData({
          title: '',
          description: '',
          category: 'Plumbing',
          priority: 'Medium',
        });
        setIsModalOpen(false);
        // Refresh data from REST API
        await fetchComplaints();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
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
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            My Complaints & Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Raise and track maintenance tickets for your residence.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Raise New Complaint
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Open', 'In Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === tab
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
            {tab === 'All'
              ? ` (${complaints.length})`
              : ` (${complaints.filter((c) => c.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Complaint List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {statusFilter === 'All' ? 'No complaints raised yet' : `No ${statusFilter.toLowerCase()} complaints`}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Need assistance with plumbing, electricity, cleaning, or security? Click the button above to raise a ticket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    {getCategoryIcon(complaint.category)}
                    {complaint.category}
                  </span>
                  {getPriorityBadge(complaint.priority)}
                  <span className="text-xs text-slate-400">
                    • {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(complaint.status)}</div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1.5">{complaint.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{complaint.description}</p>

              {complaint.resolutionNote && (
                <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900">
                  <span className="font-bold">Admin Resolution Note: </span>
                  <span>{complaint.resolutionNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Raise New Complaint</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Water leakage in master bathroom"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Security">Security</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Describe the issue, location inside the flat, or specific instructions for maintenance staff..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
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
                  Submitted on{' '}
                  {new Date(selectedComplaint.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                {selectedComplaint.description}
              </div>

              {selectedComplaint.resolutionNote && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-900 mb-1">Resolution Update:</div>
                  <div className="text-xs text-emerald-800">{selectedComplaint.resolutionNote}</div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
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

export default ResidentComplaintsPage;
