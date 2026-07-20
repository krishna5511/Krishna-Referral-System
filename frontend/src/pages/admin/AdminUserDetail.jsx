import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserX, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSingleUserApi, blockUserApi, unblockUserApi } from '../../services/admin.api';
import { formatDate, formatPoints, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ProfileLoader } from '../../components/common/Loaders';

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getSingleUserApi(userId)
      .then(res => setUser(res.data.user))
      .catch(() => { toast.error('User not found.'); navigate('/admin/users'); })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleToggleBlock = async () => {
    setActionLoading(true);
    try {
      const fn = user.isBlocked ? unblockUserApi : blockUserApi;
      const res = await fn(userId);
      toast.success(res.data.message);
      setUser(u => ({ ...u, isBlocked: !u.isBlocked }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <ProfileLoader />;

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/users')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Detail</h2>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
            {user.profileImage?.url ? (
              <img src={user.profileImage.url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">{getInitials(user.name)}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <Badge status={user.role} />
              <Badge status={user.ambassadorLevel} />
              {user.isBlocked && <Badge status="REJECTED" label="Blocked" />}
            </div>
            <p className="text-sm text-slate-500">@{user.userName}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.mobileNumber && <p className="text-sm text-slate-500">{user.mobileNumber}</p>}
          </div>
          <Button
            variant={user.isBlocked ? 'success' : 'warning'}
            loading={actionLoading}
            onClick={handleToggleBlock}
          >
            {user.isBlocked ? <><UserCheck className="w-4 h-4" /> Unblock</> : <><UserX className="w-4 h-4" /> Block</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reward Points', value: formatPoints(user.rewardPoints) },
          { label: 'Total Referrals', value: user.totalReferrals },
          { label: 'Referral Code', value: user.referralCode },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Provider', value: user.provider },
            { label: 'Email Verified', value: user.isVerified ? '✅ Yes' : '❌ No' },
            { label: 'Referred By', value: user.referredBy || 'None' },
            { label: 'Last Login', value: formatDate(user.lastLogin) },
            { label: 'Joined', value: formatDate(user.createdAt) },
            { label: 'UPI ID', value: user.upiId || 'Not set' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-slate-500">{label}</p>
              <p className="font-medium text-slate-900 dark:text-white mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Details */}
      {user.bankDetails?.accountNumber && (
        <div className="card">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Bank Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Account Holder', value: user.bankDetails.accountHolderName },
              { label: 'Account Number', value: user.bankDetails.accountNumber },
              { label: 'IFSC Code', value: user.bankDetails.ifscCode },
              { label: 'Bank Name', value: user.bankDetails.bankName },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-slate-500">{label}</p>
                <p className="font-medium text-slate-900 dark:text-white mt-0.5">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
