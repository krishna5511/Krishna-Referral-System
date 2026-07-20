import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, User, Share2, CreditCard, Bell, Trophy,
  LifeBuoy, Settings, LogOut, ShieldCheck, X, ChevronRight,
  Users, BarChart3, Ticket,
} from 'lucide-react';
import { clsx } from 'clsx';
import { logout } from '../../redux/slices/authSlice';
import { logoutApi } from '../../services/auth.api';
import { getInitials } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/referral', icon: Share2, label: 'Referral' },
  { to: '/withdrawal', icon: CreditCard, label: 'Withdrawal' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/support', icon: LifeBuoy, label: 'Support' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/withdrawals', icon: CreditCard, label: 'Withdrawals' },
  { to: '/admin/support', icon: Ticket, label: 'Support' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar({ isOpen, onClose, isAdmin = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { unreadCount } = useSelector(s => s.notification);
  const nav = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:z-auto'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">RefSystem</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {user?.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200 dark:ring-indigo-800" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {getInitials(user?.name || user?.userName)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user?.userName}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              <ShieldCheck className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">Admin Panel</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => clsx('sidebar-link', isActive && 'sidebar-link-active')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}

          {/* Switch panel link */}
          {user?.role === 'ADMIN' && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <NavLink
                to={isAdmin ? '/dashboard' : '/admin/dashboard'}
                onClick={onClose}
                className="sidebar-link"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{isAdmin ? 'User Panel' : 'Admin Panel'}</span>
                <ChevronRight className="w-4 h-4" />
              </NavLink>
            </div>
          )}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full sidebar-link text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
