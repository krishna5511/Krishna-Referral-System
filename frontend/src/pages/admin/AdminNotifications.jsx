import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, Users, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { sendNotificationApi, sendNotificationToAllApi } from '../../services/notification.api';
import { NOTIFICATION_TYPES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function AdminNotifications() {
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingOne, setSendingOne] = useState(false);
  const [mode, setMode] = useState('all'); // 'all' | 'one'

  const { register: regAll, handleSubmit: handleAll, reset: resetAll, formState: { errors: errAll } } = useForm({ defaultValues: { type: 'ADMIN_ANNOUNCEMENT' } });
  const { register: regOne, handleSubmit: handleOne, reset: resetOne, formState: { errors: errOne } } = useForm({ defaultValues: { type: 'ADMIN_ANNOUNCEMENT' } });

  const onSendAll = async (data) => {
    setSendingAll(true);
    try {
      const res = await sendNotificationToAllApi(data);
      toast.success(res.data.message);
      resetAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSendingAll(false); }
  };

  const onSendOne = async (data) => {
    setSendingOne(true);
    try {
      const res = await sendNotificationApi(data);
      toast.success(res.data.message);
      resetOne();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSendingOne(false); }
  };

  const NotifForm = ({ onSubmit, reg, errs, loading, submitLabel, showUserId = false }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {showUserId && (
        <Input label="User ID" placeholder="MongoDB ObjectId of the user" error={errs.userId?.message}
          {...reg('userId', { required: 'User ID is required' })} />
      )}
      <Input label="Title" placeholder="Notification title" error={errs.title?.message}
        {...reg('title', { required: 'Title is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />
      <div>
        <label className="label">Message <span className="text-red-500">*</span></label>
        <textarea rows={3} placeholder="Notification message" className={`input-field resize-none ${errs.message ? 'input-error' : ''}`}
          {...reg('message', { required: 'Message is required', maxLength: { value: 500, message: 'Max 500 characters' } })} />
        {errs.message && <p className="mt-1 text-xs text-red-500">{errs.message.message}</p>}
      </div>
      <div>
        <label className="label">Type <span className="text-red-500">*</span></label>
        <select className="input-field" {...reg('type', { required: true })}>
          {NOTIFICATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <Input label="Redirect URL (optional)" placeholder="https://..." {...reg('redirectUrl')} />
      <Button type="submit" loading={loading} className="w-full">
        <Send className="w-4 h-4" /> {submitLabel}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Center</h2>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        {[
          { key: 'all', icon: Users, label: 'Send to All Users' },
          { key: 'one', icon: User, label: 'Send to Specific User' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === key ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="card">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          {mode === 'all' ? '📢 Broadcast to All Users' : '👤 Send to Specific User'}
        </h3>
        {mode === 'all' ? (
          <NotifForm
            onSubmit={handleAll(onSendAll)}
            reg={regAll}
            errs={errAll}
            loading={sendingAll}
            submitLabel="Send to All Users"
          />
        ) : (
          <NotifForm
            onSubmit={handleOne(onSendOne)}
            reg={regOne}
            errs={errOne}
            loading={sendingOne}
            submitLabel="Send Notification"
            showUserId
          />
        )}
      </div>
    </div>
  );
}
