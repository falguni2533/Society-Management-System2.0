<<<<<<< HEAD
import React, {
  useMemo,
  useState,
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
=======
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  ShieldCheck,
  Users,
  Building,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  ArrowRight,
>>>>>>> origin/main
} from 'lucide-react';

import './SecurityDashboard.css';


const SecurityDashboard = () => {

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState('all');

  const [activePanel, setActivePanel] =
    useState(null);


  /*
  =========================================
  REAL VISITOR DATA ONLY
  =========================================

  No fake visitor records are created.
  */

  const visitors = [];


  const filteredVisitors =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return visitors.filter(
        (visitor) => {

          const matchesSearch =
            !query ||
            `${visitor.name} ${visitor.flat} ${visitor.vehicle}`
              .toLowerCase()
              .includes(query);


          const matchesFilter =
            activeFilter === 'all' ||
            visitor.status === activeFilter;


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      search,
      activeFilter,
    ]);


  const panels = {

    visitors: {
      title: 'Visitors',
      icon: Users,
      text:
        'Visitor records will appear here when an entry is actually registered at the gate.',
    },

    expected: {
      title: 'Expected Visitors',
      icon: CalendarDays,
      text:
        'Expected visitor approvals will appear here when residents create visitor approvals.',
    },

    inside: {
      title: 'Inside Society',
      icon: UserCheck,
      text:
        'Currently active visitors will appear here after real gate-entry records are created.',
    },

    approvals: {
      title: 'Pending Approvals',
      icon: Clock3,
      text:
        'Resident visitor approvals will appear here when there are pending approvals.',
    },

    entry: {
      title: 'Register Entry',
      icon: LogIn,
      text:
        'Use the visitor registration workflow when a visitor arrives at the gate.',
    },

    exit: {
      title: 'Register Exit',
      icon: LogOut,
      text:
        'Use the visitor exit workflow when a visitor leaves the society.',
    },

    verify: {
      title: 'Verify Visitor',
      icon: UserCheck,
      text:
        'Verify an approval or visitor record before granting society access.',
    },

    vehicle: {
      title: 'Vehicle Entry',
      icon: Car,
      text:
        'Vehicle records will appear here when vehicle-entry activity is recorded.',
    },

    emergency: {
      title: 'Emergency Contact',
      icon: AlertTriangle,
      text:
        'For an emergency, follow the society security procedure and contact the responsible society authority.',
    },

  };


  const active =
    activePanel
      ? panels[activePanel]
      : null;


  const PanelIcon =
    active?.icon;


  return (

    <div className="security-dashboard-page">

<<<<<<< HEAD

      {/* =====================================
          INTRO
      ===================================== */}
=======
      {/* Security Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/security/visitors"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Expected Today
              </p>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              {data?.stats?.expectedVisitorsToday || 0}
            </p>
          </div>
          <div className="text-xs text-blue-600 font-semibold mt-2 flex items-center gap-1">
            Open Gate Desk <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          to="/security/visitors"
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Currently Inside
              </p>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">
              {data?.stats?.currentlyInside || 0}
            </p>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            Active on premises <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
>>>>>>> origin/main

      <section className="security-intro">

        <div>

          <span className="security-badge">

            <ShieldCheck size={15} />

            GATE SECURITY

          </span>


          <h1>
            Security Dashboard
          </h1>


          <p>
            Manage society entry, visitors
            and gate activity from one place.
          </p>

        </div>


        <div className="security-live-status">

          <span />

          Gate is active

        </div>

      </section>


      {/* =====================================
          STATS
      ===================================== */}

      <section className="security-stats">


        {/* TODAY'S VISITORS */}

        <button
          type="button"
          className="security-stat-card"
          onClick={() =>
            setActivePanel('visitors')
          }
        >

          <div className="security-stat-icon blue">

            <Users size={22} />

          </div>


          <div>

            <span>
              Today's Visitors
            </span>

            <strong>
              0
            </strong>

            <small>
              No visitors recorded
            </small>

          </div>


          <ChevronRight size={18} />

        </button>


        {/* EXPECTED VISITORS */}

        <button
          type="button"
          className="security-stat-card"
          onClick={() =>
            setActivePanel('expected')
          }
        >

          <div className="security-stat-icon purple">

            <CalendarDays size={22} />

          </div>


          <div>

            <span>
              Expected Visitors
            </span>

            <strong>
              0
            </strong>

            <small>
              No upcoming visitors
            </small>

          </div>


          <ChevronRight size={18} />

        </button>


        {/* INSIDE SOCIETY */}

        <button
          type="button"
          className="security-stat-card"
          onClick={() =>
            setActivePanel('inside')
          }
        >

          <div className="security-stat-icon green">

            <UserCheck size={22} />

          </div>


          <div>

            <span>
              Inside Society
            </span>

            <strong>
              0
            </strong>

            <small>
              No active visitor records
            </small>

          </div>


          <ChevronRight size={18} />

        </button>


        {/* PENDING APPROVALS */}

        <button
          type="button"
          className="security-stat-card"
          onClick={() =>
            setActivePanel('approvals')
          }
        >

          <div className="security-stat-icon amber">

            <Clock3 size={22} />

          </div>


          <div>

            <span>
              Pending Approvals
            </span>

            <strong>
              0
            </strong>

            <small>
              No pending approvals
            </small>

          </div>


          <ChevronRight size={18} />

        </button>

      </section>


      {/* =====================================
          GATE OPERATIONS
      ===================================== */}

      <section className="security-section">

        <div className="security-section-heading">

          <div>

            <h2>
              Gate Operations
            </h2>

            <p>
              Quick access to everyday
              security actions.
            </p>

          </div>

        </div>


        <div className="security-actions">


          {/* REGISTER ENTRY */}

          <button
            type="button"
            className="security-action-card"
            onClick={() =>
              setActivePanel('entry')
            }
          >

            <div className="security-action-icon blue">

              <LogIn size={21} />

            </div>


            <div>

              <strong>
                Register Entry
              </strong>

              <span>
                Record a visitor entering
                the society.
              </span>

            </div>


            <ChevronRight size={18} />

          </button>


          {/* REGISTER EXIT */}

          <button
            type="button"
            className="security-action-card"
            onClick={() =>
              setActivePanel('exit')
            }
          >

            <div className="security-action-icon green">

              <LogOut size={21} />

            </div>


            <div>

              <strong>
                Register Exit
              </strong>

              <span>
                Record a visitor leaving
                the society.
              </span>

            </div>


            <ChevronRight size={18} />

          </button>


          {/* VERIFY VISITOR */}

          <button
            type="button"
            className="security-action-card"
            onClick={() =>
              setActivePanel('verify')
            }
          >

            <div className="security-action-icon purple">

              <UserCheck size={21} />

            </div>


            <div>

              <strong>
                Verify Visitor
              </strong>

              <span>
                Check approval before entry.
              </span>

            </div>


            <ChevronRight size={18} />

          </button>


          {/* EMERGENCY */}

          <button
            type="button"
            className="security-action-card"
            onClick={() =>
              setActivePanel('emergency')
            }
          >

            <div className="security-action-icon red">

              <AlertTriangle size={21} />

            </div>


            <div>

              <strong>
                Emergency Contact
              </strong>

              <span>
                Quick access to security
                procedure.
              </span>

            </div>


            <ChevronRight size={18} />

          </button>

        </div>

      </section>


      {/* =====================================
          VISITOR AREA
      ===================================== */}

      <section className="security-content-grid">


        {/* VISITOR ACTIVITY */}

        <section className="security-panel">


          <div className="security-panel-header">

            <div>

              <h2>
                Visitor Activity
              </h2>

              <p>
                Only recorded visitor activity
                appears here.
              </p>

            </div>


            <button
              type="button"
              className="security-view-button"
              onClick={() =>
                setActivePanel('visitors')
              }
            >

              View all

              <ChevronRight size={15} />

            </button>

          </div>


          {/* SEARCH + FILTER */}

          <div className="security-toolbar">

            <label className="security-search">

              <Search size={17} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search visitor, flat or vehicle..."
              />

            </label>


            <div className="security-filters">

              {[
                'all',
                'inside',
                'exited',
              ].map(
                (filter) => (

                  <button
                    type="button"
                    key={filter}
                    className={
                      activeFilter === filter
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      setActiveFilter(
                        filter
                      )
                    }
                  >

                    {filter === 'all'
                      ? 'All'
                      : filter === 'inside'
                        ? 'Inside'
                        : 'Exited'}

                  </button>

                )
              )}

            </div>

          </div>


          {/* EMPTY STATE */}

          {filteredVisitors.length === 0 ? (

            <div className="security-empty">

              <div className="security-empty-icon">

                <Users size={25} />

              </div>


              <h3>
                No visitor activity yet
              </h3>


              <p>
                Visitor entries will appear
                here when they are actually
                recorded at the gate.
              </p>


              <button
                type="button"
                onClick={() =>
                  setActivePanel('entry')
                }
              >

                Register entry

                <ChevronRight size={15} />

              </button>

            </div>

          ) : (

            <div className="security-visitor-list">

              {filteredVisitors.map(
                (visitor) => (

                  <div
                    className="security-visitor-row"
                    key={visitor.id}
                  >

                    <div className="security-visitor-avatar">

                      {visitor.name.charAt(0)}

                    </div>


                    <div>

                      <strong>
                        {visitor.name}
                      </strong>

                      <span>
                        {visitor.flat}
                        {' · '}
                        {visitor.vehicle}
                      </span>

                    </div>


                    <time>
                      {visitor.time}
                    </time>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* SIDE STATUS */}

        <aside className="security-side-panel">

          <div className="security-panel-header">

            <div>

              <h2>
                Gate Status
              </h2>

              <p>
                Current security state.
              </p>

            </div>

          </div>


          <div className="security-status-box">

            <span className="status-dot" />

            <div>

              <strong>
                Gate is active
              </strong>

              <span>
                Security portal is ready.
              </span>

            </div>

          </div>


          <div className="security-info-box">

            <Info size={18} />

            <p>
              Always verify visitor approval
              before granting society access.
            </p>

          </div>

        </aside>

      </section>


      {/* =====================================
          MODAL
      ===================================== */}

      {active && (

        <div
          className="security-modal-overlay"
          onClick={() =>
            setActivePanel(null)
          }
        >

          <section
            className="security-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="security-modal-close"
              onClick={() =>
                setActivePanel(null)
              }
            >

              <X size={20} />

            </button>


            <div className="security-modal-icon">

              <PanelIcon size={24} />

            </div>


            <span className="security-modal-label">

              SECURITY PORTAL

            </span>


            <h2>
              {active.title}
            </h2>


            <p>
              {active.text}
            </p>


            {activePanel === 'visitors' && (

              <div className="security-modal-note">

                No visitor records are currently available.

              </div>

            )}


            {activePanel === 'expected' && (

              <div className="security-modal-note">

                No resident-created visitor approvals
                are currently available.

              </div>

            )}


            <button
              type="button"
              className="security-modal-button"
              onClick={() =>
                setActivePanel(null)
              }
            >

              Back to dashboard

            </button>

          </section>

        </div>

      )}

    </div>

  );

};


export default SecurityDashboard;