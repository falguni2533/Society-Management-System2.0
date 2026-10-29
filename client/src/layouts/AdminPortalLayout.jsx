import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Bell,
  ShieldCheck,
  CircleHelp,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  UserRound,
  Database,
  Users,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import './AdminPortalLayout.css';

const AdminPortalLayout = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sms-admin-theme') === 'dark';
  });

  const [panel, setPanel] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      'sms-admin-theme',
      darkMode ? 'dark' : 'light'
    );
  }, [darkMode]);

  useEffect(() => {
    setPanel(null);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();

    navigate('/login', {
      replace: true,
    });
  };

  const pageName = (() => {
    if (location.pathname.includes('/admin/complaints')) {
      return 'Complaints';
    }

    if (location.pathname.includes('/admin/notices')) {
      return 'Notices';
    }

    if (location.pathname.includes('/admin/security')) {
      return 'Security';
    }

    return 'Dashboard';
  })();

  const navigation = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },

    {
      name: 'Complaints',
      path: '/admin/complaints',
      icon: MessageSquare,
    },

    {
      name: 'Notices',
      path: '/admin/notices',
      icon: Bell,
    },

    {
      name: 'Security',
      path: '/admin/security',
      icon: ShieldCheck,
    },
  ];

  const panelContent = {
    help: {
      icon: CircleHelp,

      title: 'Help & Support',

      text:
        'Use the Admin Portal to manage resident complaints, publish society notices and review gate activity.',

      items: [
        [
          'Complaints',
          'Only complaints actually submitted from the Resident Portal appear in Admin Complaints.',
        ],

        [
          'Notices',
          'Publish a notice from the Notices section and it becomes available to residents.',
        ],

        [
          'Security',
          'Review today’s expected visitors and currently checked-in visitors from the Security section.',
        ],
      ],
    },

    settings: {
      icon: Settings,

      title: 'Settings',

      text:
        'Admin portal preferences and account information.',

      items: [
        [
          'Appearance',
          `Current theme: ${darkMode ? 'Dark' : 'Light'} mode.`,
        ],

        [
          'Administrator',
          user?.name || 'System Administrator',
        ],

        [
          'Role',
          'Society Administrator',
        ],

        [
          'Portal',
          'SocietySphere Admin Portal',
        ],
      ],
    },
  };

  const ActivePanelIcon = panel
    ? panelContent[panel].icon
    : null;

  return (
    <div
      className={`
        admin-portal
        ${
          darkMode
            ? 'admin-theme-dark'
            : 'admin-theme-light'
        }
        ${
          sidebarOpen
            ? 'admin-sidebar-open'
            : 'admin-sidebar-collapsed'
        }
      `}
    >

      {sidebarOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">

        {/* BRAND */}

        <div className="admin-brand-row">

          <div className="admin-brand-mark">
            <Building2 size={22} />
          </div>

          <div className="admin-brand-copy">

            <strong>
              SocietySphere
            </strong>

            <span>
              Community Management
            </span>

          </div>

          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>

        </div>


        {/* SOCIETY */}

        <div className="admin-society-card">

          <div className="admin-society-icon">
            <Building2 size={18} />
          </div>

          <div>

            <span>
              YOUR SOCIETY
            </span>

            <strong>
              Green Valley Residency
            </strong>

            <small>
              10 apartments · Connected
            </small>

          </div>

          <i />

        </div>


        {/* NAVIGATION */}

        <div className="admin-nav-label">
          ADMINISTRATION
        </div>

        <nav className="admin-navigation">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `admin-nav-link ${
                    isActive ? 'active' : ''
                  }`
                }
              >

                <span className="admin-nav-icon">
                  <Icon size={18} />
                </span>

                <span>
                  {item.name}
                </span>

                <ChevronRight
                  size={15}
                  className="admin-nav-arrow"
                />

              </NavLink>
            );
          })}

        </nav>


        {/* BOTTOM */}

        <div className="admin-sidebar-bottom">

          <button
            className="admin-secondary-link"
            onClick={() => setPanel('help')}
          >

            <CircleHelp size={18} />

            <span>
              Help & Support
            </span>

            <ChevronRight size={15} />

          </button>


          <button
            className="admin-secondary-link"
            onClick={() => setPanel('settings')}
          >

            <Settings size={18} />

            <span>
              Settings
            </span>

            <ChevronRight size={15} />

          </button>


          <div className="admin-divider" />


          {/* USER */}

          <div className="admin-user-card">

            <div className="admin-user-avatar">
              {(user?.name || 'S')
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <strong>
                {user?.name ||
                  'System Administrator'}
              </strong>

              <span>
                Society Administrator
              </span>

            </div>

          </div>


          {/* SIGN OUT */}

          <button
            className="admin-signout"
            onClick={handleLogout}
          >

            <LogOut size={17} />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div className="admin-topbar-left">

            <button
              className="admin-menu-button"
              onClick={() =>
                setSidebarOpen(
                  (value) => !value
                )
              }
              aria-label="Toggle sidebar"
            >

              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}

            </button>


            <div className="admin-breadcrumb">

              <span>
                Society
              </span>

              <ChevronRight size={14} />

              <strong>
                {pageName}
              </strong>

            </div>

          </div>


          <div className="admin-topbar-actions">

            {/* ONE THEME BUTTON */}

            <button
              className="admin-theme-button"
              onClick={() =>
                setDarkMode(
                  (value) => !value
                )
              }
              title={
                darkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              aria-label="Toggle admin theme"
            >

              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}

            </button>


            {/* ADMIN USER */}

            <div className="admin-top-user">

              <div className="admin-top-avatar">
                {(user?.name || 'S')
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>

                <strong>
                  {user?.name ||
                    'System Administrator'}
                </strong>

                <span>
                  Society Administrator
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* CONTENT */}

        <div className="admin-content-scroll">

          <div className="admin-content-inner">

            <Outlet />

          </div>

        </div>

      </main>


      {/* =====================================================
          HELP / SETTINGS MODAL
      ===================================================== */}

      {panel && (

        <div
          className="admin-modal-backdrop"
          onClick={() => setPanel(null)}
        >

          <section
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="admin-modal-close"
              onClick={() =>
                setPanel(null)
              }
              aria-label="Close"
            >
              <X size={20} />
            </button>


            <div className="admin-modal-icon">

              {ActivePanelIcon && (
                <ActivePanelIcon size={24} />
              )}

            </div>


            <span className="admin-modal-kicker">
              ADMIN PORTAL
            </span>


            <h2>
              {panelContent[panel].title}
            </h2>


            <p className="admin-modal-description">
              {panelContent[panel].text}
            </p>


            <div className="admin-modal-list">

              {panelContent[panel].items.map(
                ([title, text]) => (

                  <div
                    className="admin-modal-item"
                    key={title}
                  >

                    <div className="admin-modal-item-icon">

                      {title ===
                      'Administrator' ? (
                        <UserRound size={17} />
                      ) : title ===
                        'Portal' ? (
                        <Database size={17} />
                      ) : (
                        <Users size={17} />
                      )}

                    </div>


                    <div>

                      <strong>
                        {title}
                      </strong>

                      <span>
                        {text}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>


            {panel === 'settings' && (

              <button
                className="admin-modal-primary"
                onClick={() =>
                  setDarkMode(
                    (value) => !value
                  )
                }
              >

                {darkMode ? (
                  <Sun size={17} />
                ) : (
                  <Moon size={17} />
                )}

                Switch to{' '}
                {darkMode
                  ? 'Light'
                  : 'Dark'}{' '}
                Mode

              </button>

            )}

          </section>

        </div>

      )}

    </div>
  );
};

export default AdminPortalLayout;