















import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  User,
  ShieldCheck,
  AlertCircle,
  Home,
  Trees,
} from 'lucide-react';

const LoginPage = () => {
  const { login, isAuthenticated, user, getRedirectPath } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('sms-theme') === 'dark'
  );

  /* =========================
     THEME
  ========================= */

  useEffect(() => {
    localStorage.setItem(
      'sms-theme',
      darkMode ? 'dark' : 'light'
    );

    document.documentElement.classList.toggle(
      'dark',
      darkMode
    );
  }, [darkMode]);

  /* =========================
     SESSION EXPIRED
  ========================= */

  useEffect(() => {
    const expired =
      new URLSearchParams(location.search).get('expired');

    if (expired === 'true') {
      setSessionExpiredNotice(true);
    }
  }, [location]);

  /* =========================
     REDIRECT IF ALREADY LOGIN
  ========================= */

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(
        getRedirectPath(user.role),
        { replace: true }
      );
    }
  }, [
    isAuthenticated,
    user,
    navigate,
    getRedirectPath,
  ]);

  /* =========================
     INPUT CHANGE
  ========================= */

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  /* =========================
     LOGIN
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');

    try {
      const loggedInUser = await login(
        formData.email,
        formData.password
      );

      const targetPath =
        location.state?.from?.pathname ||
        getRedirectPath(loggedInUser.role);

      navigate(targetPath, {
        replace: true,
      });

    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DEMO LOGIN
  ========================= */

  const handleDemoFill = (email, password) => {
    setFormData({
      email,
      password,
    });

    setErrorMessage('');
  };

  return (
    <div
      className={`sms-login-page ${
        darkMode
          ? 'sms-login-dark'
          : 'sms-login-light'
      }`}
    >

      {/* =====================================================
          SOCIETY BACKGROUND SCENE
          ===================================================== */}

      <div
        className="sms-login-scene"
        aria-hidden="true"
      >

        {/* Sky glow */}
        <div className="sms-sky-glow" />

        {/* Moon */}
        <div className="sms-moon" />

        {/* Clouds */}
        <div className="sms-cloud sms-cloud-one" />
        <div className="sms-cloud sms-cloud-two" />

        {/* Hills */}
        <div className="sms-hill sms-hill-back" />
        <div className="sms-hill sms-hill-front" />

        {/* Trees */}
        <div className="sms-tree sms-tree-one">
          <i />
          <b />
          <em />
        </div>

        <div className="sms-tree sms-tree-two">
          <i />
          <b />
          <em />
        </div>

        <div className="sms-tree sms-tree-three">
          <i />
          <b />
          <em />
        </div>

        <div className="sms-tree sms-tree-four">
          <i />
          <b />
          <em />
        </div>

        {/* Road */}
        <div className="sms-road" />

        {/* =================================================
            HOUSE
            ================================================= */}

        <div className="sms-house">

          <div className="sms-house-roof" />

          <div className="sms-house-body">
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="sms-house-door" />

          <div className="sms-house-light" />

        </div>

        {/* =================================================
            EXTRA PARK / SOCIETY DETAILS
            ================================================= */}

        <div className="society-scene">

          {/* Distant buildings */}
          <div className="scene-buildings">

            <div className="building building-one">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="building building-two">
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="building building-three">
              <span />
              <span />
              <span />
              <span />
            </div>

          </div>

          {/* Park */}
          <div className="scene-park">

            <div className="park-tree tree-one">
              <div className="tree-crown" />
              <div className="tree-trunk" />
            </div>

            <div className="park-tree tree-two">
              <div className="tree-crown" />
              <div className="tree-trunk" />
            </div>

            <div className="park-tree tree-three">
              <div className="tree-crown" />
              <div className="tree-trunk" />
            </div>

            <div className="park-bench">
              <span />
              <span />
            </div>

          </div>

          {/* House 1 */}
          <div className="scene-house house-one">

            <div className="house-roof" />

            <div className="house-body">
              <div className="house-window" />
              <div className="house-window" />
              <div className="house-door" />
            </div>

          </div>

          {/* House 2 */}
          <div className="scene-house house-two">

            <div className="house-roof" />

            <div className="house-body">
              <div className="house-window" />
              <div className="house-window" />
              <div className="house-door" />
            </div>

          </div>

          {/* Road */}
          <div className="scene-road">

            <div className="road-line line-one" />
            <div className="road-line line-two" />
            <div className="road-line line-three" />

          </div>

          {/* Society Gate */}
          <div className="society-gate">

            <div className="gate-post left-post" />
            <div className="gate-post right-post" />

            <div className="gate-bar">
              <span>SOCIETY</span>
            </div>

          </div>

          {/* Street lights */}
          <div className="street-light light-one">
            <div className="lamp" />
            <div className="light-pole" />
          </div>

          <div className="street-light light-two">
            <div className="lamp" />
            <div className="light-pole" />
          </div>

        </div>

      </div>

      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="sms-login-topbar">

        <Link
          to="/"
          className="sms-login-brand"
        >

          <span className="sms-login-brand-icon">
            <Building2 size={20} />
          </span>

          <span>
            SocietySphere
          </span>

        </Link>

        <button
          type="button"
          className="sms-login-theme-toggle"
          onClick={() =>
            setDarkMode((value) => !value)
          }
          aria-label="Toggle theme"
        >
          {darkMode ? '☀' : '☾'}
        </button>

      </header>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="sms-login-main">

        {/* =================================================
            LEFT INTRODUCTION
            ================================================= */}

        <section className="sms-login-intro">

          <div className="sms-login-intro-badge">

            <Home size={16} />

            <span>
              Smart Society Living
            </span>

          </div>

          <h1>
            Welcome to
            <br />

            <span>
              your community.
            </span>
          </h1>

          <p>
            A secure digital home for residents,
            administrators and security teams —
            keeping everyday society life connected,
            simple and organized.
          </p>

          {/* Features */}

          <div className="sms-login-features">

            <div>

              <span>
                <ShieldCheck size={17} />
              </span>

              <div>
                <strong>
                  Secure access
                </strong>

                <small>
                  Role-based society management
                </small>
              </div>

            </div>

            <div>

              <span>
                <Trees size={17} />
              </span>

              <div>
                <strong>
                  One community hub
                </strong>

                <small>
                  Notices, complaints and updates
                </small>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            LOGIN CARD
            ================================================= */}

        <section className="sms-login-wrapper">

          <div className="sms-login-card">

            {/* Header */}

            <div className="sms-login-card-header">

              <div className="sms-login-icon">
                <Building2 size={25} />
              </div>

              <div>

                <h2>
                  Welcome back
                </h2>

                <p>
                  Sign in to your society account
                </p>

              </div>

            </div>

            {/* Session expired */}

            {sessionExpiredNotice && (
              <div className="sms-login-alert sms-login-warning">

                <AlertCircle size={17} />

                <span>
                  Your previous session has expired.
                  Please sign in again.
                </span>

              </div>
            )}

            {/* Error */}

            {errorMessage && (
              <div className="sms-login-alert sms-login-error">

                <AlertCircle size={17} />

                <span>
                  {errorMessage}
                </span>

              </div>
            )}

            {/* =================================================
                LOGIN FORM
                ================================================= */}

            <form
              className="sms-login-form"
              onSubmit={handleSubmit}
              noValidate
            >

              {/* Email */}

              <div className="sms-login-field">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="sms-login-input-wrap">

                  <Mail size={17} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                  />

                </div>

              </div>

              {/* Password */}

              <div className="sms-login-field">

                <label htmlFor="current-password">
                  Password
                </label>

                <div className="sms-login-input-wrap">

                  <Lock size={17} />

                  <input
                    id="current-password"
                    name="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    className="sms-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}

                  </button>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="sms-login-submit"
              >
                {loading
                  ? 'Authenticating...'
                  : 'Sign in'}
              </button>

            </form>

            {/* =================================================
                DEMO ACCOUNTS
                ================================================= */}

            <div className="sms-demo-section">

              <div className="sms-demo-heading">

                <span />

                <p>
                  Quick demo access
                </p>

                <span />

              </div>

              <div className="sms-demo-grid">

                {/* Admin */}

                <button
                  type="button"
                  onClick={() =>
                    handleDemoFill(
                      'admin@society.com',
                      'admin123'
                    )
                  }
                  className="sms-demo-card"
                >

                  <Shield size={17} />

                  <span>
                    Admin
                  </span>

                </button>

                {/* Resident */}

                <button
                  type="button"
                  onClick={() =>
                    handleDemoFill(
                      'resident@society.com',
                      'resident123'
                    )
                  }
                  className="sms-demo-card"
                >

                  <User size={17} />

                  <span>
                    Resident
                  </span>

                </button>

                {/* Security */}

                <button
                  type="button"
                  onClick={() =>
                    handleDemoFill(
                      'security@society.com',
                      'security123'
                    )
                  }
                  className="sms-demo-card"
                >

                  <ShieldCheck size={17} />

                  <span>
                    Security
                  </span>

                </button>

              </div>

            </div>

            {/* Register */}

            <div className="sms-login-register">

              <span>
                New resident?
              </span>

              <Link to="/register">
                Register your flat
              </Link>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="sms-login-footer">

        <span>
          © {new Date().getFullYear()} SocietySphere
        </span>

        <span>
          Built for better community living
        </span>

      </footer>

    </div>
  );
};

export default LoginPage;