import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSingleTicketApi, replyTicketApi } from '../../services/support.api';
import { formatDateTime, getInitials } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loaders';

export default function SupportChat() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await getSingleTicketApi(ticketId);
      setTicket(res.data.ticket);
      setMessages(res.data.messages);
    } catch (err) {
      toast.error('Failed to load ticket.');
      navigate('/support');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const msg = reply.trim();
    if (!msg) return;
    if (msg.length < 1 || msg.length > 3000) {
      toast.error('Message must be between 1 and 3000 characters.');
      return;
    }
    setSending(true);
    try {
      const res = await replyTicketApi(ticketId, { message: msg });
      setMessages(prev => [...prev, res.data.message]);
      setReply('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  const isClosed = ticket?.status === 'CLOSED' || ticket?.status === 'RESOLVED';

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-160px)] fade-in">
      {/* Ticket Header */}
      <div className="card mb-4 flex-shrink-0">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/support')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
              <Badge status={ticket.status} />
              <Badge status={ticket.priority} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{ticket.category}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 mb-4">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-400 py-8">No messages yet.</div>
        ) : messages.map((msg, index) => {
          const isMe = msg.sender?.toString() === user?._id?.toString() || msg.senderModel === 'User';
          const isAdmin = msg.senderModel === 'Admin' || msg.senderType === 'ADMIN';
          return (
            <div key={msg._id || index} className={`flex gap-3 ${isMe && !isAdmin ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${isAdmin ? 'bg-purple-500' : 'bg-indigo-500'}`}>
                {isAdmin ? 'A' : getInitials(user?.name)}
              </div>
              <div className={`max-w-[75%] ${isMe && !isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isAdmin
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    : isMe
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.message}
                </div>
                <p className="text-xs text-slate-400 mt-1 px-1">{formatDateTime(msg.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply Input */}
      {isClosed ? (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-center text-sm text-slate-500 dark:text-slate-400">
          This ticket is {ticket.status.toLowerCase()}. You cannot reply.
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex gap-3 flex-shrink-0">
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="input-field flex-1 resize-none"
          />
          <Button type="submit" loading={sending} disabled={!reply.trim()} className="flex-shrink-0 self-end">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
