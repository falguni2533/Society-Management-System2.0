import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Home,
  Menu,
  Moon,
  Shield,
  ShieldCheck,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react";

import "./LandingPage.css";

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("sms-theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  });

  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "sms-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const scrollToSection = (id) => {
    setMobileMenu(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={`sms-page ${darkMode ? "sms-dark" : ""}`}>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="sms-nav-wrap">

        <nav className="sms-navbar">

          <button
            className="sms-brand"
            onClick={() => window.scrollTo({
              top: 0,
              behavior: "smooth",
            })}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >

            <div className="sms-brand-mark">
              <Building2 size={21} />
            </div>

            <div className="sms-brand-copy">
              <span className="sms-brand-name">
                SocietySphere
              </span>

              <span className="sms-brand-sub">
                Society Management System
              </span>
            </div>

          </button>

          {/* Desktop links */}

          <div className="sms-nav-links">

            <button
              className="sms-nav-link"
              onClick={() => scrollToSection("sms-features")}
            >
              Platform
            </button>

            <button
              className="sms-nav-link"
              onClick={() => scrollToSection("sms-roles")}
            >
              For Residents
            </button>

            <button
              className="sms-nav-link"
              onClick={() => scrollToSection("sms-security")}
            >
              Security
            </button>

            <button
              className="sms-nav-link"
              onClick={() => scrollToSection("sms-contact")}
            >
              Contact
            </button>

          </div>

          {/* Right controls */}

          <div className="sms-nav-actions">

            <button
              className="sms-theme-btn"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
              title={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}
            </button>

            <button
              className="sms-login-btn"
              onClick={goToLogin}
            >
              Sign in
            </button>

            <button
              className="sms-nav-cta"
              onClick={goToLogin}
            >
              Enter portal
            </button>

            <button
              className="sms-mobile-toggle"
              onClick={() => setMobileMenu((value) => !value)}
              aria-label="Open menu"
            >
              {mobileMenu ? (
                <X size={19} />
              ) : (
                <Menu size={19} />
              )}
            </button>

          </div>

        </nav>

        {/* Mobile menu */}

        <div
          className={`sms-mobile-menu ${
            mobileMenu ? "open" : ""
          }`}
        >

          <button
            className="sms-mobile-link"
            onClick={() => scrollToSection("sms-features")}
          >
            Platform
          </button>

          <button
            className="sms-mobile-link"
            onClick={() => scrollToSection("sms-roles")}
          >
            For Residents
          </button>

          <button
            className="sms-mobile-link"
            onClick={() => scrollToSection("sms-security")}
          >
            Security
          </button>

          <button
            className="sms-mobile-link"
            onClick={() => scrollToSection("sms-contact")}
          >
            Contact
          </button>

          <button
            className="sms-mobile-link"
            onClick={goToLogin}
          >
            Sign in to portal
          </button>

        </div>

      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="sms-hero">

          <div className="sms-container">

            <div className="sms-hero-grid">

              {/* Left side */}

              <div className="sms-hero-content">

                <div className="sms-eyebrow sms-reveal">
                  <span className="sms-live-dot" />
                  Your community, connected in real time
                </div>

                <h1 className="sms-hero-title sms-reveal sms-delay-1">

                  A smarter way to run

                  <span className="sms-gradient-text">
                    your society.
                  </span>

                </h1>

                <p className="sms-hero-description sms-reveal sms-delay-2">
                  One digital space for residents, management
                  committees and security teams. Manage daily
                  community operations, stay informed and keep
                  your neighbourhood connected.
                </p>

                <div className="sms-hero-actions sms-reveal sms-delay-3">

                  <button
                    className="sms-primary-btn"
                    onClick={goToLogin}
                  >
                    Open resident portal
                    <ArrowRight size={16} />
                  </button>

                  <button
                    className="sms-secondary-btn"
                    onClick={() => scrollToSection("sms-features")}
                  >
                    Explore the platform
                    <ChevronDown size={15} />
                  </button>

                </div>

                <div className="sms-trust-row sms-reveal sms-delay-4">

                  <div className="sms-trust-item">
                    <CheckCircle2 size={14} />
                    Role-based access
                  </div>

                  <div className="sms-trust-item">
                    <CheckCircle2 size={14} />
                    Secure operations
                  </div>

                  <div className="sms-trust-item">
                    <CheckCircle2 size={14} />
                    Built for communities
                  </div>

                </div>

              </div>

              {/* Right side — 3D society */}

              <div className="sms-visual">

                <div className="sms-orbit" />

                {/* Floating status cards */}

                <div className="sms-float-card card-one">

                  <div className="sms-card-label">
                    Society occupancy
                  </div>

                  <div className="sms-card-value">
                    92%
                  </div>

                  <div className="sms-card-status">
                    <span className="sms-live-dot" />
                    128 homes active
                  </div>

                </div>

                <div className="sms-float-card card-two">

                  <div className="sms-card-label">
                    Security
                  </div>

                  <div className="sms-card-value">
                    Secure
                  </div>

                  <div className="sms-card-status">
                    <span className="sms-live-dot" />
                    Gate online
                  </div>

                </div>

                <div className="sms-float-card card-three">

                  <div className="sms-card-label">
                    Open requests
                  </div>

                  <div className="sms-card-value">
                    07
                  </div>

                  <div className="sms-card-status">
                    <Zap size={10} />
                    Live updates
                  </div>

                </div>

                {/* Building */}

                <div className="sms-building">

                  <div className="sms-building-shadow" />

                  <div className="sms-building-side" />

                  <div className="sms-tower">

                    <div className="sms-tower-top" />

                    <div className="sms-windows">

                      {Array.from(
                        { length: 55 },
                        (_, index) => (
                          <span
                            key={index}
                            className="sms-window"
                          />
                        )
                      )}

                    </div>

                  </div>

                  <div className="sms-building-base">

                    <div className="sms-entrance">
                      <div className="sms-entrance-light" />
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="sms-stats-section">

          <div className="sms-container">

            <div className="sms-stats">

              <Stat
                number="128+"
                label="Homes connected"
              />

              <Stat
                number="24/7"
                label="Security visibility"
              />

              <Stat
                number="03"
                label="Role-based portals"
              />

              <Stat
                number="100%"
                label="Centralized records"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            FEATURES
        ================================================= */}

        <section
          id="sms-features"
          className="sms-section"
        >

          <div className="sms-container">

            <div className="sms-section-header">

              <div className="sms-section-kicker">
                One community. One platform.
              </div>

              <h2 className="sms-section-title">
                Everything your society needs,
                without the paperwork.
              </h2>

              <p className="sms-section-description">
                SocietySphere brings everyday community
                operations into one organized digital
                experience.
              </p>

            </div>

            <div className="sms-feature-grid">

              <Feature
                icon={<Users size={21} />}
                title="Resident management"
                description="Keep household and flat information organized while giving residents a clear digital experience."
              />

              <Feature
                icon={<ClipboardList size={21} />}
                title="Complaint workflow"
                description="Residents can raise issues and management can track, prioritize and resolve them."
              />

              <Feature
                icon={<FileText size={21} />}
                title="Society notices"
                description="Important announcements stay organized instead of getting lost in scattered messages."
              />

              <Feature
                icon={<ShieldCheck size={21} />}
                title="Security operations"
                description="Give security teams a focused workspace for gate and visitor-related operations."
              />

              <Feature
                icon={<Home size={21} />}
                title="Flat & community records"
                description="Create a centralized source of truth for society residents and properties."
              />

              <Feature
                icon={<Zap size={21} />}
                title="Real-time visibility"
                description="Keep the management team aware of important activity across the community."
              />

            </div>

          </div>

        </section>

        {/* =================================================
            ROLES
        ================================================= */}

        <section
          id="sms-roles"
          className="sms-section"
        >

          <div className="sms-container">

            <div className="sms-role-layout">

              {/* Dark portal preview */}

              <div className="sms-role-panel">

                <div className="sms-role-panel-header">

                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#8f9db1",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                      }}
                    >
                      RESIDENT PORTAL
                    </div>

                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "17px",
                        fontWeight: 850,
                      }}
                    >
                      Welcome home
                    </div>
                  </div>

                  <div className="sms-status-pill">
                    <span className="sms-live-dot" />
                    Online
                  </div>

                </div>

                <div className="sms-role-profile">

                  <div className="sms-avatar">
                    ST
                  </div>

                  <div>

                    <div className="sms-role-name">
                      Resident account
                    </div>

                    <div className="sms-role-flat">
                      Wing A · Flat A-101
                    </div>

                  </div>

                </div>

                <div className="sms-role-activity">

                  <MiniActivity
                    icon={<BellIcon />}
                    text="New society notice"
                    time="2m"
                  />

                  <MiniActivity
                    icon={<ClipboardList size={14} />}
                    text="Complaint updated"
                    time="18m"
                  />

                  <MiniActivity
                    icon={<Shield size={14} />}
                    text="Visitor entry approved"
                    time="31m"
                  />

                </div>

              </div>

              {/* Role explanation */}

              <div>

                <div className="sms-section-kicker">
                  Designed around people
                </div>

                <h2 className="sms-section-title">
                  Different roles.
                  <br />
                  One connected community.
                </h2>

                <p className="sms-section-description">
                  A resident should not see an administrator's
                  tools. A security guard should not have to
                  navigate through management controls.
                </p>

                <div className="sms-role-list">

                  <RoleItem
                    icon={<Users size={18} />}
                    title="Residents"
                    text="View notices, manage requests and stay connected with their society."
                  />

                  <RoleItem
                    icon={<Building2 size={18} />}
                    title="Management"
                    text="Get a central view of complaints, residents and community activity."
                  />

                  <RoleItem
                    icon={<Shield size={18} />}
                    title="Security team"
                    text="Access a focused environment for daily security operations."
                  />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            SECURITY
        ================================================= */}

        <section
          id="sms-security"
          className="sms-section"
        >

          <div className="sms-container">

            <div className="sms-section-header">

              <div className="sms-section-kicker">
                Built with control in mind
              </div>

              <h2 className="sms-section-title">
                The right information,
                for the right person.
              </h2>

              <p className="sms-section-description">
                Society operations involve different responsibilities.
                Role-based access keeps each experience focused and
                protects information from unnecessary exposure.
              </p>

            </div>

            <div className="sms-feature-grid">

              <Feature
                icon={<ShieldCheck size={21} />}
                title="Protected access"
                description="Authenticated users enter the workspace designed for their role."
              />

              <Feature
                icon={<Shield size={21} />}
                title="Role separation"
                description="Resident, administrator and security experiences remain clearly separated."
              />

              <Feature
                icon={<Check size={21} />}
                title="Organized operations"
                description="Keep important society workflows inside one structured digital system."
              />

            </div>

          </div>

        </section>

        {/* =================================================
            CTA
        ================================================= */}

        <section
          id="sms-contact"
          className="sms-cta"
        >

          <div className="sms-container">

            <div className="sms-cta-box">

              <div className="sms-cta-content">

                <div className="sms-section-kicker"
                  style={{
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  Welcome to a better-managed community
                </div>

                <h2 className="sms-cta-title">
                  Your society deserves
                  a digital home.
                </h2>

                <p className="sms-cta-description">
                  Access your society portal and bring residents,
                  management and security operations together.
                </p>

                <button
                  className="sms-cta-btn"
                  onClick={goToLogin}
                >
                  Enter Society Portal
                  <ArrowRight size={15} />
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="sms-footer">

        <div className="sms-container">

          <div className="sms-footer-inner">

            <div className="sms-footer-copy">
              © 2026 SocietySphere · Society Management System
            </div>

            <div className="sms-footer-links">

              <button
                className="sms-footer-link"
                onClick={() => scrollToSection("sms-features")}
              >
                Platform
              </button>

              <button
                className="sms-footer-link"
                onClick={() => scrollToSection("sms-security")}
              >
                Security
              </button>

              <button
                className="sms-footer-link"
                onClick={goToLogin}
              >
                Portal
              </button>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

const Stat = ({ number, label }) => {
  return (
    <div className="sms-stat">

      <div className="sms-stat-number">
        {number}
      </div>

      <div className="sms-stat-label">
        {label}
      </div>

      <div className="sms-stat-live">
        <span className="sms-live-dot" />
        Live platform
      </div>

    </div>
  );
};


const Feature = ({
  icon,
  title,
  description,
}) => {
  return (
    <article className="sms-feature">

      <div className="sms-feature-icon">
        {icon}
      </div>

      <h3 className="sms-feature-title">
        {title}
      </h3>

      <p className="sms-feature-description">
        {description}
      </p>

    </article>
  );
};


const RoleItem = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="sms-role-item">

      <div className="sms-role-item-icon">
        {icon}
      </div>

      <div>

        <div className="sms-role-item-title">
          {title}
        </div>

        <div className="sms-role-item-text">
          {text}
        </div>

      </div>

    </div>
  );
};


const MiniActivity = ({
  icon,
  text,
  time,
}) => {
  return (
    <div className="sms-mini-activity">

      <div className="sms-mini-icon">
        {icon}
      </div>

      <div className="sms-mini-text">
        {text}
      </div>

      <div className="sms-mini-time">
        {time}
      </div>

    </div>
  );
};


const BellIcon = () => (
  <span style={{ fontSize: "14px" }}>
    🔔
  </span>
);


export default LandingPage;