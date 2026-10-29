import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

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
  Clock3,
  UserCheck,
  Home,
  CreditCard,
  X,
  Search,
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

  const [showDirectory, setShowDirectory] = useState(false);
  const [directoryTab, setDirectoryTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');


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
      action: 'directory',
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
            className="
              admin-orbit
              admin-orbit-one
            "
          />

          <div
            className="
              admin-orbit
              admin-orbit-two
            "
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
              onClick={() => {
                if (card.action === 'directory') {
                  setShowDirectory(true);
                } else {
                  navigate(card.path);
                }
              }}
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
                setShowDirectory(true)
              }
            >

              <Home />

              <div>

                <strong>
                  Society directory
                </strong>

                <span>
                  {counts.totalUsers ?? 0}
                  {' '}
                  registered users · View flats & members.
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


        {/* MAINTENANCE BILLING OVERVIEW */}

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2.5">

                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">

                  <CreditCard className="w-5 h-5" />

                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Maintenance & Dues
                  </h2>

                  <p className="text-xs text-slate-500">
                    Society financial collections
                  </p>

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

                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                  Collected
                </div>

              </div>


              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-100">

                <div className="text-lg font-extrabold text-amber-700">

                  ${stats.billing?.totalPendingDues?.toFixed(2) || stats.pendingDues?.toFixed(2) || '0.00'}

                </div>

                <div className="text-[11px] font-medium text-amber-600 mt-0.5">
                  Outstanding Dues
                </div>

              </div>

            </div>

          </div>


          <Link
            to="/admin/bills"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-emerald-900 transition-all mt-2 group"
          >

            <span>
              Manage society bills & invoices
            </span>

            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />

          </Link>

        </div>


        {/* VISITOR OPERATIONS OVERVIEW */}

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">

          <div>

            <div className="flex items-center justify-between mb-4">

              <div className="flex items-center gap-2.5">

                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">

                  <Users className="w-5 h-5" />

                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Gate & Visitors
                  </h2>

                  <p className="text-xs text-slate-500">
                    Security checkpoint records
                  </p>

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

                <div className="text-[11px] font-medium text-blue-600 mt-0.5">
                  Expected Today
                </div>

              </div>


              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">

                <div className="text-lg font-extrabold text-emerald-700">

                  {stats.visitors?.currentlyInside || stats.activeVisitorsInside || 0}

                </div>

                <div className="text-[11px] font-medium text-emerald-600 mt-0.5">
                  Currently Inside
                </div>

              </div>

            </div>

          </div>


          <Link
            to="/admin/visitors"
            className="inline-flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-blue-900 transition-all mt-2 group"
          >

            <span>
              View gate logs & visitor registry
            </span>

            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition-transform" />

          </Link>

        </div>

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

      </div>


      {/* SOCIETY DIRECTORY MODAL */}
      {showDirectory && (
        <div
          className="complaint-modal-backdrop"
          onClick={() => setShowDirectory(false)}
        >
          <section
            className="complaint-modal"
            style={{
              maxWidth: '820px',
              width: '100%',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="complaint-modal-close"
              onClick={() => setShowDirectory(false)}
              aria-label="Close directory"
            >
              <X size={20} />
            </button>

            <span className="admin-subpage-kicker">
              <Building2 size={14} />
              SOCIETY DIRECTORY
            </span>

            <h2>Society Members & Flats</h2>
            <p className="complaint-modal-ref">
              Real MongoDB database records · {data?.users?.length || 0} registered users · {data?.flats?.length || 0} flats
            </p>

            {/* TAB CONTROLS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={directoryTab === 'users' ? 'admin-primary-button' : 'admin-outline-button'}
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => setDirectoryTab('users')}
              >
                Users & Roles ({data?.users?.length || 0})
              </button>
              <button
                type="button"
                className={directoryTab === 'flats' ? 'admin-primary-button' : 'admin-outline-button'}
                style={{ padding: '8px 16px', fontSize: '13px' }}
                onClick={() => setDirectoryTab('flats')}
              >
                Flats & Occupancy ({data?.flats?.length || 0})
              </button>
            </div>

            {/* SEARCH FILTER */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder={directoryTab === 'users' ? "Search users by name, email, phone, role..." : "Search flats by wing, flat number, owner..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--admin-border)',
                  background: 'var(--admin-surface-2)',
                  color: 'var(--admin-text)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* USERS TAB CONTENT */}
            {directoryTab === 'users' && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {(data?.users || [])
                  .filter((u) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      u.name?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.phone?.toLowerCase().includes(q) ||
                      u.role?.toLowerCase().includes(q) ||
                      (u.flat && `${u.flat.wing}-${u.flat.flatNumber}`.toLowerCase().includes(q))
                    );
                  })
                  .map((u) => (
                    <div
                      key={u._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--admin-border)',
                        background: 'var(--admin-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'var(--admin-blue-soft, rgba(37,99,235,0.1))',
                            color: 'var(--admin-blue, #2563eb)',
                            display: 'grid',
                            placeItems: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                          }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--admin-text)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--admin-muted)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <span>{u.email}</span>
                            {u.phone && <span>· {u.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {u.flat && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'var(--admin-surface)',
                              border: '1px solid var(--admin-border)',
                              color: 'var(--admin-text)',
                            }}
                          >
                            Flat {u.flat.wing}-{u.flat.flatNumber}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background:
                              u.role === 'admin'
                                ? 'rgba(239, 68, 68, 0.12)'
                                : u.role === 'security'
                                ? 'rgba(245, 158, 11, 0.12)'
                                : 'rgba(34, 197, 94, 0.12)',
                            color:
                              u.role === 'admin'
                                ? '#ef4444'
                                : u.role === 'security'
                                ? '#f59e0b'
                                : '#22c55e',
                          }}
                        >
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                {(data?.users || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                    No user records found.
                  </div>
                )}
              </div>
            )}

            {/* FLATS TAB CONTENT */}
            {directoryTab === 'flats' && (
              <div style={{ display: 'grid', gap: '10px' }}>
                {(data?.flats || [])
                  .filter((f) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      f.wing?.toLowerCase().includes(q) ||
                      f.flatNumber?.toLowerCase().includes(q) ||
                      f.status?.toLowerCase().includes(q) ||
                      f.owner?.name?.toLowerCase().includes(q)
                    );
                  })
                  .map((f) => (
                    <div
                      key={f._id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--admin-border)',
                        background: 'var(--admin-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'var(--admin-blue-soft, rgba(37,99,235,0.1))',
                            color: 'var(--admin-blue, #2563eb)',
                            display: 'grid',
                            placeItems: 'center',
                          }}
                        >
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--admin-text)' }}>
                            Wing {f.wing} - Flat {f.flatNumber}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>
                            Floor {f.floor || 1} · {f.type || 'Standard'}
                            {f.owner?.name && <span> · Owner: {f.owner.name}</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background:
                              f.status === 'occupied'
                                ? 'rgba(34, 197, 94, 0.12)'
                                : 'rgba(100, 116, 139, 0.12)',
                            color:
                              f.status === 'occupied'
                                ? '#22c55e'
                                : '#64748b',
                          }}
                        >
                          {f.status || 'Vacant'}
                        </span>
                        {f.residents && f.residents.length > 0 && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'var(--admin-surface)',
                              border: '1px solid var(--admin-border)',
                              color: 'var(--admin-text)',
                            }}
                          >
                            {f.residents.length} {f.residents.length === 1 ? 'Resident' : 'Residents'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {(data?.flats || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                    No flat records found.
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="admin-primary-button"
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => setShowDirectory(false)}
            >
              Close Directory
            </button>
          </section>
        </div>
      )}


    </div>

  );

};


export default AdminDashboard;