import { useEffect, useState } from 'react';
import { Trophy, Users, Star, TrendingUp } from 'lucide-react';
import { getAnalyticsApi, getAdminLeaderboardApi } from '../../services/admin.api';
import { formatPoints, getInitials } from '../../utils/formatDate';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { CardLoader, TableLoader } from '../../components/common/Loaders';
import EmptyState from '../../components/common/EmptyState';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    getAnalyticsApi()
      .then(res => setAnalytics(res.data.analytics || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLbLoading(true);
    getAdminLeaderboardApi({ page, limit: 15 })
      .then(res => { setLeaderboard(res.data.leaderboard); setPagination(res.data.pagination); })
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, [page]);

  return (
    <div className="space-y-6 fade-in">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h2>

      {/* Analytics Cards */}
      {loading ? <CardLoader count={4} /> : analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Object.entries(analytics).slice(0, 8).map(([key, value]) => (
            <div key={key} className="card">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{typeof value === 'number' ? formatPoints(value) : value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Top Leaderboard */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Admin Leaderboard
        </h3>
        {lbLoading ? <TableLoader rows={10} cols={5} /> : leaderboard.length === 0 ? (
          <EmptyState type="leaderboard" title="No data" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="table-th">Rank</th>
                  <th className="table-th">User</th>
                  <th className="table-th">Level</th>
                  <th className="table-th">Referrals</th>
                  <th className="table-th">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry._id} className="table-row">
                    <td className="table-td w-12 text-center font-bold text-slate-500">
                      {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(entry.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{entry.name}</p>
                          <p className="text-xs text-slate-500">@{entry.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><Badge status={entry.ambassadorLevel} /></td>
                    <td className="table-td">{entry.totalReferrals}</td>
                    <td className="table-td font-bold text-indigo-600 dark:text-indigo-400">{formatPoints(entry.rewardPoints)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={pagination?.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
