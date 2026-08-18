import React, { useState, useEffect } from 'react';
import noticeService from '../services/noticeService';
import {
  Bell,
  Calendar,
  User,
  X,
  Loader2,
  FileText,
  Pin,
} from 'lucide-react';

const ResidentNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-blue-600" />
          Society Notices & Circulars
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Official announcements, maintenance schedules, and society communications.
        </p>
      </div>

      {/* Notices List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-500 text-sm">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No notices published yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Society committee announcements and maintenance circulars will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((notice) => (
            <div
              key={notice._id}
              onClick={() => setSelectedNotice(notice)}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-2.5">
                  <span className="inline-flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" /> Official Notice
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
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  By {notice.createdBy?.name || 'Society Admin'}
                </span>
                <span className="text-blue-600 font-semibold hover:underline">Read full notice →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                <Pin className="w-3 h-3" /> Society Bulletin
              </span>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">{selectedNotice.title}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedNotice.createdAt).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {selectedNotice.createdBy?.name || 'Admin'}
                </span>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap py-2">
                {selectedNotice.content}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
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

export default ResidentNoticesPage;
