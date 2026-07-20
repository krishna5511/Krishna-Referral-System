import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, MessageSquare, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyTicketsApi, createTicketApi } from '../../services/support.api';
import { createTicketSchema } from '../../validation/support.validation';
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES, SUPPORT_STATUSES } from '../../utils/constants';
import { formatDate, timeAgo } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { TableLoader } from '../../components/common/Loaders';
import Input from '../../components/common/Input';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await getMyTicketsApi(params);
      setTickets(res.data.tickets);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, [page, statusFilter]);

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      const res = await createTicketApi(data);
      toast.success(res.data.message);
      setShowCreate(false);
      reset();
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Support Center</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get help from our support team</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" /> Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!statusFilter ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
          All
        </button>
        {SUPPORT_STATUSES.map(s => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? <TableLoader rows={5} cols={4} /> : tickets.length === 0 ? (
          <div className="card">
            <EmptyState type="tickets" title="No tickets yet" message="Create a support ticket to get help from our team." action={
              <Button onClick={() => setShowCreate(true)} size="sm"><Plus className="w-4 h-4" /> Create Ticket</Button>
            } />
          </div>
        ) : tickets.map(ticket => (
          <Link key={ticket._id} to={`/support/${ticket._id}`} className="card block hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{ticket.ticketNumber}</span>
                  <Badge status={ticket.status} />
                  <Badge status={ticket.priority} />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{ticket.lastMessage}</p>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="text-right">
                  <p className="text-xs text-slate-500">{timeAgo(ticket.updatedAt)}</p>
                  {ticket.unreadForUser > 0 && (
                    <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {ticket.unreadForUser}
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={pagination?.totalPages} onPageChange={setPage} />

      {/* Create Ticket Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); reset(); }} title="Create Support Ticket" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Subject"
            placeholder="Brief description of your issue"
            error={errors.subject?.message}
            required
            {...register('subject')}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <select className="input-field" {...register('category')}>
                <option value="">Select category</option>
                {SUPPORT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input-field" {...register('priority')}>
                {SUPPORT_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={5}
              placeholder="Describe your issue in detail (min 10 characters)"
              className="input-field resize-none"
              {...register('description')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowCreate(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={creating} className="flex-1">Create Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
