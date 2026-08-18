import React, { useState, useEffect } from 'react';
import noticeService from '../services/noticeService';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  User,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Pin,
} from 'lucide-react';

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeService.getNotices();
      if (res.success) {
        setNotices(res.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Please enter both title and content');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const res = await noticeService.createNotice(formData);
      if (res.success) {
        setSuccessMessage('Notice published successfully!');
        setFormData({ title: '', content: '' });
        setIsModalOpen(false);
        // Refresh from REST API
        await fetchNotices();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to publish notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete notice "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await noticeService.deleteNotice(id);
      if (res.success) {
        setSuccessMessage('Notice deleted successfully!');
        // Refresh from REST API
        await fetchNotices();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete notice');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-purple-600" />
            Society Notice Board Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast circulars, maintenance announcements, and general notices to all residents.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Publish New Notice
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Notices List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Bell className="w-10 h-10 text-purple-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-800">No active notices</h3>
          <p className="text-xs text-slate-500 mt-1">
            Click the button above to publish your first announcement to the society.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-purple-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5">
                  <span className="inline-flex items-center gap-1 text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" /> Published Circular
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{notice.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {notice.createdBy?.name || 'Admin'}
                </span>

                <button
                  onClick={() => handleDeleteNotice(notice._id, notice.title)}
                  disabled={deletingId === notice._id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md font-semibold transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deletingId === notice._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Publish Society Notice</h2>
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
                  Notice Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Water Tank Cleaning & Supply Interruption"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Content / Message *
                </label>
                <textarea
                  name="content"
                  required
                  rows={5}
                  value={formData.content}
                  onChange={handleFormChange}
                  placeholder="Provide all details including timing, impact, and committee instructions for residents..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="px-5 py-2 text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNoticesPage;
