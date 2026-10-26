import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  ShieldCheck,
  Users,
  UserCheck,
  Clock3,
  Search,
  ChevronRight,
  LogIn,
  LogOut,
  Car,
  CalendarDays,
  AlertTriangle,
  X,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  QrCode,
  Building,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import visitorService from '../services/visitorService';
import authService from '../services/authService';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const { user } = useAuth();

  // State: Data
  const [visitors, setVisitors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [stats, setStats] = useState({
    expectedToday: 0,
    todayCheckIns: 0,
    currentlyInside: 0,
    completedToday: 0,
  });

  // State: UI & Filters
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'expected', 'inside', 'exited'
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // State: Quick Pass Code Lookup
  const [passCodeInput, setPassCodeInput] = useState('');
  const [verifiedVisitor, setVerifiedVisitor] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // State: Modals
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);
  const [walkinForm, setWalkinForm] = useState({
    visitorName: '',
    phone: '',
    purpose: 'Delivery',
    flatId: '',
    vehicleNumber: '',
    checkInNow: true,
    notes: '',
  });

  // Fetch real database data for gate desk
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const [visitorsRes, flatsRes] = await Promise.all([
        visitorService.getTodayVisitors(),
        authService.getAvailableFlats().catch(() => ({ success: false, flats: [] })),
      ]);

      if (visitorsRes && visitorsRes.success) {
        setVisitors(visitorsRes.data || []);
        if (visitorsRes.stats) {
          setStats({
            expectedToday: visitorsRes.stats.expectedToday ?? 0,
            todayCheckIns: visitorsRes.stats.todayCheckIns ?? visitorsRes.stats.checkInsToday ?? 0,
            currentlyInside: visitorsRes.stats.currentlyInside ?? 0,
            completedToday: visitorsRes.stats.completedToday ?? visitorsRes.stats.checkOutsToday ?? 0,
          });
        }
      }

      if (flatsRes && flatsRes.success) {
        setFlats(flatsRes.flats || []);
        if (!walkinForm.flatId && flatsRes.flats && flatsRes.flats.length > 0) {
          setWalkinForm((prev) => ({ ...prev, flatId: flatsRes.flats[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch security dashboard data:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to load gate security data from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [walkinForm.flatId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Gate Check-In (Updates MongoDB)
  const handleCheckIn = async (visitorId, name) => {
    try {
      setActionLoadingId(visitorId);
      setErrorMsg('');
      const res = await visitorService.checkInVisitor(visitorId);
      if (res.success) {
        setFeedbackMsg(`✓ Visitor ${name || ''} successfully CHECKED IN at gate.`);
        setVerifiedVisitor(null);
        setPassCodeInput('');
        await fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to check in visitor at gate.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Gate Check-Out (Updates MongoDB)
  const handleCheckOut = async (visitorId, name) => {
    try {
      setActionLoadingId(visitorId);
      setErrorMsg('');
      const res = await visitorService.checkOutVisitor(visitorId);
      if (res.success) {
        setFeedbackMsg(`✓ Visitor ${name || ''} successfully CHECKED OUT.`);
        setVerifiedVisitor(null);
        await fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to check out visitor.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Pass Code Verification
  const handleVerifyPassCode = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = passCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      setVerifyLoading(true);
      setVerifyError('');
      setVerifiedVisitor(null);

      const res = await visitorService.verifyPassCode(cleanCode);
      if (res.success && res.data) {
        setVerifiedVisitor(res.data);
      }
    } catch (err) {
      setVerifyError(
        err.response?.data?.message || `No visitor pass found with code "${cleanCode}".`
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle Unexpected Visitor Registration (Safe Gate Walk-In)
  const handleWalkinSubmit = async (e) => {
    e.preventDefault();
    if (!walkinForm.visitorName.trim() || !walkinForm.phone.trim() || !walkinForm.flatId) {
      setErrorMsg('Please specify visitor name, phone number, and destination flat.');
      return;
    }

    try {
      setWalkinSubmitting(true);
      setErrorMsg('');

      const payload = {
        visitorName: walkinForm.visitorName.trim(),
        phone: walkinForm.phone.trim(),
        purpose: walkinForm.purpose,
        flat: walkinForm.flatId,
        expectedDate: new Date().toISOString(),
        vehicleNumber: walkinForm.vehicleNumber.trim().toUpperCase(),
        notes: walkinForm.notes.trim(),
        checkInNow: walkinForm.checkInNow,
        status: walkinForm.checkInNow ? 'Checked In' : 'Pre-Approved',
      };

      const res = await visitorService.createVisitor(payload);

      if (res.success) {
        setFeedbackMsg(
          walkinForm.checkInNow
            ? `✓ Walk-in visitor ${payload.visitorName} registered and CHECKED IN at gate.`
            : `✓ Walk-in visitor ${payload.visitorName} registered as Pre-Approved.`
        );

        setShowWalkinModal(false);
        setWalkinForm({
          visitorName: '',
          phone: '',
          purpose: 'Delivery',
          flatId: flats[0]?._id || '',
          vehicleNumber: '',
          checkInNow: true,
          notes: '',
        });

        await fetchDashboardData();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to register unexpected visitor.'
      );
    } finally {
      setWalkinSubmitting(false);
    }
  };

  // Filter and Search logic
  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return visitors.filter((visitor) => {
      // Status filtering
      if (activeFilter === 'expected' && visitor.status !== 'Pre-Approved') {
        return false;
      }
      if (activeFilter === 'inside' && visitor.status !== 'Checked In') {
        return false;
      }
      if (activeFilter === 'exited' && visitor.status !== 'Checked Out') {
        return false;
      }

      // Text query searching
      if (!query) return true;

      const name = (visitor.visitorName || '').toLowerCase();
      const phone = (visitor.phone || '').toLowerCase();
      const pass = (visitor.passCode || '').toLowerCase();
      const host = (visitor.resident?.name || '').toLowerCase();
      const wing = (visitor.flat?.wing || '').toLowerCase();
      const flatNum = (visitor.flat?.flatNumber || '').toLowerCase();
      const vehicle = (visitor.vehicleNumber || '').toLowerCase();
      const purpose = (visitor.purpose || '').toLowerCase();

      return (
        name.includes(query) ||
        phone.includes(query) ||
        pass.includes(query) ||
        host.includes(query) ||
        wing.includes(query) ||
        flatNum.includes(query) ||
        vehicle.includes(query) ||
        purpose.includes(query)
      );
    });
  }, [visitors, search, activeFilter]);

  // Format timestamp helper
  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="security-dashboard-page">
      {/* =====================================
          INTRO / HEADER
      ===================================== */}
      <section className="security-intro">
        <div>
          <span className="security-badge">
            <ShieldCheck size={15} />
            GATE SECURITY
          </span>

          <h1>Security Dashboard</h1>

          <p>
            Manage society entry, visitors, check-ins, and gate clearance from one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="security-view-button"
            onClick={fetchDashboardData}
            title="Refresh database records"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid var(--sms-border)', borderRadius: 999, background: 'var(--sms-surface)' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <div className="security-live-status">
            <span />
            Gate is active
          </div>
        </div>
      </section>

      {/* =====================================
          NOTIFICATIONS / ALERTS
      ===================================== */}
      {feedbackMsg && (
        <div className="security-alert security-alert-success">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} />
            <span>{feedbackMsg}</span>
          </div>
          <button
            type="button"
            className="security-alert-dismiss"
            onClick={() => setFeedbackMsg('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="security-alert security-alert-error">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            className="security-alert-dismiss"
            onClick={() => setErrorMsg('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =====================================
          STATS (REAL DATABASE METRICS)
      ===================================== */}
      <section className="security-stats">
        {/* TODAY'S EXPECTED VISITORS */}
        <button
          type="button"
          className={`security-stat-card ${activeFilter === 'expected' ? 'active-ring' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'expected' ? 'all' : 'expected')}
        >
          <div className="security-stat-icon purple">
            <CalendarDays size={22} />
          </div>

          <div>
            <span>Today's Expected</span>
            <strong>{stats.expectedToday}</strong>
            <small>Pre-approved by residents</small>
          </div>

          <ChevronRight size={18} />
        </button>

        {/* TODAY'S CHECK-INS */}
        <button
          type="button"
          className="security-stat-card"
          onClick={() => setActiveFilter('all')}
        >
          <div className="security-stat-icon blue">
            <LogIn size={22} />
          </div>

          <div>
            <span>Today's Check-Ins</span>
            <strong>{stats.todayCheckIns}</strong>
            <small>Total arrivals recorded</small>
          </div>

          <ChevronRight size={18} />
        </button>

        {/* CURRENTLY INSIDE */}
        <button
          type="button"
          className={`security-stat-card ${activeFilter === 'inside' ? 'active-ring' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'inside' ? 'all' : 'inside')}
        >
          <div className="security-stat-icon green">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Currently Inside</span>
            <strong>{stats.currentlyInside}</strong>
            <small>Active on premise</small>
          </div>

          <ChevronRight size={18} />
        </button>

        {/* TODAY'S CHECK-OUTS */}
        <button
          type="button"
          className={`security-stat-card ${activeFilter === 'exited' ? 'active-ring' : ''}`}
          onClick={() => setActiveFilter(activeFilter === 'exited' ? 'all' : 'exited')}
        >
          <div className="security-stat-icon amber">
            <LogOut size={22} />
          </div>

          <div>
            <span>Today's Check-Outs</span>
            <strong>{stats.completedToday}</strong>
            <small>Completed gate departures</small>
          </div>

          <ChevronRight size={18} />
        </button>
      </section>

      {/* =====================================
          GATE OPERATIONS & UNEXPECTED WORKFLOW
      ===================================== */}
      <section className="security-section">
        <div className="security-section-heading">
          <div>
            <h2>Gate Operations</h2>
            <p>Direct actions for unexpected arrivals and instant verification.</p>
          </div>
        </div>

        <div className="security-actions">
          {/* REGISTER UNEXPECTED VISITOR */}
          <button
            type="button"
            className="security-action-card"
            onClick={() => setShowWalkinModal(true)}
          >
            <div className="security-action-icon blue">
              <Plus size={21} />
            </div>

            <div>
              <strong>Register Walk-in Visitor</strong>
              <span>Workflow for unexpected guest or courier.</span>
            </div>

            <ChevronRight size={18} />
          </button>

          {/* VERIFY VISITOR */}
          <button
            type="button"
            className="security-action-card"
            onClick={() => {
              const el = document.getElementById('passcode-search-box');
              if (el) el.focus();
            }}
          >
            <div className="security-action-icon purple">
              <QrCode size={21} />
            </div>

            <div>
              <strong>Verify Pass Code</strong>
              <span>Fast lookup by resident pass (e.g. VIS-1234).</span>
            </div>

            <ChevronRight size={18} />
          </button>

          {/* PRE-APPROVED QUICK FILTER */}
          <button
            type="button"
            className="security-action-card"
            onClick={() => setActiveFilter('expected')}
          >
            <div className="security-action-icon green">
              <Users size={21} />
            </div>

            <div>
              <strong>Pre-Approved List</strong>
              <span>Review visitors expecting entry today.</span>
            </div>

            <ChevronRight size={18} />
          </button>

          {/* EMERGENCY PROCEDURES */}
          <button
            type="button"
            className="security-action-card"
            onClick={() => {
              alert('Emergency Protocols:\n1. Main Gate Emergency: Dial Ext 911 / 100\n2. Society Control Desk: Ext 101\n3. Facility Manager: +1-555-0100');
            }}
          >
            <div className="security-action-icon red">
              <AlertTriangle size={21} />
            </div>

            <div>
              <strong>Emergency Contacts</strong>
              <span>Quick access to emergency protocols.</span>
            </div>

            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* =====================================
          QUICK PASS CODE VERIFICATION BAR
      ===================================== */}
      <section className="security-verify-section">
        <div className="security-verify-header">
          <div className="security-stat-icon purple" style={{ width: 34, height: 34 }}>
            <QrCode size={18} />
          </div>
          <div>
            <h3>Quick Pass Code Verification & Check-In</h3>
            <p>Enter the 6-8 digit pass code issued by the resident (e.g. VIS-4821)</p>
          </div>
        </div>

        <form onSubmit={handleVerifyPassCode} className="security-verify-form">
          <div className="security-verify-input-wrap">
            <input
              id="passcode-search-box"
              type="text"
              className="security-verify-input"
              placeholder="ENTER PASS CODE (e.g. VIS-4821)..."
              value={passCodeInput}
              onChange={(e) => setPassCodeInput(e.target.value.toUpperCase())}
            />
          </div>

          <button
            type="submit"
            disabled={verifyLoading || !passCodeInput.trim()}
            className="security-verify-btn"
          >
            {verifyLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Verify Pass
          </button>

          {verifiedVisitor && (
            <button
              type="button"
              className="security-btn-secondary"
              onClick={() => {
                setVerifiedVisitor(null);
                setPassCodeInput('');
              }}
            >
              Clear
            </button>
          )}
        </form>

        {verifyError && (
          <div style={{ marginTop: 10, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={16} />
            <span>{verifyError}</span>
          </div>
        )}

        {/* VERIFIED PASS DETAILS CARD */}
        {verifiedVisitor && (
          <div className="security-verify-result">
            <div className="security-verify-details">
              <div>
                <span className="security-verify-badge-code">
                  {verifiedVisitor.passCode}
                </span>
                <strong style={{ fontSize: 15, marginRight: 8 }}>
                  {verifiedVisitor.visitorName}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--sms-text-secondary)' }}>
                  ({verifiedVisitor.purpose})
                </span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--sms-text-secondary)', display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
                <span>
                  Host: <strong>{verifiedVisitor.resident?.name || 'Resident'}</strong>
                </span>
                <span>
                  Flat: <strong>Wing {verifiedVisitor.flat?.wing || 'A'} - Flat {verifiedVisitor.flat?.flatNumber || '101'}</strong>
                </span>
                {verifiedVisitor.vehicleNumber && (
                  <span>
                    Vehicle: <strong style={{ fontFamily: 'monospace' }}>{verifiedVisitor.vehicleNumber}</strong>
                  </span>
                )}
                <span>
                  Status: <strong>{verifiedVisitor.status}</strong>
                </span>
              </div>
            </div>

            <div>
              {verifiedVisitor.status === 'Pre-Approved' && (
                <button
                  type="button"
                  className="btn-gate-checkin"
                  disabled={actionLoadingId === verifiedVisitor._id}
                  onClick={() => handleCheckIn(verifiedVisitor._id, verifiedVisitor.visitorName)}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  {actionLoadingId === verifiedVisitor._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  Grant Check-In
                </button>
              )}

              {verifiedVisitor.status === 'Checked In' && (
                <button
                  type="button"
                  className="btn-gate-checkout"
                  disabled={actionLoadingId === verifiedVisitor._id}
                  onClick={() => handleCheckOut(verifiedVisitor._id, verifiedVisitor.visitorName)}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  {actionLoadingId === verifiedVisitor._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogOut size={16} />
                  )}
                  Check Out Visitor
                </button>
              )}

              {verifiedVisitor.status === 'Checked Out' && (
                <span className="status-pill checked-out">
                  Checked Out
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================
          MAIN VISITOR SECTION (GRID)
      ===================================== */}
      <section className="security-content-grid">
        {/* VISITOR ACTIVITY & TABLE */}
        <section className="security-panel">
          <div className="security-panel-header">
            <div>
              <h2>Visitor Activity & Gate Registry</h2>
              <p>Real-time records from society database.</p>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--sms-text-secondary)' }}>
              Showing {filteredVisitors.length} of {visitors.length} visitors
            </div>
          </div>

          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="security-toolbar">
            <label className="security-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search visitor, host resident, flat, vehicle, passcode..."
              />
            </label>

            <div className="security-filters">
              <button
                type="button"
                className={activeFilter === 'all' ? 'active' : ''}
                onClick={() => setActiveFilter('all')}
              >
                All ({visitors.length})
              </button>
              <button
                type="button"
                className={activeFilter === 'expected' ? 'active' : ''}
                onClick={() => setActiveFilter('expected')}
              >
                Expected ({stats.expectedToday})
              </button>
              <button
                type="button"
                className={activeFilter === 'inside' ? 'active' : ''}
                onClick={() => setActiveFilter('inside')}
              >
                Inside ({stats.currentlyInside})
              </button>
              <button
                type="button"
                className={activeFilter === 'exited' ? 'active' : ''}
                onClick={() => setActiveFilter('exited')}
              >
                Exited ({stats.completedToday})
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="security-empty" style={{ minHeight: 220 }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#2563eb' }} />
              <h3 style={{ marginTop: 12 }}>Loading gate records...</h3>
              <p>Connecting to database and fetching today's visitor data.</p>
            </div>
          ) : filteredVisitors.length === 0 ? (
            /* EMPTY STATE */
            <div className="security-empty">
              <div className="security-empty-icon">
                <Users size={25} />
              </div>

              <h3>No visitors match active filter</h3>

              <p>
                {search
                  ? `No visitors found matching "${search}". Try clearing search.`
                  : activeFilter === 'expected'
                  ? 'No pre-approved expected visitors pending for today.'
                  : activeFilter === 'inside'
                  ? 'No visitors currently checked in inside the premises.'
                  : activeFilter === 'exited'
                  ? 'No visitors recorded as checked out today yet.'
                  : 'No visitor activity recorded for today. Register unexpected arrivals using the button below.'}
              </p>

              <button
                type="button"
                onClick={() => setShowWalkinModal(true)}
              >
                <Plus size={16} />
                Register Walk-in Entry
              </button>
            </div>
          ) : (
            /* REAL VISITOR TABLE */
            <div className="security-table-wrapper">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Visitor & Pass</th>
                    <th>Host Resident</th>
                    <th>Destination Flat</th>
                    <th>Purpose</th>
                    <th>Vehicle</th>
                    <th>Status</th>
                    <th>Entry / Exit Times</th>
                    <th style={{ textAlign: 'right' }}>Gate Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((v) => (
                    <tr key={v._id}>
                      {/* VISITOR NAME & PHONE */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="security-visitor-avatar">
                            {v.visitorName ? v.visitorName.charAt(0).toUpperCase() : 'V'}
                          </div>
                          <div>
                            <strong style={{ fontSize: 13, display: 'block' }}>
                              {v.visitorName}
                            </strong>
                            <span style={{ fontSize: 11, color: 'var(--sms-text-secondary)', display: 'block' }}>
                              {v.phone}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--sms-surface-soft)', border: '1px solid var(--sms-border)', marginTop: 2, display: 'inline-block' }}>
                              {v.passCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* HOST RESIDENT */}
                      <td>
                        <strong style={{ fontSize: 13 }}>
                          {v.resident?.name || 'Resident'}
                        </strong>
                        {v.resident?.phone && (
                          <span style={{ fontSize: 11, color: 'var(--sms-text-secondary)', display: 'block' }}>
                            {v.resident.phone}
                          </span>
                        )}
                      </td>

                      {/* FLAT NUMBER */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 6, background: 'var(--sms-surface-soft)', fontWeight: 600, fontSize: 12 }}>
                          <Building size={13} style={{ color: '#2563eb' }} />
                          <span>
                            {v.flat ? `Wing ${v.flat.wing} - ${v.flat.flatNumber}` : 'General'}
                          </span>
                        </div>
                      </td>

                      {/* PURPOSE */}
                      <td>
                        <span style={{ fontSize: 12 }}>
                          {v.purpose}
                        </span>
                      </td>

                      {/* VEHICLE NUMBER */}
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
                          {v.vehicleNumber || '-'}
                        </span>
                      </td>

                      {/* STATUS BADGE */}
                      <td>
                        {v.status === 'Pre-Approved' && (
                          <span className="status-pill pre-approved">
                            <Clock3 size={12} />
                            Pre-Approved
                          </span>
                        )}
                        {v.status === 'Checked In' && (
                          <span className="status-pill checked-in">
                            <ShieldCheck size={12} />
                            Inside
                          </span>
                        )}
                        {v.status === 'Checked Out' && (
                          <span className="status-pill checked-out">
                            <CheckCircle2 size={12} />
                            Checked Out
                          </span>
                        )}
                        {v.status === 'Cancelled' && (
                          <span className="status-pill cancelled">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* ENTRY / EXIT TIMESTAMPS */}
                      <td>
                        <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {v.checkInTime ? (
                            <span style={{ color: '#059669', fontWeight: 600 }}>
                              In: {formatTime(v.checkInTime)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--sms-text-secondary)' }}>
                              Exp: {v.expectedTime || 'Today'}
                            </span>
                          )}

                          {v.checkOutTime && (
                            <span style={{ color: '#475569' }}>
                              Out: {formatTime(v.checkOutTime)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACTION BUTTONS */}
                      <td style={{ textAlign: 'right' }}>
                        {v.status === 'Pre-Approved' && (
                          <button
                            type="button"
                            className="btn-gate-checkin"
                            disabled={actionLoadingId === v._id}
                            onClick={() => handleCheckIn(v._id, v.visitorName)}
                          >
                            {actionLoadingId === v._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <LogIn size={13} />
                            )}
                            Check In
                          </button>
                        )}

                        {v.status === 'Checked In' && (
                          <button
                            type="button"
                            className="btn-gate-checkout"
                            disabled={actionLoadingId === v._id}
                            onClick={() => handleCheckOut(v._id, v.visitorName)}
                          >
                            {actionLoadingId === v._id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <LogOut size={13} />
                            )}
                            Check Out
                          </button>
                        )}

                        {v.status === 'Checked Out' && (
                          <span style={{ fontSize: 12, color: 'var(--sms-text-secondary)' }}>
                            Completed
                          </span>
                        )}

                        {v.status === 'Cancelled' && (
                          <span style={{ fontSize: 12, color: '#dc2626' }}>
                            Cancelled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* SIDE STATUS & INFO PANEL */}
        <aside className="security-side-panel">
          <div className="security-panel-header">
            <div>
              <h2>Gate Checkpoint</h2>
              <p>Security desk status and summary.</p>
            </div>
          </div>

          <div className="security-status-box">
            <span className="status-dot" />
            <div>
              <strong>Main Gate 1 Active</strong>
              <span>Officer on duty: {user?.name || 'Security Guard'}</span>
            </div>
          </div>

          <div style={{ padding: '0 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sms-surface-soft)', borderRadius: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--sms-text-secondary)' }}>Flats Registered</span>
              <strong>{flats.length}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sms-surface-soft)', borderRadius: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--sms-text-secondary)' }}>Currently on Premises</span>
              <strong style={{ color: '#059669' }}>{stats.currentlyInside}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--sms-surface-soft)', borderRadius: 10, fontSize: 13 }}>
              <span style={{ color: 'var(--sms-text-secondary)' }}>Awaiting Check-in</span>
              <strong style={{ color: '#2563eb' }}>{stats.expectedToday}</strong>
            </div>
          </div>

          <div className="security-info-box">
            <Info size={18} />
            <p>
              Always check visitor ID or pass code against resident authorization before granting vehicle or premise entry.
            </p>
          </div>
        </aside>
      </section>

      {/* =====================================
          UNEXPECTED VISITOR REGISTRATION MODAL
      ===================================== */}
      {showWalkinModal && (
        <div
          className="security-modal-overlay"
          onClick={() => setShowWalkinModal(false)}
        >
          <section
            className="security-modal"
            style={{ width: 'min(540px, 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="security-modal-close"
              onClick={() => setShowWalkinModal(false)}
            >
              <X size={20} />
            </button>

            <div className="security-modal-icon">
              <Plus size={24} />
            </div>

            <span className="security-modal-label">GATE SECURITY CHECKPOINT</span>
            <h2>Register Walk-in Visitor</h2>
            <p>
              Safe verification and check-in workflow for unscheduled visitors, deliveries, cabs, or service technicians.
            </p>

            <form onSubmit={handleWalkinSubmit} style={{ marginTop: 18 }}>
              {/* VISITOR NAME */}
              <div className="security-form-group">
                <label className="security-form-label">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  className="security-form-input"
                  placeholder="e.g. John Doe"
                  value={walkinForm.visitorName}
                  onChange={(e) =>
                    setWalkinForm({ ...walkinForm, visitorName: e.target.value })
                  }
                />
              </div>

              {/* PHONE NUMBER & PURPOSE */}
              <div className="security-form-row">
                <div className="security-form-group">
                  <label className="security-form-label">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="security-form-input"
                    placeholder="e.g. +1-555-0199"
                    value={walkinForm.phone}
                    onChange={(e) =>
                      setWalkinForm({ ...walkinForm, phone: e.target.value })
                    }
                  />
                </div>

                <div className="security-form-group">
                  <label className="security-form-label">Visit Purpose *</label>
                  <select
                    className="security-form-select"
                    value={walkinForm.purpose}
                    onChange={(e) =>
                      setWalkinForm({ ...walkinForm, purpose: e.target.value })
                    }
                  >
                    <option value="Delivery">Delivery / Courier</option>
                    <option value="Guest / Family">Guest / Family</option>
                    <option value="Cab / Taxi">Cab / Taxi</option>
                    <option value="Home Service / Repair">Home Service / Repair</option>
                    <option value="Official / Business">Official / Business</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* DESTINATION FLAT */}
              <div className="security-form-group">
                <label className="security-form-label">Destination Flat (Resident Host) *</label>
                <select
                  required
                  className="security-form-select"
                  value={walkinForm.flatId}
                  onChange={(e) =>
                    setWalkinForm({ ...walkinForm, flatId: e.target.value })
                  }
                >
                  <option value="" disabled>-- Select Flat --</option>
                  {flats.map((flat) => {
                    const residentLabel = flat.owner?.name
                      ? ` (Host: ${flat.owner.name})`
                      : ' (Host: Resident)';
                    return (
                      <option key={flat._id} value={flat._id}>
                        Wing {flat.wing} - Flat {flat.flatNumber}{residentLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* VEHICLE NUMBER & NOTES */}
              <div className="security-form-row">
                <div className="security-form-group">
                  <label className="security-form-label">Vehicle License Plate (Optional)</label>
                  <input
                    type="text"
                    className="security-form-input"
                    placeholder="e.g. MH-12-AB-1234"
                    value={walkinForm.vehicleNumber}
                    onChange={(e) =>
                      setWalkinForm({
                        ...walkinForm,
                        vehicleNumber: e.target.value.toUpperCase(),
                      })
                    }
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                </div>

                <div className="security-form-group">
                  <label className="security-form-label">Notes (Optional)</label>
                  <input
                    type="text"
                    className="security-form-input"
                    placeholder="e.g. Amazon delivery package"
                    value={walkinForm.notes}
                    onChange={(e) =>
                      setWalkinForm({ ...walkinForm, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* IMMEDIATE CHECK-IN TOGGLE */}
              <label className="security-checkbox-label">
                <input
                  type="checkbox"
                  checked={walkinForm.checkInNow}
                  onChange={(e) =>
                    setWalkinForm({ ...walkinForm, checkInNow: e.target.checked })
                  }
                  style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                />
                <span style={{ fontWeight: 600 }}>
                  Check In immediately upon registration (visitor physically present at gate)
                </span>
              </label>

              {/* MODAL FOOTER */}
              <div className="security-modal-footer">
                <button
                  type="button"
                  className="security-btn-secondary"
                  onClick={() => setShowWalkinModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walkinSubmitting}
                  className="security-btn-primary"
                >
                  {walkinSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  {walkinForm.checkInNow ? 'Register & Check In' : 'Register Pre-Approval'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
