import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, UserX, UserCheck, Trash2, Eye, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllUsersApi, blockUserApi, unblockUserApi, deleteUserApi } from '../../services/admin.api';
import { formatDate, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { TableLoader } from '../../components/common/Loaders';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsersApi({ page, limit: 15, search });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const setAction = (id, val) => setActionLoading(prev => ({ ...prev, [id]: val }));

  const handleBlock = async (userId, isBlocked) => {
    setAction(userId, true);
    try {
      const fn = isBlocked ? unblockUserApi : blockUserApi;
      const res = await fn(userId);
      toast.success(res.data.message);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setAction(userId, false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setAction(deleteModal._id, true);
    try {
      await deleteUserApi(deleteModal._id);
      toast.success('User deleted.');
      setDeleteModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally {
      setAction(deleteModal._id, false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
          {pagination && <p className="text-sm text-slate-500">{pagination.totalUsers} total users</p>}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search name, email, username..."
              className="input-field pl-9 w-64"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">Search</Button>
        </form>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? <TableLoader rows={10} cols={6} /> : users.length === 0 ? (
          <div className="p-8"><EmptyState type="search" title="No users found" message="Try adjusting your search query." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="table-th">User</th>
                  <th className="table-th">Role</th>
                  <th className="table-th">Level</th>
                  <th className="table-th">Points</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Joined</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        {u.profileImage?.url ? (
                          <img src={u.profileImage.url} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(u.name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><Badge status={u.role} /></td>
                    <td className="table-td"><Badge status={u.ambassadorLevel} /></td>
                    <td className="table-td font-semibold text-indigo-600 dark:text-indigo-400">{u.rewardPoints}</td>
                    <td className="table-td">
                      <Badge
                        status={u.isBlocked ? 'REJECTED' : 'APPROVED'}
                        label={u.isBlocked ? 'Blocked' : 'Active'}
                      />
                    </td>
                    <td className="table-td text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <Link to={`/admin/users/${u._id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleBlock(u._id, u.isBlocked)}
                          disabled={actionLoading[u._id]}
                          className={`p-1.5 rounded-lg transition-colors ${u.isBlocked ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
                          title={u.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User" size="sm">
        <div className="text-center py-2">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Are you sure you want to delete <strong>{deleteModal?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={actionLoading[deleteModal?._id]} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
