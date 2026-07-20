import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trophy, Star, Users, Medal } from 'lucide-react';
import { getLeaderboardApi } from '../../services/referral.api';
import { formatPoints, getInitials } from '../../utils/formatDate';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableLoader } from '../../components/common/Loaders';
import Badge from '../../components/common/Badge';

function RankIcon({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useSelector(s => s.auth);
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await getLeaderboardApi({ page, limit: 10 });
        setLeaderboard(res.data.leaderboard);
        setPagination(res.data.pagination);
      } catch {}
      setLoading(false);
    };
    fetchLeaderboard();
  }, [page]);

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="card bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <p className="text-indigo-100 text-sm">Top performers ranked by reward points</p>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {!loading && leaderboard.length >= 3 && page === 1 && (
        <div className="grid grid-cols-3 gap-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, idx) => {
            const positions = [2, 1, 3];
            const rank = positions[idx];
            const isFirst = rank === 1;
            return (
              <div key={entry._id} className={`card text-center ${isFirst ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}>
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden ${isFirst ? 'ring-4 ring-indigo-400' : 'ring-2 ring-slate-200 dark:ring-slate-700'}`}>
                  {entry.profileImage?.url ? (
                    <img src={entry.profileImage.url} alt={entry.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {getInitials(entry.name)}
                    </div>
                  )}
                </div>
                <RankIcon rank={entry.rank} />
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">{entry.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{entry.userName}</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatPoints(entry.rewardPoints)} pts</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Table */}
      <div className="card">
        {loading ? <TableLoader rows={10} cols={5} /> : leaderboard.length === 0 ? (
          <EmptyState type="leaderboard" title="Leaderboard is empty" message="Be the first to earn points!" />
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
                {leaderboard.map(entry => {
                  const isMe = entry.userName === user?.userName;
                  return (
                    <tr key={entry._id} className={`table-row ${isMe ? 'bg-indigo-50 dark:bg-indigo-950/30 font-semibold' : ''}`}>
                      <td className="table-td w-16 text-center">
                        <RankIcon rank={entry.rank} />
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          {entry.profileImage?.url ? (
                            <img src={entry.profileImage.url} alt={entry.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(entry.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {entry.name} {isMe && <span className="text-xs text-indigo-500">(You)</span>}
                            </p>
                            <p className="text-xs text-slate-500">@{entry.userName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td"><Badge status={entry.ambassadorLevel} /></td>
                      <td className="table-td">{formatPoints(entry.totalReferrals)}</td>
                      <td className="table-td">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatPoints(entry.rewardPoints)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination currentPage={page} totalPages={pagination?.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
