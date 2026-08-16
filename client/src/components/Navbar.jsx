import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LogOut,
  User,
  Shield,
  Home,
  Menu,
  X,
  FileText,
  AlertCircle,
  CreditCard,
  Users,
  Bot,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Admin
          </span>
        );
      case 'security':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Shield className="w-3 h-3 text-emerald-600" />
            Security Guard
          </span>
        );
      case 'resident':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Home className="w-3 h-3 text-blue-600" />
            Resident
          </span>
        );
    }
  };

  const getNavLinks = (role) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: Home },
          { name: 'Residents & Flats', path: '/admin#flats', icon: Users },
          { name: 'Complaints', path: '/admin#complaints', icon: AlertCircle },
          { name: 'Notices', path: '/admin#notices', icon: FileText },
          { name: 'Maintenance', path: '/admin#bills', icon: CreditCard },
        ];
      case 'security':
        return [
          { name: 'Gate Checkpoint', path: '/security', icon: Shield },
          { name: 'Expected Visitors', path: '/security#expected', icon: Users },
          { name: 'Visitor Log', path: '/security#logs', icon: FileText },
        ];
      case 'resident':
      default:
        return [
          { name: 'Dashboard', path: '/resident', icon: Home },
          { name: 'Complaints', path: '/resident#complaints', icon: AlertCircle },
          { name: 'Maintenance Bills', path: '/resident#bills', icon: CreditCard },
          { name: 'Notices', path: '/resident#notices', icon: FileText },
          { name: 'AI Assistant', path: '/resident#ai', icon: Bot },
        ];
    }
  };

  const navLinks = user ? getNavLinks(user.role) : [];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to={user?.role === 'admin' ? '/admin' : user?.role === 'security' ? '/security' : '/resident'}
              className="flex items-center gap-2.5 font-bold text-xl text-slate-900 tracking-tight"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-slate-900 font-bold">SocietySphere</span>
                <span className="text-[10px] text-slate-500 font-normal tracking-wide uppercase">
                  Management Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Status & Logout */}
          <div className="hidden sm:flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {user.flat ? `Wing ${user.flat.wing} - Flat ${user.flat.flatNumber}` : user.email}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {user && (
            <div className="pb-3 mb-2 border-b border-slate-100">
              <div className="font-semibold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email}</div>
              <div className="mt-2">{getRoleBadge(user.role)}</div>
            </div>
          )}
          {navLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <item.icon className="w-4 h-4 text-slate-500" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
