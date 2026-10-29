import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Home,
  AlertCircle,
  CreditCard,
  Bell,
  Users,
  Phone,
  Mail,
  Building,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  IndianRupee,
  UserRound,
  Info,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import authService from '../services/authService';

import './ResidentDashboard.css';


const ResidentDashboard = () => {

  const {
    user,
  } = useAuth();

  const navigate =
    useNavigate();


  const [
    dashboardData,
    setDashboardData,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState('');


  const [
    activeDetail,
    setActiveDetail,
  ] = useState(null);


  useEffect(() => {

    const fetchDashboard =
      async () => {

        try {

          setError('');

          const res =
            await authService
              .getResidentDashboard();


          if (res.success) {

            setDashboardData(
              res.data
            );

          }

        } catch (err) {

          console.error(
            'Resident dashboard error:',
            err
          );

          setError(
            err.response?.data?.message ||
            'Failed to load resident dashboard data'
          );

        } finally {

          setLoading(false);

        }

      };


    fetchDashboard();

  }, []);


  if (loading) {

    return (

      <div className="resident-dashboard-loading">

        <Loader2
          size={32}
          className="resident-loading-icon"
        />

        <p>
          Loading resident dashboard...
        </p>

      </div>

    );

  }


  const flatInfo =
    dashboardData?.flat ||
    user?.flat;


  const stats =
    dashboardData?.stats || {
      activeComplaints: 0,
      resolvedComplaints: 0,
      totalNotices: 0,
      pendingBills: 0,
      totalPendingAmount: 0,
      expectedVisitorsToday: 0,
    };


  /*
   * DETAIL VIEW
   */

  if (activeDetail) {

    return (

      <div className="resident-detail-page">

        <button
          type="button"
          className="resident-back-button"
          onClick={() =>
            setActiveDetail(null)
          }
        >

          <ArrowLeft size={18} />

          Back to My Home

        </button>


        <div className="resident-detail-header">

          <div className="resident-detail-icon">

            {activeDetail ===
              'maintenance' ? (

              <CreditCard
                size={25}
              />

            ) : (

              <Users
                size={25}
              />

            )}

          </div>


          <div>

            <span>
              RESIDENT SERVICE
            </span>

            <h1>

              {activeDetail ===
              'maintenance'
                ? 'Maintenance & Dues'
                : 'Visitor Pre-Approval'}

            </h1>

            <p>

              {activeDetail ===
              'maintenance'
                ? 'View your current maintenance payment status.'
                : 'View expected visitor information for your residence.'}

            </p>

          </div>

        </div>


        {activeDetail ===
          'maintenance' && (

          <div className="resident-detail-grid">

            <div className="resident-detail-card">

              <div className="resident-detail-card-icon green">

                <IndianRupee
                  size={21}
                />

              </div>


              <div>

                <span>
                  PENDING BILLS
                </span>

                <strong>
                  {stats.pendingBills || 0}
                </strong>

                <p>
                  Current bills returned by
                  your resident account.
                </p>

              </div>

            </div>


            <div className="resident-detail-card">

              <div className="resident-detail-card-icon blue">

                <CheckCircle2
                  size={21}
                />

              </div>


              <div>

                <span>
                  PAYMENT STATUS
                </span>

                <strong>

                  {stats.pendingBills > 0
                    ? 'Payment Due'
                    : 'All Dues Cleared'}

                </strong>

                <p>

                  {stats.pendingBills > 0
                    ? 'Please check your society billing information.'
                    : 'No pending maintenance bills are currently reported.'}

                </p>

              </div>

            </div>


            <div className="resident-detail-information">

              <Info size={19} />

              <div>

                <strong>
                  Billing information
                </strong>

                <p>
                  This section displays the
                  maintenance information available
                  from your resident account. No
                  artificial bill amount is displayed.
                </p>

                <Link
                  to="/resident/bills"
                  className="resident-detail-link"
                >
                  View all bills
                  <ArrowRight size={15} />
                </Link>

              </div>

            </div>

          </div>

        )}


        {activeDetail ===
          'visitors' && (

          <div className="resident-detail-grid">

            <div className="resident-detail-card">

              <div className="resident-detail-card-icon teal">

                <CalendarDays
                  size={21}
                />

              </div>


              <div>

                <span>
                  EXPECTED TODAY
                </span>

                <strong>
                  {stats.expectedVisitorsToday || 0}
                </strong>

                <p>
                  Expected visitors currently
                  reported by your resident account.
                </p>

              </div>

            </div>


            <div className="resident-detail-card">

              <div className="resident-detail-card-icon blue">

                <UserRound
                  size={21}
                />

              </div>


              <div>

                <span>
                  GATE STATUS
                </span>

                <strong>
                  Pre-Approval
                </strong>

                <p>
                  Approved expected visitors can
                  be checked by the security team.
                </p>

              </div>

            </div>


            <div className="resident-detail-information">

              <Info size={19} />

              <div>

                <strong>
                  Visitor information
                </strong>

                <p>

                  {stats.expectedVisitorsToday > 0
                    ? `There are ${stats.expectedVisitorsToday} expected visitor(s) reported for today.`
                    : 'There are currently no expected visitors reported for today.'}

                </p>

                <Link
                  to="/resident/visitors"
                  className="resident-detail-link"
                >
                  Manage visitors
                  <ArrowRight size={15} />
                </Link>

              </div>

            </div>

          </div>

        )}


      </div>

    );

  }


  return (

    <div className="resident-dashboard">


      {error && (

        <div className="resident-dashboard-error">

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* WELCOME */}

      <div className="resident-welcome-banner">


        <div className="resident-welcome-content">


          <div className="resident-portal-badge">

            <Home size={14} />

            Resident Portal

          </div>


          <h1>
            Welcome back, {user?.name}!
          </h1>


          <p>
            Your society residence portal
            is active and secure.
          </p>

        </div>


        <div className="resident-flat-card">

          <div className="resident-flat-letter">

            {flatInfo
              ? flatInfo.wing
              : 'N/A'}

          </div>


          <div>

            <span>
              Assigned Flat
            </span>

            <strong>

              {flatInfo
                ? `Wing ${flatInfo.wing} • Flat ${flatInfo.flatNumber}`
                : 'No flat assigned yet'}

            </strong>


            {flatInfo && (

              <small>

                Floor {flatInfo.floor}
                {' • '}
                {flatInfo.type}

              </small>

            )}

          </div>

        </div>

      </div>


      {/* STAT CARDS */}

      <div className="resident-stat-grid">


        <Link
          to="/resident/complaints"
          className="resident-stat-card"
        >

          <div>

            <span>
              MY COMPLAINTS
            </span>

            <strong>
              {stats.activeComplaints}
              {' '}
              Active
            </strong>

            <small>
              View tickets
              <ArrowRight size={13} />
            </small>

          </div>


          <div className="resident-stat-icon amber">

            <AlertCircle
              size={22}
            />

          </div>

        </Link>


        <Link
          to="/resident/notices"
          className="resident-stat-card"
        >

          <div>

            <span>
              SOCIETY NOTICES
            </span>

            <strong>
              {stats.totalNotices}
              {' '}
              Available
            </strong>

            <small>
              Read circulars
              <ArrowRight size={13} />
            </small>

          </div>


          <div className="resident-stat-icon purple">

            <Bell
              size={22}
            />

          </div>

        </Link>


        {/* MAINTENANCE */}

        <Link
          to="/resident/bills"
          className="resident-stat-card resident-clickable"
        >

          <div>

            <span>
              MAINTENANCE DUE
            </span>

            <strong>

              {stats.pendingBills > 0
                ? `${stats.pendingBills} Pending`
                : 'All Cleared'}

            </strong>

            <small>

              {stats.totalPendingAmount !== undefined
                ? `₹${Number(stats.totalPendingAmount || 0).toFixed(2)} due`
                : 'View payment status'}

              <ArrowRight size={13} />

            </small>

          </div>


          <div className="resident-stat-icon green">

            <CreditCard
              size={22}
            />

          </div>

        </Link>


        {/* EXPECTED VISITORS */}

        <Link
          to="/resident/visitors"
          className="resident-stat-card resident-clickable"
        >

          <div>

            <span>
              EXPECTED VISITORS
            </span>

            <strong>

              {stats.expectedVisitorsToday || 0}
              {' '}
              Scheduled

            </strong>

            <small>

              Gate pre-approval

              <ArrowRight size={13} />

            </small>

          </div>


          <div className="resident-stat-icon teal">

            <Users
              size={22}
            />

          </div>

        </Link>


      </div>


      {/* LOWER GRID */}

      <div className="resident-lower-grid">


        {/* RESIDENT INFORMATION */}

        <div className="resident-information-card">

          <h2>

            <Users
              size={18}
            />

            Resident Information

          </h2>


          <div className="resident-info-list">


            <div className="resident-info-row">

              <span>
                Name
              </span>

              <strong>
                {user?.name || '—'}
              </strong>

            </div>


            <div className="resident-info-row">

              <span>
                Email
              </span>

              <strong>

                <Mail
                  size={14}
                />

                {user?.email || '—'}

              </strong>

            </div>


            <div className="resident-info-row">

              <span>
                Phone
              </span>

              <strong>

                <Phone
                  size={14}
                />

                {user?.phone || '—'}

              </strong>

            </div>


            <div className="resident-info-row">

              <span>
                Role Status
              </span>

              <strong className="verified-badge">
                Verified Resident
              </strong>

            </div>


            <div className="resident-info-row">

              <span>
                Member Since
              </span>

              <strong>

                {new Date()
                  .toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      year: 'numeric',
                    }
                  )}

              </strong>

            </div>


          </div>

        </div>


        {/* SERVICES */}

        <div className="resident-services-card">


          <div className="resident-services-header">

            <div>

              <h2>

                <Building
                  size={19}
                />

                Society Services & Quick Links

              </h2>

              <p>
                Access society services directly
                from your resident portal.
              </p>

            </div>


            <span>
              Resident Portal
            </span>

          </div>


          <div className="resident-services-grid">


            {/* COMPLAINTS */}

            <Link
              to="/resident/complaints"
              className="resident-service-item"
            >

              <div className="resident-service-icon blue">

                <AlertCircle
                  size={18}
                />

              </div>


              <div>

                <strong>
                  Maintenance Complaints
                </strong>

                <small>
                  Raise and track plumbing,
                  electrical, or cleaning tickets.
                </small>

              </div>


              <ArrowRight
                size={16}
                className="resident-service-arrow"
              />

            </Link>


            {/* NOTICES */}

            <Link
              to="/resident/notices"
              className="resident-service-item"
            >

              <div className="resident-service-icon purple">

                <Bell
                  size={18}
                />

              </div>


              <div>

                <strong>
                  Society Circulars
                </strong>

                <small>
                  Stay updated on society meetings,
                  rules, and announcements.
                </small>

              </div>


              <ArrowRight
                size={16}
                className="resident-service-arrow"
              />

            </Link>


            {/* BILLS */}

            <Link
              to="/resident/bills"
              className="resident-service-item"
            >

              <div className="resident-service-icon green">

                <CreditCard
                  size={18}
                />

              </div>


              <div>

                <strong>
                  Maintenance & Dues
                </strong>

                <small>

                  {stats.pendingBills > 0
                    ? `${stats.pendingBills} pending bill(s) reported.`
                    : 'All currently reported dues are cleared.'}

                </small>

              </div>


              <ArrowRight
                size={16}
                className="resident-service-arrow"
              />

            </Link>


            {/* VISITORS */}

            <Link
              to="/resident/visitors"
              className="resident-service-item"
            >

              <div className="resident-service-icon teal">

                <Users
                  size={18}
                />

              </div>


              <div>

                <strong>
                  Visitor Pre-Approval
                </strong>

                <small>

                  {stats.expectedVisitorsToday > 0
                    ? `${stats.expectedVisitorsToday} expected visitor(s) reported today.`
                    : 'No expected visitors reported today.'}

                </small>

              </div>


              <ArrowRight
                size={16}
                className="resident-service-arrow"
              />

            </Link>


          </div>

        </div>


      </div>


    </div>

  );

};


export default ResidentDashboard;
