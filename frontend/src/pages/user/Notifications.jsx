import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Trash2, CheckCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
} from '../../services/notification.api';
import { setNotifications, markRead, markAllRead, removeNotification } from '../../redux/slices/notificationSlice';
import { timeAgo } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { NotificationLoader } from '../../components/common/Loaders';

const typeIcons = {
  WELCOME: '👋', EMAIL_VERIFIED: '✅', PROFILE_COMPLETED: '🎉',
  REFERRAL_JOINED: '👥', REFERRAL_REWARD: '💰', AMBASSADOR_LEVEL_UP: '🏆',
  WITHDRAWAL_REQUESTED: '💸', WITHDRAWAL_APPROVED: '✅', WITHDRAWAL_REJECTED: '❌', WITHDRAWAL_PAID: '💵',
  SUPPORT_CREATED: '🎫', SUPPORT_REPLY: '💬',
  ACCOUNT_BLOCKED: '🚫', ACCOUNT_UNBLOCKED: '🔓', ADMIN_ANNOUNCEMENT: '📢',
  LOGIN_ALERT: '🔐', PASSWORD_CHANGED: '🔑',
};

export default function Notifications() {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector(s => s.notification);
  const [notifications, setLocalNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getMyNotificationsApi({ page, limit: 15 });
      setLocalNotifications(res.data.notifications);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, [page]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setLocalNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      dispatch(markRead(id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsReadApi();
      setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      dispatch(markAllRead());
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteNotificationApi(id);
      setLocalNotifications(prev => prev.filter(n => n._id !== id));
      dispatch(removeNotification(id));
      toast.success('Notification deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={markingAll} onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <NotificationLoader count={8} />
        ) : notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState type="notifications" title="No notifications" message="You're all caught up! 🎉" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map(n => (
              <div
                key={n._id}
                className={`flex items-start gap-3 p-4 transition-colors ${!n.isRead ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${!n.isRead ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {typeIcons[n.type] || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkRead(n._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    disabled={deletingId === n._id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Pagination
        currentPage={page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
