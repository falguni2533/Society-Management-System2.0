import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import authService from '../services/authService';

import {
  ShieldCheck,
  MessageSquare,
  Bell,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
<<<<<<< HEAD
  Clock3,
  UserCheck,
  Home,
=======
  Clock,
  CreditCard,
>>>>>>> origin/main
} from 'lucide-react';

import './AdminDashboard.css';


const AdminDashboard = () => {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');


  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const response =
          await authService.getAdminDashboard();

        if (response.success) {
          setData(response.data);
        }

      } catch (err) {

        setError(
          err.response?.data?.message ||
          'Unable to load admin dashboard data.'
        );

      } finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, []);


  const stats =
    data?.stats || {};

  const counts =
    data?.counts || {};

  const visitors =
    stats.visitors || {};

  const systemStatus =
    data?.systemStatus || {};


  const cards = [

    {
      title: 'Registered Complaints',
      value: stats.totalComplaints ?? 0,
      detail:
        `${stats.openComplaints ?? 0} currently open`,
      icon: MessageSquare,
      path: '/admin/complaints',
      tone: 'blue',
    },

    {
      title: 'Published Notices',
      value: stats.totalNotices ?? 0,
      detail: 'Actual society notices',
      icon: Bell,
      path: '/admin/notices',
      tone: 'purple',
    },

    {
      title: 'Residents',
      value: counts.residents ?? 0,
      detail:
        `${counts.flats?.occupied ?? 0} occupied flats`,
      icon: Users,
      path: '/admin',
      tone: 'green',
    },

    {
      title: 'Visitors Today',
      value: visitors.expectedToday ?? 0,
      detail:
        `${visitors.currentlyInside ?? 0} currently inside`,
      icon: UserCheck,
      path: '/admin/security',
      tone: 'amber',
    },

  ];


  if (loading) {

    return (

      <div className="admin-loading">

        <div className="admin-spinner" />

        <span>
          Loading real society data...
        </span>

      </div>

    );

  }


  return (

    <div className="admin-dashboard-page">


      {/* HERO */}

      <section className="admin-dashboard-hero">

        <div className="admin-dashboard-hero-copy">

          <span className="admin-kicker">

            <ShieldCheck size={14} />

            ADMIN PORTAL

          </span>


          <h1>
            Welcome back,{' '}
            {user?.name ||
              'System Administrator'}.
          </h1>


          <p>
            Manage real society records,
            announcements and gate activity
            from one secure control center.
          </p>


          <div className="admin-hero-status">

            <span />

            {systemStatus.status ||
              'Operational'}

            {' · '}

            {systemStatus.database ||
              'Database connected'}

          </div>

        </div>


        <div className="admin-hero-visual">

          <div
            className="admin-orbit
            admin-orbit-one"
          />

          <div
            className="admin-orbit
            admin-orbit-two"
          />

          <div className="admin-building">

            <Building2 size={52} />

          </div>


          <div className="admin-floating-card">

            <strong>
              {counts.flats?.total ?? 0}
            </strong>

            <span>
              Total flats
            </span>

          </div>

        </div>

      </section>


      {error && (

        <div className="admin-error">

          <span>
            {error}
          </span>

        </div>

      )}


      {/* STAT CARDS */}

      <section className="admin-stat-grid">

        {cards.map((card) => {

          const Icon = card.icon;

          return (

            <button
              key={card.title}
              className={
                `admin-stat-card ${card.tone}`
              }
              onClick={() =>
                navigate(card.path)
              }
            >

              <div className="admin-stat-icon">

                <Icon size={21} />

              </div>


              <div className="admin-stat-copy">

                <span>
                  {card.title}
                </span>

                <strong>
                  {card.value}
                </strong>

                <small>
                  {card.detail}
                </small>

              </div>


              <ArrowRight
                size={18}
                className="admin-card-arrow"
              />

            </button>

          );

        })}

      </section>


      {/* MANAGEMENT */}

      <section className="admin-dashboard-grid">

        <div className="admin-panel-card">

          <div className="admin-panel-heading">

            <div>

              <span>
                MANAGEMENT
              </span>

              <h2>
                Society operations
              </h2>

            </div>

          </div>


          <div className="admin-operation-grid">


            {/* COMPLAINTS */}

            <button
              onClick={() =>
                navigate('/admin/complaints')
              }
            >

              <MessageSquare />

              <div>

                <strong>
                  Complaints
                </strong>

                <span>
                  Review complaints actually
                  registered by residents.
                </span>

              </div>

              <ArrowRight />

            </button>


            {/* NOTICES */}

            <button
              onClick={() =>
                navigate('/admin/notices')
              }
            >

              <Bell />

              <div>

                <strong>
                  Notices
                </strong>

                <span>
                  Create and manage
                  announcements for residents.
                </span>

              </div>

              <ArrowRight />

            </button>


            {/* SECURITY */}

            <button
              onClick={() =>
                navigate('/admin/security')
              }
            >

              <ShieldCheck />

              <div>

                <strong>
                  Security
                </strong>

                <span>
                  Review today’s real gate
                  and visitor records.
                </span>

              </div>

              <ArrowRight />

            </button>


            {/* SOCIETY OVERVIEW */}

            <button
              onClick={() =>
                navigate('/admin')
              }
            >

              <Home />

              <div>

                <strong>
                  Society overview
                </strong>

                <span>
                  {counts.totalUsers ?? 0}
                  {' '}
                  registered users across
                  the system.
                </span>

              </div>

              <ArrowRight />

            </button>

          </div>

        </div>


        {/* SYSTEM */}

        <div
          className="
            admin-panel-card
            admin-health-card
          "
        >

          <div className="admin-panel-heading">

            <div>

              <span>
                SYSTEM
              </span>

              <h2>
                Live status
              </h2>

            </div>

            <CheckCircle2 size={22} />

          </div>


          <div className="admin-health-row">

            <span>

              <span className="status-dot" />

              Database

            </span>

            <strong>
              {systemStatus.database ||
                'Connected'}
            </strong>

          </div>


          <div className="admin-health-row">

            <span>

              <span className="status-dot" />

              Portal

            </span>

            <strong>
              {systemStatus.status ||
                'Operational'}
            </strong>

          </div>


          <div className="admin-health-row">

            <span>

              <Clock3 size={16} />

              Open complaints

            </span>

            <strong>
              {stats.openComplaints ?? 0}
            </strong>

          </div>


          <div className="admin-health-row">

            <span>

              <UserCheck size={16} />

              Inside society

            </span>

            <strong>
              {visitors.currentlyInside ?? 0}
            </strong>

          </div>

        </div>

<<<<<<< HEAD
      </section>


      {/* REAL DATA NOTE */}

      <div className="admin-real-data-note">

        <Building2 size={19} />

        <div>

          <strong>
            Real records only
          </strong>

          <span>
            This admin portal does not create
            placeholder complaints, notices or
            visitor records. Information above
            comes from the existing system data.
          </span>

        </div>

=======
        {/* Maintenance Billing Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Maintenance & Dues</h2>
                  <p className="text-xs text-slate-500">Society financial collections</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {stats.billing?.totalBills || 0} Invoices
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-center">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="text-lg font-extrabold text-emerald-700">
                  ${stats.billing?.totalCollectedDues?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Collected</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">
                <div className="text-lg font-extrabold text-amber-700">
                  ${stats.billing?.totalPendingDues?.toFixed(2) || stats.pendingDues?.toFixed(2) || '0.00'}
                </div>
                <div className="text-[11px] font-medium text-amber-600 mt-0.5">Outstanding Dues</div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/bills"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-emerald-900 transition-all mt-2 group"
          >
            <span>Manage society bills & invoices</span>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Visitor Operations Overview Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Gate & Visitors</h2>
                  <p className="text-xs text-slate-500">Security checkpoint records</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                {stats.visitors?.totalVisitors || 0} Total Visits
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4 text-center">
              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                <div className="text-lg font-extrabold text-blue-700">
                  {stats.visitors?.expectedToday || stats.expectedVisitorsToday || 0}
                </div>
                <div className="text-[11px] font-medium text-blue-600 mt-0.5">Expected Today</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <div className="text-lg font-extrabold text-emerald-700">
                  {stats.visitors?.currentlyInside || stats.activeVisitorsInside || 0}
                </div>
                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">Currently Inside</div>
              </div>
            </div>
          </div>

          <Link
            to="/admin/visitors"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-blue-900 transition-all mt-2 group"
          >
            <span>View gate logs & visitor registry</span>
            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
>>>>>>> origin/main
      </div>


    </div>

  );

};


export default AdminDashboard;