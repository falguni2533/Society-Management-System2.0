import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import billService from '../services/billService';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Loader2,
  Receipt,
  Download,
  Building2,
  X,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

const ResidentBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentModalBill, setPaymentModalBill] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await billService.getMyBills(params);
      if (res.success) {
        setBills(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const filteredBills = bills.filter((bill) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      bill.billType?.toLowerCase().includes(term) ||
      bill.month?.toLowerCase().includes(term) ||
      bill.year?.toString().includes(term) ||
      bill.description?.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Overdue
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Due
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-3">
              <CreditCard className="w-3.5 h-3.5" /> Maintenance & Financial Records
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              My Maintenance Bills
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              View your flat maintenance invoices, dues, and verified payment history.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white text-blue-700 flex items-center justify-center font-bold text-lg shadow-inner">
              {user?.flat ? `A-${user.flat.flatNumber || '101'}` : 'Flat'}
            </div>
            <div>
              <div className="text-xs text-blue-200 font-medium">Assigned Unit</div>
              <div className="text-base font-bold text-white">
                {user?.flat
                  ? `Wing ${user.flat.wing} • Flat ${user.flat.flatNumber}`
                  : 'Residence Unit'}
              </div>
              <div className="text-xs text-blue-200 font-normal">
                {user?.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Outstanding Due
            </p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            ${summary?.totalPendingAmount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-xs mt-1">
            {summary?.totalPendingAmount > 0 ? (
              <span className="text-amber-600 font-medium">
                {summary?.pendingCount || 0} invoice(s) awaiting clearance
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All dues cleared
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Paid to Society
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ${summary?.totalPaidAmount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-xs text-slate-500 mt-1">
            {summary?.paidCount || 0} successfully settled invoice(s)
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Invoices Issued
            </p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {summary?.totalBills || bills.length}
          </p>
          <div className="text-xs text-slate-500 mt-1">
            Society maintenance billing cycles
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Paid', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Invoices' : tab}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by month, type, note..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bills List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-slate-600 text-sm">Loading your maintenance bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Bills Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No bills match your active filters. Try resetting the search or status filter.'
              : 'You do not have any maintenance bills issued for your flat yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Invoice / Period</th>
                  <th className="px-5 py-3.5">Bill Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment Details</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {bill.month} {bill.year}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">
                        {bill.description || `Society Maintenance`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                        {bill.billType || 'Maintenance'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 text-base">
                        ${bill.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(bill.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(bill.status)}</td>
                    <td className="px-5 py-4 text-xs">
                      {bill.status === 'Paid' ? (
                        <div>
                          <div className="font-medium text-emerald-700">
                            {bill.paymentMethod || 'Settled'}
                          </div>
                          {bill.paidDate && (
                            <div className="text-[11px] text-slate-400">
                              {new Date(bill.paidDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unpaid</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedBill(bill)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">SocietySphere Invoice</h3>
                  <p className="text-xs text-slate-500">Official Society Maintenance Statement</p>
                </div>
              </div>
              <div>{getStatusBadge(selectedBill.status)}</div>
            </div>

            {/* Bill Meta */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-bold text-slate-900">{selectedBill.month} {selectedBill.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{selectedBill.billType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billed Unit:</span>
                <span className="font-semibold text-slate-800">
                  Wing {selectedBill.flat?.wing || user?.flat?.wing || 'A'} • Flat {selectedBill.flat?.flatNumber || user?.flat?.flatNumber || '101'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resident Name:</span>
                <span className="font-semibold text-slate-800">{selectedBill.resident?.name || user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Due Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedBill.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {selectedBill.status === 'Paid' && (
                <>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-emerald-800">
                    <span className="text-emerald-600 font-medium">Payment Mode:</span>
                    <span className="font-bold">{selectedBill.paymentMethod || 'Bank Transfer'}</span>
                  </div>
                  {selectedBill.paymentReference && (
                    <div className="flex justify-between text-emerald-800">
                      <span className="text-emerald-600 font-medium">Ref / Txn ID:</span>
                      <span className="font-mono">{selectedBill.paymentReference}</span>
                    </div>
                  )}
                  {selectedBill.paidDate && (
                    <div className="flex justify-between text-emerald-800">
                      <span className="text-emerald-600 font-medium">Settled On:</span>
                      <span>
                        {new Date(selectedBill.paidDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Charge breakdown */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-600">Base Maintenance Assessment</span>
                <span className="font-semibold text-slate-900">${selectedBill.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span className="text-slate-600">Late Surcharge / Penalty</span>
                <span className="font-semibold text-slate-900">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-extrabold py-2 text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-blue-700">${selectedBill.amount.toFixed(2)}</span>
              </div>
            </div>

            {selectedBill.notes && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 mb-5">
                <span className="font-semibold">Society Note:</span> {selectedBill.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
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

export default ResidentBillsPage;
