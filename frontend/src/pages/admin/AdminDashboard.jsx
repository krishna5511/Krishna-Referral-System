import { useEffect, useState } from 'react';
import { Users, ShieldCheck, UserCheck, UserX, Star, TrendingUp } from 'lucide-react';
import { getAdminDashboardApi } from '../../services/admin.api';
import { formatPoints } from '../../utils/formatDate';
import { CardLoader } from '../../components/common/Loaders';

function AdminStatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPoints(value)}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardApi()
      .then(res => setData(res.data.dashboard))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: Users, label: 'Total Users', value: data?.totalUsers, color: 'blue' },
    { icon: ShieldCheck, label: 'Total Admins', value: data?.totalAdmins, color: 'purple' },
    { icon: TrendingUp, label: 'Total Ambassadors', value: data?.totalAmbassadors, color: 'indigo' },
    { icon: UserCheck, label: 'Verified Users', value: data?.totalVerifiedUsers, color: 'emerald' },
    { icon: UserX, label: 'Blocked Users', value: data?.totalBlockedUsers, color: 'red' },
    { icon: Star, label: 'Total Reward Points', value: data?.totalRewardPoints, color: 'amber' },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">System overview and statistics</p>
      </div>

      {loading ? <CardLoader count={6} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map(s => <AdminStatCard key={s.label} {...s} />)}
        </div>
      )}
    </div>
  );
}
