import { Inbox, Bell, CreditCard, Users, LifeBuoy, Trophy, Search } from 'lucide-react';

const iconMap = {
  notifications: Bell,
  withdrawals: CreditCard,
  referrals: Users,
  tickets: LifeBuoy,
  leaderboard: Trophy,
  search: Search,
  default: Inbox,
};

export default function EmptyState({ type = 'default', title, message, action }) {
  const Icon = iconMap[type] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        {message || 'No items to display at the moment.'}
      </p>
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  );
}
