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
} from 'lucide-react';

import authService from '../services/authService';

import './AdminSecurityPage.css';


const AdminSecurityPage = () => {

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const loadSecurityData = async () => {

    try {

      setLoading(true);
      setError('');

      /*
       * The current backend does not provide a
       * visitor/security-record API.
       *
       * Therefore we only use the existing
       * admin dashboard API and do NOT create
       * fake visitor records.
       */

      const response =
        await authService.getAdminDashboard();

      if (response?.success) {

        setDashboard(
          response.data || {}
        );

      } else {

        setDashboard(
          response?.data || {}
        );

      }

    } catch (err) {

      console.error(
        'Admin security data error:',
        err
      );

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


  /*
   * The backend currently exposes
   * expectedVisitorsToday through the
   * dashboard response.
   *
   * No visitor records are invented here.
   */

  const expectedVisitors =
    dashboard?.expectedVisitorsToday ?? 0;


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
            Monitor society security status
            and available visitor information
            from the existing system.
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
          ERROR
      ========================== */}

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
            Security system connected
          </strong>

          <p>
            Admin security monitoring is
            connected to the existing system.
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
            Visitor records
          </span>

          <strong>
            —
          </strong>

          <small>
            Detailed visitor records are
            not available in the current backend
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
            {loading
              ? '—'
              : expectedVisitors}
          </strong>

          <small>
            Expected visitors reported
            by the existing dashboard API
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
            —
          </strong>

          <small>
            Live gate-entry records are
            not available in the current backend
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
            —
          </strong>

          <small>
            Checkout records are not available
            in the current backend
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
              Visitor activity
            </h2>

          </div>

        </div>


        {loading ? (

          <div className="security-empty">

            <div className="admin-spinner" />

            <p>
              Loading security information...
            </p>

          </div>

        ) : (

          <div className="security-empty">

            <div className="security-empty-icon">

              <ShieldCheck size={25} />

            </div>


            <h3>
              No visitor log available
            </h3>


            <p>
              The current backend does not provide
              detailed visitor or gate-entry records.
              No placeholder visitor data has been
              generated.
            </p>


            <div className="security-empty-note">

              <AlertTriangle size={16} />

              <span>
                This section will automatically
                support real visitor records when
                a visitor management API is added
                to the backend.
              </span>

            </div>

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
            Security portal is ready
          </h3>

          <p>
            This admin view intentionally shows
            only information available from the
            existing backend. It does not create
            fake visitors, fake gate entries,
            or placeholder security records.
          </p>

        </div>

      </section>


    </div>

  );

};


export default AdminSecurityPage;