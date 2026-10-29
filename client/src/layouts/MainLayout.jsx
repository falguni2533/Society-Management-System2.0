import React, { useEffect, useState } from 'react';

import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Building2,
  LayoutDashboard,
  Home,
  Bell,
  MessageSquare,
  Users,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  ChevronRight,
  CircleHelp,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import './MainLayout.css';


const MainLayout = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();


  /* ============================================================
     SIDEBAR
  ============================================================ */

  const [sidebarOpen, setSidebarOpen] = useState(true);


  /* ============================================================
     THEME
  ============================================================ */

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('sms-theme');

    return savedTheme === 'dark';
  });


  /* ============================================================
     ADMIN HELP / SETTINGS PANEL
     
     These panels are intentionally handled here so the existing
     Resident and Security pages do not need to be changed.
  ============================================================ */

  const [adminPanel, setAdminPanel] = useState(null);


  /* ============================================================
     APPLY THEME
  ============================================================ */

  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';

    localStorage.setItem('sms-theme', theme);

    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    window.dispatchEvent(
      new Event('sms-theme-change')
    );

  }, [darkMode]);


  /* ============================================================
     CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
  ============================================================ */

  useEffect(() => {
    if (window.innerWidth <= 900) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);


  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = () => {
    logout();

    navigate(
      '/login',
      { replace: true }
    );
  };


  /* ============================================================
     ROLE
  ============================================================ */

  const role = user?.role || 'resident';

  const roleLabel = {
    admin: 'Society Administrator',
    resident: 'Society Resident',
    security: 'Security Team',
  };


  /* ============================================================
     NAVIGATION
  ============================================================ */

  const navigation = [

    {
      label: 'Overview',
      type: 'section',
      roles: ['admin', 'security'],
    },

    {
      name: 'Dashboard',

      path:
        role === 'admin'
          ? '/admin'
          : '/security',

      icon: LayoutDashboard,

      roles: ['admin', 'security'],
    },


    {
      label: 'Society',
      type: 'section',
      roles: ['resident', 'admin'],
    },


    {
      name: 'My Home',

      path: '/resident',

      icon: Home,

      roles: ['resident'],
    },


    {
      name: 'Complaints',

      path:
        role === 'admin'
          ? '/admin/complaints'
          : '/resident/complaints',

      icon: MessageSquare,

      roles: ['resident', 'admin'],
    },


    {
      name: 'Notices',

      path:
        role === 'admin'
          ? '/admin/notices'
          : '/resident/notices',

      icon: Bell,

      roles: ['resident', 'admin'],
    },


    {
      name: 'Community',

      path: '/resident',

      icon: Users,

      roles: ['resident'],
    },


    {
      label: 'Management',

      type: 'section',

      roles: ['admin', 'security'],
    },


    {
      name: 'Complaints',

      path: '/admin/complaints',

      icon: MessageSquare,

      roles: ['admin'],
    },


    {
      name: 'Notices',

      path: '/admin/notices',

      icon: Bell,

      roles: ['admin'],
    },


    {
      name: 'Security',

      path: '/security',

      icon: ShieldCheck,

      roles: ['security', 'admin'],
    },

  ];


  const visibleNavigation =
    navigation.filter((item) => {

      if (!item.roles) {
        return true;
      }

      return item.roles.includes(role);

    });


  /* ============================================================
     PAGE NAME
  ============================================================ */

  const getPageName = () => {

    if (
      location.pathname.includes('complaints')
    ) {
      return 'Complaints';
    }


    if (
      location.pathname.includes('notices')
    ) {
      return 'Notices';
    }


    if (
      location.pathname.includes('security')
    ) {
      return 'Security';
    }


    if (
      location.pathname === '/resident'
    ) {
      return 'My Home';
    }


    if (
      location.pathname === '/admin'
    ) {
      return 'Dashboard';
    }


    return 'Dashboard';
  };


  /* ============================================================
     SIDEBAR TOGGLE
  ============================================================ */

  const toggleSidebar = () => {
    setSidebarOpen(
      (current) => !current
    );
  };


  /* ============================================================
     ADMIN HELP / SETTINGS
  ============================================================ */

  const openAdminPanel = (panel) => {

    /*
      Only Admin gets these panels.
      Resident and Security remain untouched.
    */

    if (role !== 'admin') {
      return;
    }

    setAdminPanel(panel);
  };


  const closeAdminPanel = () => {
    setAdminPanel(null);
  };


  /* ============================================================
     ADMIN PANEL CONTENT
  ============================================================ */

  const renderAdminPanel = () => {

    if (!adminPanel || role !== 'admin') {
      return null;
    }


    const isHelp = adminPanel === 'help';


    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: darkMode
            ? 'rgba(2, 6, 12, 0.76)'
            : 'rgba(15, 23, 42, 0.38)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={closeAdminPanel}
      >

        <section
          style={{
            width: '100%',
            maxWidth: '560px',
            maxHeight: '85vh',
            overflowY: 'auto',
            borderRadius: '22px',
            padding: '28px',
            position: 'relative',

            background: darkMode
              ? '#0b111a'
              : '#ffffff',

            color: darkMode
              ? '#f8fafc'
              : '#111827',

            border: darkMode
              ? '1px solid #1d2b3b'
              : '1px solid #dbe3ef',

            boxShadow: darkMode
              ? '0 30px 80px rgba(0,0,0,0.55)'
              : '0 30px 80px rgba(15,23,42,0.20)',

            transition:
              'background 0.25s ease, color 0.25s ease',
          }}

          onClick={(event) =>
            event.stopPropagation()
          }
        >

          {/* CLOSE */}

          <button
            type="button"
            onClick={closeAdminPanel}
            aria-label="Close panel"
            title="Close"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: darkMode
                ? '1px solid #26384c'
                : '1px solid #dbe3ef',
              background: darkMode
                ? '#101923'
                : '#f8fafc',
              color: darkMode
                ? '#dbeafe'
                : '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={19} />
          </button>


          {/* ICON */}

          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',

              background:
                'linear-gradient(135deg, #2563eb, #3b82f6)',

              color: '#ffffff',

              boxShadow:
                '0 12px 30px rgba(37,99,235,0.25)',
            }}
          >
            {isHelp ? (
              <CircleHelp size={25} />
            ) : (
              <Settings size={25} />
            )}
          </div>


          {/* LABEL */}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '10px',

              background: darkMode
                ? 'rgba(59,130,246,0.12)'
                : '#eff6ff',

              color: '#3b82f6',
            }}
          >
            {isHelp
              ? 'ADMIN SUPPORT'
              : 'ADMIN SETTINGS'}
          </span>


          {/* TITLE */}

          <h2
            style={{
              margin: '0 55px 10px 0',
              fontSize: '26px',
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {isHelp
              ? 'Help & Support'
              : 'Settings'}
          </h2>


          {/* DESCRIPTION */}

          <p
            style={{
              margin: '0 0 24px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: darkMode
                ? '#9fb0c3'
                : '#64748b',
            }}
          >
            {isHelp
              ? 'Get clear guidance for managing your SocietySphere administration portal.'
              : 'View your current portal preferences and understand how the application theme works.'}
          </p>


          {/* ==================================================
              HELP CONTENT
          ================================================== */}

          {isHelp && (

            <div
              style={{
                display: 'grid',
                gap: '12px',
              }}
            >

              <div
                style={{
                  padding: '17px',
                  borderRadius: '14px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Complaints
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  Open the Complaints section from the sidebar
                  to review complaints actually registered by
                  residents.
                </span>

              </div>


              <div
                style={{
                  padding: '17px',
                  borderRadius: '14px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Society Notices
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  Use Notices to create, publish and manage
                  announcements for residents.
                </span>

              </div>


              <div
                style={{
                  padding: '17px',
                  borderRadius: '14px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Security
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  The Security section is used for society gate
                  and visitor-related operations.
                </span>

              </div>


              <div
                style={{
                  padding: '17px',
                  borderRadius: '14px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '6px',
                  }}
                >
                  Need administrator assistance?
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  For account, society configuration or access
                  issues, contact the system administrator or
                  your configured society support contact.
                </span>

              </div>

            </div>
          )}


          {/* ==================================================
              SETTINGS CONTENT
          ================================================== */}

          {!isHelp && (

            <div
              style={{
                display: 'grid',
                gap: '12px',
              }}
            >

              {/* CURRENT THEME */}

              <div
                style={{
                  padding: '18px',
                  borderRadius: '15px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                  }}
                >

                  <div>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: '15px',
                        marginBottom: '5px',
                      }}
                    >
                      Appearance
                    </strong>

                    <span
                      style={{
                        fontSize: '13px',
                        color: darkMode
                          ? '#9fb0c3'
                          : '#64748b',
                      }}
                    >
                      Current theme:{" "}
                      <strong>
                        {darkMode
                          ? 'Dark mode'
                          : 'Light mode'}
                      </strong>
                    </span>

                  </div>


                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: darkMode
                        ? '#172337'
                        : '#eaf2ff',
                      color: '#3b82f6',
                    }}
                  >
                    {darkMode ? (
                      <Moon size={20} />
                    ) : (
                      <Sun size={20} />
                    )}
                  </div>

                </div>

              </div>


              {/* THEME INFORMATION */}

              <div
                style={{
                  padding: '18px',
                  borderRadius: '15px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '7px',
                  }}
                >
                  Theme control
                </strong>

                <span
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  Use the single sun/moon button in the
                  top-right header to switch the entire
                  portal between light and dark mode.
                </span>

              </div>


              {/* ADMIN ACCOUNT */}

              <div
                style={{
                  padding: '18px',
                  borderRadius: '15px',
                  border: darkMode
                    ? '1px solid #1d2b3b'
                    : '1px solid #e2e8f0',
                  background: darkMode
                    ? '#101923'
                    : '#f8fafc',
                }}
              >

                <strong
                  style={{
                    display: 'block',
                    fontSize: '15px',
                    marginBottom: '7px',
                  }}
                >
                  Administrator account
                </strong>

                <span
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: darkMode
                      ? '#9fb0c3'
                      : '#64748b',
                  }}
                >
                  Signed in as{" "}
                  <strong>
                    {user?.name || 'System Administrator'}
                  </strong>
                </span>

                <span
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '12px',
                    color: darkMode
                      ? '#718399'
                      : '#94a3b8',
                  }}
                >
                  Role: Society Administrator
                </span>

              </div>

            </div>
          )}


          {/* CLOSE / BACK BUTTON */}

          <button
            type="button"
            onClick={closeAdminPanel}
            style={{
              width: '100%',
              marginTop: '22px',
              minHeight: '46px',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',

              background:
                'linear-gradient(135deg, #2563eb, #3b82f6)',

              color: '#ffffff',

              fontSize: '14px',
              fontWeight: 700,

              boxShadow:
                '0 10px 24px rgba(37,99,235,0.22)',
            }}
          >
            Back to Admin Portal
          </button>

        </section>

      </div>
    );
  };


  return (

    <div
      className={`
        sms-app
        ${darkMode
          ? 'sms-dark'
          : 'sms-light'}
        ${sidebarOpen
          ? 'sms-sidebar-visible'
          : 'sms-sidebar-hidden'}
      `}
    >

      {/* ====================================================
          MOBILE OVERLAY
      ==================================================== */}

      {sidebarOpen && (

        <div
          className="sms-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside
        className={`
          sms-sidebar
          ${sidebarOpen
            ? 'sms-sidebar-open'
            : 'sms-sidebar-closed'}
        `}
      >

        {/* BRAND */}

        <div className="sms-brand">

          <div className="sms-brand-mark">

            <Building2
              size={22}
              strokeWidth={2.2}
            />

          </div>


          <div className="sms-brand-text">

            <span className="sms-brand-name">
              SocietySphere
            </span>

            <span className="sms-brand-subtitle">
              Community Management
            </span>

          </div>


          {/* CLOSE BUTTON */}

          <button
            type="button"
            className="sms-mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <X size={19} />
          </button>

        </div>


        {/* SOCIETY CARD */}

        <div className="sms-society-card">

          <div className="sms-society-icon">

            <Building2 size={18} />

          </div>


          <div>

            <span className="sms-society-label">
              YOUR SOCIETY
            </span>

            <strong>
              Green Valley Residency
            </strong>

            <small>
              10 apartments · Connected
            </small>

          </div>


          <span className="sms-online-dot" />

        </div>


        {/* NAVIGATION */}

        <nav className="sms-navigation">

          {visibleNavigation.map(
            (item, index) => {

              if (
                item.type === 'section'
              ) {

                return (

                  <div
                    className="sms-nav-section"
                    key={`${item.label}-${index}`}
                  >
                    {item.label}
                  </div>

                );

              }


              const Icon = item.icon;


              return (

                <NavLink
                  key={`${item.name}-${item.path}-${index}`}
                  to={item.path}
                  className={({ isActive }) =>
                    `sms-nav-link ${
                      isActive
                        ? 'sms-nav-active'
                        : ''
                    }`
                  }

                  onClick={() => {

                    if (
                      window.innerWidth <=
                      900
                    ) {
                      setSidebarOpen(
                        false
                      );
                    }

                  }}
                >

                  <span className="sms-nav-icon">

                    <Icon
                      size={18}
                      strokeWidth={1.9}
                    />

                  </span>


                  <span className="sms-nav-name">
                    {item.name}
                  </span>


                  <ChevronRight
                    className="sms-nav-arrow"
                    size={15}
                  />

                </NavLink>

              );

            }
          )}

        </nav>


        {/* ==================================================
            SIDEBAR BOTTOM
        ================================================== */}

        <div className="sms-sidebar-bottom">


          {/* HELP & SUPPORT */}

          <button
            type="button"
            className="sms-secondary-link"
            onClick={() => {
              if (role === 'admin') {
                openAdminPanel('help');
              }
            }}
          >

            <span className="sms-secondary-icon">

              <CircleHelp size={18} />

            </span>

            <span>
              Help & Support
            </span>

          </button>


          {/* SETTINGS */}

          <button
            type="button"
            className="sms-secondary-link"
            onClick={() => {
              if (role === 'admin') {
                openAdminPanel('settings');
              }
            }}
          >

            <span className="sms-secondary-icon">

              <Settings size={18} />

            </span>

            <span>
              Settings
            </span>

          </button>


          <div className="sms-sidebar-divider" />


          {/* USER */}

          <div className="sms-user-card">

            <div className="sms-user-avatar">

              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : 'U'}

            </div>


            <div className="sms-user-info">

              <strong>
                {user?.name ||
                  'Society User'}
              </strong>

              <span>
                {roleLabel[role] ||
                  'Society Member'}
              </span>

            </div>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="sms-logout-button"
            onClick={handleLogout}
          >

            <LogOut size={17} />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>


      {/* ====================================================
          MAIN AREA
      ==================================================== */}

      <div className="sms-main">


        {/* TOP BAR */}

        <header className="sms-topbar">


          <div className="sms-topbar-left">


            {/* MENU / REOPEN */}

            <button
              type="button"
              className="sms-menu-button"
              onClick={toggleSidebar}
              aria-label={
                sidebarOpen
                  ? 'Close sidebar'
                  : 'Open sidebar'
              }
              title={
                sidebarOpen
                  ? 'Close sidebar'
                  : 'Open sidebar'
              }
            >

              {sidebarOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}

            </button>


            <div className="sms-breadcrumb">

              <span>
                Society
              </span>

              <ChevronRight size={14} />

              <strong>
                {getPageName()}
              </strong>

            </div>

          </div>


          {/* TOP ACTIONS */}

          <div className="sms-topbar-actions">


            {/* ONLY THEME BUTTON */}

            <button
              type="button"
              className="sms-icon-button"
              onClick={() =>
                setDarkMode(
                  (value) => !value
                )
              }
              aria-label="Toggle theme"
              title={
                darkMode
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >

              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}

            </button>


            {/* NOTIFICATION */}

            <button
              type="button"
              className="sms-icon-button sms-notification-button"
              aria-label="Notifications"
            >

              <Bell size={18} />

              <span className="sms-notification-dot" />

            </button>


            {/* USER */}

            <div className="sms-top-user">

              <div className="sms-top-avatar">

                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : 'U'}

              </div>


              <div className="sms-top-user-info">

                <strong>
                  {user?.name || 'User'}
                </strong>

                <span>
                  {roleLabel[role] ||
                    'Member'}
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <main className="sms-content">

          <div className="sms-content-inner">


            {/* PAGE HEADING */}

            <div className="sms-page-heading">

              <div>

                <span className="sms-eyebrow">
                  SOCIETY PORTAL
                </span>

                <h1>
                  {getPageName()}
                </h1>

                <p>
                  Stay connected with your
                  community, home and society
                  activities.
                </p>

              </div>


              <div className="sms-heading-status">

                <span className="sms-status-pulse" />

                Society online

              </div>

            </div>


            {/* PAGE */}

            <div className="sms-page-content">

              <Outlet />

            </div>

          </div>

        </main>

      </div>


      {/* ====================================================
          ADMIN HELP / SETTINGS PANEL
      ==================================================== */}

      {renderAdminPanel()}

    </div>
  );
};


export default MainLayout;