import React, {
  useEffect,
  useState,
} from 'react';

import {
  ShieldCheck,
  Users,
  CalendarDays,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Search,
  Check,
  LogIn,
  LogOut,
  Car,
} from 'lucide-react';

import authService from '../services/authService';
import visitorService from '../services/visitorService';

import './AdminSecurityPage.css';


const AdminSecurityPage = () => {

  const [dashboard, setDashboard] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [visitorStats, setVisitorStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');


  const loadSecurityData = async () => {

    try {
      setLoading(true);
      setError('');

      const [dashRes, visRes] = await Promise.allSettled([
        authService.getAdminDashboard(),
        visitorService.getTodayVisitors(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.success) {
        setDashboard(dashRes.value.data || {});
      }

      if (visRes.status === 'fulfilled' && visRes.value?.success) {
        setVisitors(visRes.value.data || []);
        setVisitorStats(visRes.value.stats || {});
      } else if (visRes.status === 'fulfilled' && Array.isArray(visRes.value?.data)) {
        setVisitors(visRes.value.data);
      }

    } catch (err) {
      console.error('Admin security data error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load security information.'
      );
    } finally {
      setLoading(false);
    }

  };


  useEffect(() => {
    loadSecurityData();
  }, []);


  const handleCheckIn = async (id) => {
    try {
      setActionLoading(id);
      setError('');
      const res = await visitorService.checkInVisitor(id);
      if (res?.success) {
        setSuccessMessage('Visitor successfully checked in.');
        setTimeout(() => setSuccessMessage(''), 4000);
        await loadSecurityData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check in visitor.');
    } finally {
      setActionLoading(null);
    }
  };


  const handleCheckOut = async (id) => {
    try {
      setActionLoading(id);
      setError('');
      const res = await visitorService.checkOutVisitor(id);
      if (res?.success) {
        setSuccessMessage('Visitor successfully checked out.');
        setTimeout(() => setSuccessMessage(''), 4000);
        await loadSecurityData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to check out visitor.');
    } finally {
      setActionLoading(null);
    }
  };


  const expectedVisitors =
    visitorStats.expectedToday ??
    dashboard?.expectedVisitorsToday ??
    visitors.filter((v) => v.status === 'Pre-Approved').length;

  const insideVisitors =
    visitorStats.currentlyInside ??
    visitors.filter((v) => v.status === 'Checked In').length;

  const completedVisitors =
    visitorStats.completedToday ??
    visitors.filter((v) => v.status === 'Checked Out').length;

  const totalVisitorsCount = visitors.length;


  const filteredVisitors = visitors.filter((v) => {
    if (filterStatus !== 'ALL' && v.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = v.visitorName?.toLowerCase() || '';
      const phone = v.phone?.toLowerCase() || '';
      const pass = v.passCode?.toLowerCase() || '';
      const flatStr = v.flat ? `${v.flat.wing}-${v.flat.flatNumber}`.toLowerCase() : '';
      return name.includes(q) || phone.includes(q) || pass.includes(q) || flatStr.includes(q);
    }
    return true;
  });


  return (

    <div className="admin-security-page">


      {/* =========================
          HEADER
      ========================== */}

      <div className="admin-subpage-header">

        <div>

          <span className="admin-subpage-kicker">

            <ShieldCheck size={14} />

            SECURITY CONTROL

          </span>


          <h1>
            Gate Security
          </h1>


          <p>
            Monitor society gate activity, review real visitor logs,
            and perform security checkpoint actions.
          </p>

        </div>


        <button
          className="admin-outline-button"
          onClick={loadSecurityData}
          disabled={loading}
        >

          <RefreshCw
            size={16}
            className={
              loading
                ? 'security-refresh-spin'
                : ''
            }
          />

          {loading
            ? 'Refreshing...'
            : 'Refresh'}

        </button>

      </div>


      {/* =========================
          SUCCESS / ERROR ALERTS
      ========================== */}

      {successMessage && (
        <div
          style={{
            marginBottom: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '10px',
            color: '#16a34a',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: '13px',
          }}
        >
          <Check size={17} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (

        <div className="security-error">

          <AlertTriangle size={17} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =========================
          SECURITY STATUS
      ========================== */}

      <section className="security-status-banner">

        <div className="security-status-icon">

          <ShieldCheck size={25} />

        </div>


        <div>

          <span>
            GATE STATUS
          </span>

          <strong>
            Security checkpoint operational
          </strong>

          <p>
            Connected to real visitor checkpoint records and database passes.
          </p>

        </div>


        <span className="security-online">

          <i />

          Online

        </span>

      </section>


      {/* =========================
          SECURITY STATS
      ========================== */}

      <div className="security-stat-grid">


        {/* TOTAL SECURITY RECORDS */}

        <div className="security-stat-card">

          <div className="security-stat-icon">

            <Users size={20} />

          </div>

          <span>
            Today's visits
          </span>

          <strong>
            {loading ? '—' : totalVisitorsCount}
          </strong>

          <small>
            Total visitors logged today
          </small>

        </div>


        {/* EXPECTED VISITORS */}

        <div className="security-stat-card">

          <div className="security-stat-icon">

            <CalendarDays size={20} />

          </div>

          <span>
            Expected visitors
          </span>

          <strong>
            {loading ? '—' : expectedVisitors}
          </strong>

          <small>
            Pre-approved passes for today
          </small>

        </div>


        {/* PEOPLE INSIDE */}

        <div className="security-stat-card">

          <div className="security-stat-icon">

            <UserCheck size={20} />

          </div>

          <span>
            Currently inside
          </span>

          <strong>
            {loading ? '—' : insideVisitors}
          </strong>

          <small>
            Checked in at gate checkpoint
          </small>

        </div>


        {/* COMPLETED VISITS */}

        <div className="security-stat-card">

          <div className="security-stat-icon">

            <CheckCircle2 size={20} />

          </div>

          <span>
            Completed visits
          </span>

          <strong>
            {loading ? '—' : completedVisitors}
          </strong>

          <small>
            Checked out today
          </small>

        </div>

      </div>


      {/* =========================
          GATE LOG
      ========================== */}

      <section className="security-record-card">


        <div className="security-record-header">

          <div>

            <span>
              GATE LOG
            </span>

            <h2>
              Visitor activity ({filteredVisitors.length})
            </h2>

          </div>


          <div className="security-header-actions">

            <div className="security-filter-pills">

              <button
                type="button"
                className={filterStatus === 'ALL' ? 'active' : ''}
                onClick={() => setFilterStatus('ALL')}
              >
                All ({visitors.length})
              </button>

              <button
                type="button"
                className={filterStatus === 'Pre-Approved' ? 'active' : ''}
                onClick={() => setFilterStatus('Pre-Approved')}
              >
                Expected ({expectedVisitors})
              </button>

              <button
                type="button"
                className={filterStatus === 'Checked In' ? 'active' : ''}
                onClick={() => setFilterStatus('Checked In')}
              >
                Inside ({insideVisitors})
              </button>

              <button
                type="button"
                className={filterStatus === 'Checked Out' ? 'active' : ''}
                onClick={() => setFilterStatus('Checked Out')}
              >
                Completed ({completedVisitors})
              </button>

            </div>


            <div className="security-search">

              <Search size={15} />

              <input
                type="text"
                placeholder="Search visitor, phone, flat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

            </div>

          </div>

        </div>


        {loading ? (

          <div className="security-empty">

            <div className="admin-spinner" />

            <p>
              Loading visitor records...
            </p>

          </div>

        ) : filteredVisitors.length === 0 ? (

          <div className="security-empty">

            <div className="security-empty-icon">

              <ShieldCheck size={25} />

            </div>


            <h3>
              No visitor records found
            </h3>


            <p>
              {visitors.length === 0
                ? 'No visitors have been registered for today yet.'
                : 'No visitor matches the selected filter or search query.'}
            </p>

          </div>

        ) : (

          <div className="security-record-list">

            {filteredVisitors.map((item) => {

              const isActionRunning = actionLoading === item._id;

              return (

                <div
                  key={item._id}
                  className="security-record-row"
                  style={{ cursor: 'default' }}
                >

                  <div className="visitor-avatar">
                    {item.visitorName ? item.visitorName.charAt(0).toUpperCase() : 'V'}
                  </div>


                  <div className="visitor-main">

                    <strong>
                      {item.visitorName}
                    </strong>

                    <span>
                      {item.phone} · Pass: <b>{item.passCode}</b>
                    </span>

                  </div>


                  <div className="visitor-resident">

                    <span>
                      {item.flat ? `Flat ${item.flat.wing}-${item.flat.flatNumber}` : 'Flat N/A'}
                    </span>

                    <small>
                      {item.resident?.name ? `Host: ${item.resident.name}` : item.purpose}
                    </small>

                  </div>


                  <div className="visitor-vehicle">

                    {item.vehicleNumber ? (
                      <>
                        <Car size={14} />
                        <span>{item.vehicleNumber}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--admin-faint)' }}>{item.purpose || 'No vehicle'}</span>
                    )}

                  </div>


                  <div>

                    <span
                      className={`visitor-status ${item.status ? item.status.toLowerCase().replace(' ', '-') : 'pre-approved'}`}
                    >
                      {item.status}
                    </span>

                  </div>


                  <div>

                    {item.status === 'Pre-Approved' && (
                      <button
                        type="button"
                        className="admin-primary-button"
                        style={{
                          height: '32px',
                          minHeight: '32px',
                          padding: '0 12px',
                          fontSize: '11px',
                          gap: '4px',
                        }}
                        disabled={isActionRunning}
                        onClick={() => handleCheckIn(item._id)}
                      >
                        <LogIn size={13} />
                        {isActionRunning ? '...' : 'Check In'}
                      </button>
                    )}

                    {item.status === 'Checked In' && (
                      <button
                        type="button"
                        className="admin-outline-button"
                        style={{
                          height: '32px',
                          minHeight: '32px',
                          padding: '0 12px',
                          fontSize: '11px',
                          color: '#ef4444',
                          borderColor: '#ef4444',
                          gap: '4px',
                        }}
                        disabled={isActionRunning}
                        onClick={() => handleCheckOut(item._id)}
                      >
                        <LogOut size={13} />
                        {isActionRunning ? '...' : 'Check Out'}
                      </button>
                    )}

                    {item.status === 'Checked Out' && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--admin-muted)',
                        }}
                      >
                        Departed
                      </span>
                    )}

                    {item.status === 'Cancelled' && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#ef4444',
                        }}
                      >
                        Cancelled
                      </span>
                    )}

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </section>


      {/* =========================
          SECURITY INFORMATION
      ========================== */}

      <section className="security-info-panel">

        <div className="security-info-icon">

          <ShieldCheck size={22} />

        </div>


        <div>

          <span>
            ADMIN SECURITY MONITORING
          </span>

          <h3>
            Security portal active
          </h3>

          <p>
            Gate entry passes, check-ins, and security records are stored
            directly in MongoDB and kept in sync between Administrators and the Security Guard desk.
          </p>

        </div>

      </section>


    </div>

  );

};


export default AdminSecurityPage;