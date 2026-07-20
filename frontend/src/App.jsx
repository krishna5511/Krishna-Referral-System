import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { logout } from './redux/slices/authSlice';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import GuestRoute from './routes/GuestRoute';
import AdminRoute from './routes/AdminRoute';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Public Pages
import Home from './pages/public/Home';

// User Pages
import Dashboard from './pages/user/Dashboard';
import Profile from './pages/user/Profile';
import Referral from './pages/user/Referral';
import Withdrawal from './pages/user/Withdrawal';
import Notifications from './pages/user/Notifications';
import Leaderboard from './pages/user/Leaderboard';
import Support from './pages/user/Support';
import SupportChat from './pages/user/SupportChat';
import Settings from './pages/user/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSupportChat from './pages/admin/AdminSupportChat';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAnalytics from './pages/admin/AdminAnalytics';

export default function App() {
  const { theme } = useSelector(s => s.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      dispatch(logout());
      navigate('/login');
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, [dispatch, navigate]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
            iconTheme: { primary: '#10b981', secondary: '#ecfdf5' },
          },
          error: {
            style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
            iconTheme: { primary: '#ef4444', secondary: '#fef2f2' },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Guest-only Routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/support" element={<Support />} />
            <Route path="/support/:ticketId" element={<SupportChat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Admin-only Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/support/:ticketId" element={<AdminSupportChat />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
