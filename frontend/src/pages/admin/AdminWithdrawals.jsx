import { useEffect, useState, useCallback } from 'react';
import { Search, Check, X, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllWithdrawalsApi, approveWithdrawalApi, rejectWithdrawalApi, markWithdrawalPaidApi
} from '../../services/withdrawal.api';
import { formatDate, formatPoints, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { TableLoader } from '../../components/common/Loaders';
import { WITHDRAWAL_STATUSES } from '../../utils/constants';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, search };
      if (statusFilter) params.status = statusFilter;
      const res = await getAllWithdrawalsApi(params);
      setWithdrawals(res.data.withdrawals);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setAction = (id, val) => setActionLoading(p => ({ ...p, [id]: val }));

  const handleApprove = async (id) => {
    setAction(id, 'approve');
    try {
      const res = await approveWithdrawalApi(id);
      toast.success(res.data.message);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setAction(id, null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setAction(rejectModal, 'reject');
    try {
      const res = await rejectWithdrawalApi(rejectModal, { rejectionReason });
      toast.success(res.data.message);
      setRejectModal(null); setRejectionReason('');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setAction(rejectModal, null); }
  };

  const handlePaid = async (id) => {
    setAction(id, 'paid');
    try {
      const res = await markWithdrawalPaidApi(id);
      toast.success(res.data.message);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setAction(id, null); }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Withdrawal Management</h2>
          {pagination && <p className="text-sm text-slate-500">{pagination.totalWithdrawals} total</p>}
        </div>
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search..." className="input-field pl-9 w-48" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[{ value: '', label: 'All' }, ...WITHDRAWAL_STATUSES].map(s => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? <TableLoader rows={10} cols={6} /> : withdrawals.length === 0 ? (
          <div className="p-8"><EmptyState type="withdrawals" title="No withdrawals" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Points / Amount</th>
                  <th className="table-th">Method</th>
                  <th className="table-th">Payment Info</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {withdrawals.map(w => (
                  <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(w.user?.name || 'U')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{w.user?.name}</p>
                          <p className="text-xs text-slate-500">@{w.user?.userName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <p className="font-semibold">{formatPoints(w.points)} pts</p>
                      <p className="text-xs text-slate-500">₹{formatPoints(w.amount)}</p>
                    </td>
                    <td className="table-td">{w.paymentMethod}</td>
                    <td className="table-td">
                      {w.paymentMethod === 'UPI' ? (
                        <p className="text-xs">{w.upiId || 'N/A'}</p>
                      ) : (
                        <p className="text-xs">{w.bankDetails?.bankName} ****{w.bankDetails?.accountNumber?.slice(-4)}</p>
                      )}
                    </td>
                    <td className="table-td"><Badge status={w.status} /></td>
                    <td className="table-td text-xs text-slate-500">{formatDate(w.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {w.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(w._id)} disabled={!!actionLoading[w._id]} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRejectModal(w._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {w.status === 'APPROVED' && (
                          <button onClick={() => handlePaid(w._id)} disabled={!!actionLoading[w._id]} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors" title="Mark Paid">
                            <Banknote className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.totalPages} onPageChange={setPage} />

      {/* Reject Modal */}
      <Modal isOpen={!!rejectModal} onClose={() => { setRejectModal(null); setRejectionReason(''); }} title="Reject Withdrawal" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">Optionally provide a reason for rejection:</p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="Rejection reason (optional)"
            className="input-field resize-none"
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={!!actionLoading[rejectModal]} onClick={handleReject}>Reject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
