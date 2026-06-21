import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  Users,
  Webhook,
  Key,
  Terminal,
  LogOut,
  Menu,
  X,
  MessageSquareCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Sessions Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Send Message Test', path: '/send-message', icon: Send },
    { name: 'Contacts Manager', path: '/contacts', icon: Users },
    { name: 'Webhook Settings', path: '/webhooks', icon: Webhook },
    { name: 'API Key Management', path: '/api-keys', icon: Key },
    { name: 'System Logs', path: '/logs', icon: Terminal },
  ];

  return (
    <div className="min-h-screen flex bg-dark-950 text-dark-100 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 bg-dark-900 border-r border-dark-800/40">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-dark-800/40">
          <MessageSquareCode className="h-8 w-8 text-brand-500 animate-pulse" />
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            OpenWA Portal
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border-l-2 border-brand-500 shadow-[0_0_15px_rgba(52,186,107,0.08)]'
                    : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-400' : 'text-dark-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Log Out */}
        <div className="p-4 border-t border-dark-800/40 bg-dark-950/20">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-dark-200 truncate max-w-[120px]">
                {user?.username}
              </span>
              <span className="text-xs text-dark-400 uppercase tracking-widest">{user?.role}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
              title="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Top Header Mobile */}
        <header className="h-16 flex items-center justify-between px-6 bg-dark-900 border-b border-dark-800/40 md:hidden">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="h-8 w-8 text-brand-500" />
            <span className="font-semibold text-lg bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              OpenWA Portal
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-dark-400 hover:text-dark-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-dark-900 border-b border-dark-850 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-brand-500/10 text-brand-400' : 'text-dark-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </nav>
        )}

        {/* Page Container */}
        <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
