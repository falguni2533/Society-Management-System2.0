import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Society Management System &copy; {new Date().getFullYear()} — Production Ready MERN</span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Phase 1 Online
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
