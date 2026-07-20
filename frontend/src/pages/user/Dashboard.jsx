import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Share2, CreditCard, Trophy, Bell, AlertCircle, ArrowRight, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getReferralDashboardApi } from '../../services/referral.api';
import { getMyWithdrawalsApi } from '../../services/withdrawal.api';
import { getMyNotificationsApi } from '../../services/notification.api';
import { sendVerificationEmailApi as sendVerifApi } from '../../services/auth.api';
import { formatPoints, formatDate, timeAgo } from '../../utils/formatDate';
import { CardLoader, NotificationLoader } from '../../components/common/Loaders';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

function StatCard({ icon: Icon, label, value, sub, color = 'indigo', loading }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
  };

  if (loading) return (
    <div className="card">
      <div className="skeleton h-4 w-24 mb-3 rounded" />
      <div className="skeleton h-8 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-32 rounded" />
    </div>
  );

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const [dashboard, setDashboard] = useState(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingVerif, setSendingVerif] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dashRes, wdRes, notifRes] = await Promise.allSettled([
          getReferralDashboardApi(),
          getMyWithdrawalsApi(),
          getMyNotificationsApi({ page: 1, limit: 5 }),
        ]);
        if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data.dashboard);
        if (wdRes.status === 'fulfilled') setRecentWithdrawals(wdRes.value.data.withdrawals?.slice(0, 3) || []);
        if (notifRes.status === 'fulfilled') setRecentNotifications(notifRes.value.data.notifications || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleSendVerification = async () => {
    setSendingVerif(true);
    try {
      const res = await sendVerifApi();
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSendingVerif(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Email verification banner */}
      {user && !user.isVerified && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
            Please verify your email to access all features.
          </p>
          <Button
            variant="warning"
            size="sm"
            loading={sendingVerif}
            onClick={handleSendVerification}
          >
            Resend Email
          </Button>
        </div>
      )}

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here's your referral overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Star}
          label="Reward Points"
          value={formatPoints(dashboard?.rewardPoints)}
          sub="Redeemable as cash"
          color="indigo"
          loading={loading}
        />
        <StatCard
          icon={Share2}
          label="Total Referrals"
          value={formatPoints(dashboard?.totalReferrals)}
          sub="People you referred"
          color="purple"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Earnings"
          value={`₹${formatPoints(dashboard?.totalEarnings)}`}
          sub="Points × 1 = ₹1"
          color="emerald"
          loading={loading}
        />
        <StatCard
          icon={Trophy}
          label="Ambassador Level"
          value={dashboard?.ambassadorLevel || user?.ambassadorLevel || 'BRONZE'}
          sub={`Rank #${dashboard?.rank || 'N/A'}`}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/referral', icon: Share2, label: 'Share Referral', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400' },
            { to: '/withdrawal', icon: CreditCard, label: 'Withdraw Points', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' },
            { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' },
            { to: '/support', icon: Bell, label: 'Get Support', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="card-sm hover:shadow-md transition-all duration-200 flex flex-col items-center gap-2 text-center cursor-pointer hover:-translate-y-0.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Withdrawals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Withdrawals</h3>
            <Link to="/withdrawal" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
            </div>
          ) : recentWithdrawals.length === 0 ? (
            <EmptyState type="withdrawals" title="No withdrawals" message="Your withdrawal history will appear here." />
          ) : (
            <div className="space-y-3">
              {recentWithdrawals.map(w => (
                <div key={w._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPoints(w.points)} Points</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{w.paymentMethod} · {formatDate(w.createdAt)}</p>
                  </div>
                  <Badge status={w.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Notifications</h3>
            <Link to="/notifications" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <NotificationLoader count={3} />
          ) : recentNotifications.length === 0 ? (
            <EmptyState type="notifications" title="No notifications" message="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {recentNotifications.map(n => (
                <div key={n._id} className={`flex gap-3 p-3 rounded-xl ${!n.isRead ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
