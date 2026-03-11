// Navbar component — authenticated layout navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Play, History, BarChart3, User, Settings,
  Menu, X, LogOut, Zap
} from 'lucide-react';
import { signOutUser } from '../../firebase/auth';
import { useAppStore } from '../../store/appStore';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/track', icon: Play, label: 'Track' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/profile', icon: User, label: 'Profile' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { profile, sidebarOpen, setSidebarOpen } = useAppStore();

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-64 z-50 glass-strong border-r border-night-700/50 flex flex-col md:translate-x-0 md:relative md:z-auto"
        style={{ translateX: undefined }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-night-700/50">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center glow-orange-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl text-gradient tracking-wider">RunTrack</span>
          <button
            className="ml-auto md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        {profile && (
          <div className="px-4 py-4 border-b border-night-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-body font-bold text-sm">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-body font-semibold text-sm truncate">{profile.name}</p>
                <p className="text-gray-500 text-xs truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'group-hover:text-brand-400 transition-colors'}`} />
                <span className="font-body font-medium text-sm">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-night-700/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 font-body font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
};

// Mobile top navbar
export const TopNav: React.FC = () => {
  const { setSidebarOpen } = useAppStore();
  const location = useLocation();
  
  const currentPage = navItems.find(n => n.path === location.pathname);
  
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 glass-strong border-b border-night-700/50 px-4 py-4 flex items-center gap-3">
      <button
        className="text-gray-400 hover:text-white transition-colors"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-brand-500" />
        <span className="font-display text-xl text-white tracking-wider">
          {currentPage?.label || 'RunTrack'}
        </span>
      </div>
    </div>
  );
};
