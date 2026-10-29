import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import billService from '../services/billService';
import authService from '../services/authService';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Loader2,
  Trash2,
  Receipt,
  Building2,
  X,
  User,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AdminBillsPage = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Create Bill Form State
  const [flats, setFlats] = useState([]);
  const [selectedFlatId, setSelectedFlatId] = useState('');
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [billType, setBillType] = useState('Maintenance');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Pay Bill Form State
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await billService.getAllBills(params);
      if (res.success) {
        setBills(res.data);
        setSummary(res.summary);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load society bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  // Pre-populate default due date
  useEffect(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 15);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setError('');
    setSuccessMsg('');
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!selectedFlatId || !amount || !month || !year || !dueDate) {
      setError('Please fill in all required fields (Flat, Amount, Month, Year, Due Date)');
      return;
    }

    try {
      setCreateSubmitting(true);
      setError('');
      const billData = {
        flat: selectedFlatId,
        resident: selectedResidentId || undefined,
        amount: Number(amount),
        month,
        year: Number(year),
        billType,
        dueDate,
        description,
        notes,
      };

      const res = await billService.createBill(billData);
      if (res.success) {
        setSuccessMsg('Maintenance bill created successfully!');
        setShowCreateModal(false);
        // Reset form
        setAmount('');
        setDescription('');
        setNotes('');
        fetchBills();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bill');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleOpenPayModal = (bill) => {
    setSelectedBill(bill);
    setPaymentMethod('Bank Transfer');
    setPaymentReference('');
    setPayNotes('');
    setShowPayModal(true);
  };

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setPaySubmitting(true);
      const res = await billService.updateBillStatus(selectedBill._id, {
        status: 'Paid',
        paymentMethod,
        paymentReference,
        notes: payNotes,
      });

      if (res.success) {
        setSuccessMsg(`Bill for ${selectedBill.flat?.wing}-${selectedBill.flat?.flatNumber} marked as Paid.`);
        setShowPayModal(false);
        setSelectedBill(null);
        fetchBills();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
    } finally {
      setPaySubmitting(false);
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm('Are you sure you want to delete this bill record?')) return;

    try {
      const res = await billService.deleteBill(billId);
      if (res.success) {
        setSuccessMsg('Bill deleted successfully');
        fetchBills();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill');
    }
  };

  const filteredBills = bills.filter((bill) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      bill.flat?.wing?.toLowerCase().includes(term) ||
      bill.flat?.flatNumber?.toLowerCase().includes(term) ||
      bill.resident?.name?.toLowerCase().includes(term) ||
      bill.billType?.toLowerCase().includes(term) ||
      bill.month?.toLowerCase().includes(term) ||
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
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-3">
              <Shield className="w-3.5 h-3.5" /> Society Financial Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Maintenance Bills & Invoices
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Issue flat maintenance assessments, track society collections, and record verified payments.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create New Bill
          </button>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successMsg}
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            {error}
          </div>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Outstanding Dues
            </p>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            ${summary?.totalPendingAmount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-xs text-amber-600 font-medium mt-1">
            {summary?.pendingCount || 0} pending • {summary?.overdueCount || 0} overdue
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Society Collections
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ${summary?.totalCollectedAmount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-xs text-slate-500 mt-1">
            {summary?.paidCount || 0} settled bills
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Billed Assessments
            </p>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-700 mt-2">
            ${summary?.totalBilledAmount?.toFixed(2) || '0.00'}
          </p>
          <div className="text-xs text-slate-500 mt-1">
            {bills.length} total generated invoices
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Paid', 'Overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All Invoices' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Flat, Resident, Month..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Bills Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-slate-600 text-sm">Loading society bills...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Bills Found</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No bills match your current search criteria.'
              : 'No maintenance bills have been generated yet. Click "Create New Bill" above to issue one.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Flat / Unit</th>
                  <th className="px-5 py-3.5">Resident</th>
                  <th className="px-5 py-3.5">Period & Type</th>
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
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {bill.flat?.wing || 'A'}
                        </div>
                        <div>
                          <div>Wing {bill.flat?.wing || 'A'} - {bill.flat?.flatNumber || '101'}</div>
                          <div className="text-[11px] font-normal text-slate-400">
                            {bill.flat?.type || '2BHK'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800">
                        {bill.resident?.name || 'Resident'}
                      </div>
                      <div className="text-xs text-slate-400">{bill.resident?.phone || bill.resident?.email}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {bill.month} {bill.year}
                      </div>
                      <div className="text-xs text-slate-500">{bill.billType}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 text-base">
                        ${bill.amount.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-600">
                      {new Date(bill.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4">{getStatusBadge(bill.status)}</td>

                    <td className="px-5 py-4 text-xs">
                      {bill.status === 'Paid' ? (
                        <div>
                          <span className="font-semibold text-emerald-700">
                            {bill.paymentMethod || 'Paid'}
                          </span>
                          {bill.paymentReference && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              {bill.paymentReference}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unpaid</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right space-x-2">
                      {bill.status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenPayModal(bill)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                          title="Mark as Paid"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteBill(bill._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete bill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Bill Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Issue Maintenance Bill</h3>
                <p className="text-xs text-slate-500">Create billing assessment for a flat</p>
              </div>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4 text-xs">
              {/* Flat Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Flat / Unit *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Demo flats pre-populate for quick selection
                      setSelectedFlatId(bills[0]?.flat?._id || 'demo');
                    }}
                    className="p-2 rounded-lg border text-left text-xs bg-slate-50 hover:border-purple-500"
                  >
                    <div className="font-semibold text-slate-800">Use Flat from Recent List</div>
                    <div className="text-[11px] text-slate-500">Auto-fill from active flats</div>
                  </button>
                  <input
                    type="text"
                    required
                    placeholder="Enter Flat ID"
                    value={selectedFlatId}
                    onChange={(e) => setSelectedFlatId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Amount & Bill Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="e.g. 250.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill Category</label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Water">Water Charges</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Parking">Parking Space</option>
                    <option value="Clubhouse">Clubhouse</option>
                    <option value="Special Assessment">Special Assessment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Month, Year & Due Date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Month *</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(
                      (m) => (
                        <option key={m} value={m}>{m}</option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description & Note */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly society maintenance charge for Flat 101"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Internal Remarks / Note</label>
                <input
                  type="text"
                  placeholder="Optional internal remark"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  disabled={createSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
                >
                  {createSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark As Paid Modal */}
      {showPayModal && selectedBill && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Bill Settlement</h3>
                <p className="text-xs text-slate-500">
                  Flat {selectedBill.flat?.wing}-{selectedBill.flat?.flatNumber} • ${selectedBill.amount.toFixed(2)}
                </p>
              </div>
            </div>

            <form onSubmit={handleMarkAsPaid} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="UPI / Online">UPI / Online App</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Transaction / Cheque / Receipt Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN998271 or Cheque #102938"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settlement Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Verified by society accountant / admin"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paySubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  {paySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBillsPage;
