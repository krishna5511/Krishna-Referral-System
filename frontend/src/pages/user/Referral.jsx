import { useEffect, useState } from 'react';
import { Copy, Check, Share2, MessageCircle, Send, ExternalLink, Users, Star, TrendingUp, Trophy } from 'lucide-react';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getReferralDashboardApi, getMyReferralsApi, getReferralStatsApi } from '../../services/referral.api';
import { formatDate, formatPoints, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { CardLoader, TableLoader } from '../../components/common/Loaders';

function SocialButton({ icon: Icon, label, href, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${color}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}

export default function Referral() {
  const [dashboard, setDashboard] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refLoading, setRefLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [dashRes, statsRes] = await Promise.all([
          getReferralDashboardApi(),
          getReferralStatsApi(),
        ]);
        setDashboard(dashRes.data.dashboard);
        setStats(statsRes.data.stats);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchReferrals = async () => {
      setRefLoading(true);
      try {
        const res = await getMyReferralsApi({ page, limit: 10 });
        setReferrals(res.data.referrals);
        setPagination(res.data.pagination);
      } catch {}
      setRefLoading(false);
    };
    fetchReferrals();
  }, [page]);

  const handleCopy = () => {
    navigator.clipboard.writeText(dashboard?.referralLink || '');
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = encodeURIComponent(`Join using my referral link and earn rewards! ${dashboard?.referralLink || ''}`);
  const shareUrl = encodeURIComponent(dashboard?.referralLink || '');

  return (
    <div className="space-y-6 fade-in">
      {/* Stats */}
      {loading ? <CardLoader count={3} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Star, label: 'Reward Points', value: formatPoints(stats?.rewardPoints), color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
            { icon: Users, label: 'Total Referrals', value: formatPoints(stats?.totalReferrals), color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/40' },
            { icon: Trophy, label: 'Ambassador Level', value: stats?.ambassadorLevel, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral Link Card */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-500" /> Your Referral Link
        </h3>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <code className="text-sm text-slate-700 dark:text-slate-300 flex-1 break-all">
              {loading ? '...' : dashboard?.referralLink}
            </code>
          </div>
          <Button onClick={handleCopy} variant={copied ? 'success' : 'primary'} size="md">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-400">Your Code:</span>
          <code className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold text-sm tracking-widest">
            {loading ? '...' : dashboard?.referralCode}
          </code>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Share via</p>
          <div className="flex flex-wrap gap-3">
            <SocialButton
              icon={MessageCircle}
              label="WhatsApp"
              href={`https://wa.me/?text=${shareText}`}
              color="bg-green-500 hover:bg-green-600"
            />
            <SocialButton
              icon={Send}
              label="Telegram"
              href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`}
              color="bg-blue-500 hover:bg-blue-600"
            />
            <SocialButton
              icon={FaFacebook}
              label="Facebook"
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              color="bg-blue-700 hover:bg-blue-800"
            />
            <SocialButton
              icon={FaTwitter}
              label="Twitter / X"
              href={`https://twitter.com/intent/tweet?text=${shareText}`}
              color="bg-slate-800 hover:bg-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> Referral History
          {pagination && <span className="text-xs text-slate-500 font-normal ml-1">({pagination.totalReferrals} total)</span>}
        </h3>

        {refLoading ? <TableLoader rows={5} cols={3} /> : referrals.length === 0 ? (
          <EmptyState type="referrals" title="No referrals yet" message="Share your link to start earning reward points!" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="table-th">#</th>
                  <th className="table-th">User</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Verified</th>
                  <th className="table-th">Joined</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => (
                  <tr key={r._id} className="table-row">
                    <td className="table-td">{(page - 1) * 10 + i + 1}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        {r.profileImage?.url ? (
                          <img src={r.profileImage.url} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {getInitials(r.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{r.name}</p>
                          <p className="text-xs text-slate-500">@{r.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-slate-600 dark:text-slate-400">{r.email}</td>
                    <td className="table-td">
                      <Badge status={r.isVerified ? 'APPROVED' : 'PENDING'} label={r.isVerified ? 'Verified' : 'Pending'} />
                    </td>
                    <td className="table-td text-slate-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={pagination?.totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
