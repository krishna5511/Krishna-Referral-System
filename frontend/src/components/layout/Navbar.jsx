import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, Search, X } from 'lucide-react';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { getInitials } from '../../utils/formatDate';
import { clsx } from 'clsx';

export default function Navbar({ onMenuClick, title = 'Dashboard' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { theme } = useSelector(s => s.theme);
  const { unreadCount } = useSelector(s => s.notification);

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 hidden sm:block">{title}</h1>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications bell */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Avatar */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 pl-2"
          >
            {user?.profileImage?.url ? (
              <img
                src={user.profileImage.url}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {getInitials(user?.name || user?.userName)}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.role}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
