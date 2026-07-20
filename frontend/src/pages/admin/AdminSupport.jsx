import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllTicketsApi, updateTicketStatusApi, deleteTicketApi } from '../../services/support.api';
import { formatDate, timeAgo } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableLoader } from '../../components/common/Loaders';
import { SUPPORT_STATUSES, SUPPORT_PRIORITIES } from '../../utils/constants';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getAllTicketsApi(params);
      setTickets(res.data.tickets);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Support Tickets</h2>
          {pagination && <p className="text-sm text-slate-500">{pagination.total} total tickets</p>}
        </div>
        <form onSubmit={e => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search tickets..." className="input-field pl-9 w-48" />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ value: '', label: 'All' }, ...SUPPORT_STATUSES].map(s => (
          <button key={s.value} onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <TableLoader rows={8} cols={4} /> : tickets.length === 0 ? (
          <div className="card"><EmptyState type="tickets" title="No tickets" /></div>
        ) : tickets.map(ticket => (
          <Link key={ticket._id} to={`/admin/support/${ticket._id}`} className="card block hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
                  <Badge status={ticket.status} />
                  <Badge status={ticket.priority} />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{ticket.subject}</p>
                <p className="text-xs text-slate-500">
                  by <span className="font-medium">{ticket.user?.name}</span> · {ticket.category}
                </p>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="text-right">
                  <p className="text-xs text-slate-500">{timeAgo(ticket.updatedAt)}</p>
                  {ticket.unreadForAdmin > 0 && (
                    <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{ticket.unreadForAdmin}</span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={pagination?.totalPages} onPageChange={setPage} />
    </div>
  );
}
