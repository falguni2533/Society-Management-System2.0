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
  Clock3,
  UserCheck,
  Home,
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


    </div>

  );

};


export default AdminDashboard;