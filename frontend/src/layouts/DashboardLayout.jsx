import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useSelector } from 'react-redux';
import { getUnreadCountApi } from '../services/notification.api';
import { useDispatch } from 'react-redux';
import { setUnreadCount } from '../redux/slices/notificationSlice';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/profile': 'My Profile',
  '/referral': 'Referral Program',
  '/withdrawal': 'Withdrawals',
  '/notifications': 'Notifications',
  '/leaderboard': 'Leaderboard',
  '/support': 'Support Center',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);

  const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] || 'Dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      getUnreadCountApi()
        .then(r => dispatch(setUnreadCount(r.data.unreadCount)))
        .catch(() => {});
    }
  }, [location.pathname, isAuthenticated, dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isAdmin={false}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
