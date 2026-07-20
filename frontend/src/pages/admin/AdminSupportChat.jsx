import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSingleTicketApi, replyTicketApi, updateTicketStatusApi } from '../../services/support.api';
import { formatDateTime, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loaders';
import { SUPPORT_STATUSES } from '../../utils/constants';

export default function AdminSupportChat() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const bottomRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await getSingleTicketApi(ticketId);
      setTicket(res.data.ticket);
      setMessages(res.data.messages);
    } catch {
      toast.error('Ticket not found.'); navigate('/admin/support');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = reply.trim();
    if (!msg) return;
    setSending(true);
    try {
      const res = await replyTicketApi(ticketId, { message: msg });
      setMessages(prev => [...prev, res.data.message]);
      setReply('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSending(false); }
  };

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      const res = await updateTicketStatusApi(ticketId, { status });
      setTicket(t => ({ ...t, status }));
      toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setUpdatingStatus(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)] fade-in">
      {/* Header */}
      <div className="card mb-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button onClick={() => navigate('/admin/support')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
                <Badge status={ticket.status} />
                <Badge status={ticket.priority} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
              <p className="text-xs text-slate-500">by {ticket.user?.name} · {ticket.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={ticket.status}
              onChange={e => handleStatusChange(e.target.value)}
              disabled={updatingStatus}
              className="input-field text-xs py-1.5 w-auto"
            >
              {SUPPORT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 mb-4">
        {messages.map((msg, index) => {
          const isAdminMsg = msg.senderModel === 'Admin' || msg.senderType === 'ADMIN';
          return (
            <div key={msg._id || index} className={`flex gap-3 ${isAdminMsg ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isAdminMsg ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                {isAdminMsg ? 'A' : getInitials(ticket.user?.name || 'U')}
              </div>
              <div className={`max-w-[75%] flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isAdminMsg ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`}>
                  {msg.message}
                </div>
                <p className="text-xs text-slate-400 mt-1 px-1">{formatDateTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply */}
      <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0">
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
          placeholder="Type admin reply..."
          rows={2}
          className="input-field flex-1 resize-none"
        />
        <Button type="submit" loading={sending} disabled={!reply.trim()} className="flex-shrink-0 self-end">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
