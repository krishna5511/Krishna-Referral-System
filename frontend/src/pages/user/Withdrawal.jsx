import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Building2, X, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyWithdrawalsApi, requestWithdrawalApi, cancelWithdrawalApi } from '../../services/withdrawal.api';
import { getProfileApi } from '../../services/user.api';
import { withdrawalSchema } from '../../validation/withdrawal.validation';
import { formatDate, formatPoints } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { TableLoader } from '../../components/common/Loaders';

export default function Withdrawal() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { paymentMethod: 'UPI' },
  });
  const paymentMethod = watch('paymentMethod');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([getMyWithdrawalsApi(), getProfileApi()]);
      setWithdrawals(wRes.data.withdrawals);
      setProfile(pRes.data.user);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await requestWithdrawalApi({ points: Number(data.points), paymentMethod: data.paymentMethod });
      toast.success(res.data.message);
      setShowForm(false);
      reset();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      const res = await cancelWithdrawalApi(id);
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancellingId(null);
    }
  };

  const hasPending = withdrawals.some(w => w.status === 'PENDING');

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdrawal</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Available: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatPoints(profile?.rewardPoints)} points</span>
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          disabled={hasPending}
        >
          <Plus className="w-4 h-4" /> Request Withdrawal
        </Button>
      </div>

      {hasPending && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          You have a pending withdrawal request. Cancel it first to make a new one.
        </div>
      )}

      {/* Payment Method Info */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-sm">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">UPI Details</p>
            </div>
            {profile.upiId ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{profile.upiId}</p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">Not set — update in Profile</p>
            )}
          </div>
          <div className="card-sm">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-500" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Bank Account</p>
            </div>
            {profile.bankDetails?.accountNumber ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.bankDetails.bankName} · ****{profile.bankDetails.accountNumber.slice(-4)}
              </p>
            ) : (
              <p className="text-xs text-amber-600 dark:text-amber-400">Not set — update in Profile</p>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Withdrawal History
          <span className="text-xs text-slate-500 font-normal ml-2">({withdrawals.length} total)</span>
        </h3>

        {loading ? <TableLoader /> : withdrawals.length === 0 ? (
          <EmptyState type="withdrawals" title="No withdrawals yet" message="Request your first withdrawal once you have 100+ points." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="table-th">Points</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Method</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w._id} className="table-row">
                    <td className="table-td font-semibold">{formatPoints(w.points)}</td>
                    <td className="table-td">₹{formatPoints(w.amount)}</td>
                    <td className="table-td">{w.paymentMethod}</td>
                    <td className="table-td"><Badge status={w.status} /></td>
                    <td className="table-td text-slate-500">{formatDate(w.createdAt)}</td>
                    <td className="table-td">
                      {w.status === 'PENDING' && (
                        <Button
                          variant="danger"
                          size="xs"
                          loading={cancellingId === w._id}
                          onClick={() => handleCancel(w._id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {w.status === 'REJECTED' && w.rejectionReason && (
                        <span className="text-xs text-red-500" title={w.rejectionReason}>Reason: {w.rejectionReason.slice(0, 20)}...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Request Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); reset(); }} title="Request Withdrawal" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Points to Withdraw <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="100"
              max={profile?.rewardPoints}
              placeholder="Min 100 points"
              className="input-field"
              {...register('points')}
            />
            {errors.points && <p className="mt-1 text-xs text-red-500">{errors.points.message}</p>}
            <p className="mt-1 text-xs text-slate-500">Available: {formatPoints(profile?.rewardPoints)} points = ₹{formatPoints(profile?.rewardPoints)}</p>
          </div>

          <div>
            <label className="label">Payment Method <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {['UPI', 'BANK'].map(m => (
                <label key={m} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === m ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                  <input type="radio" value={m} {...register('paymentMethod')} className="text-indigo-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{m === 'UPI' ? '📱 UPI' : '🏦 Bank Transfer'}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && <p className="mt-1 text-xs text-red-500">{errors.paymentMethod.message}</p>}
          </div>

          {paymentMethod === 'UPI' && !profile?.upiId && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Please add your UPI ID in Profile first.
            </div>
          )}
          {paymentMethod === 'BANK' && !profile?.bankDetails?.accountNumber && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Please add your bank details in Profile first.
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
