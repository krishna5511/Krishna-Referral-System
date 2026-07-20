import { clsx } from 'clsx';

const statusMap = {
  // Withdrawal statuses
  PENDING:  { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger',  label: 'Rejected' },
  PAID:     { variant: 'info',    label: 'Paid' },
  CANCELLED:{ variant: 'gray',   label: 'Cancelled' },
  // Support statuses
  OPEN:              { variant: 'info',    label: 'Open' },
  IN_PROGRESS:       { variant: 'warning', label: 'In Progress' },
  WAITING_FOR_USER:  { variant: 'purple',  label: 'Waiting' },
  RESOLVED:          { variant: 'success', label: 'Resolved' },
  CLOSED:            { variant: 'gray',    label: 'Closed' },
  // Roles
  ADMIN:      { variant: 'purple', label: 'Admin' },
  AMBASSADOR: { variant: 'info',   label: 'Ambassador' },
  USER:       { variant: 'gray',   label: 'User' },
  // Ambassador levels
  BRONZE:   { variant: 'warning', label: 'Bronze' },
  SILVER:   { variant: 'gray',    label: 'Silver' },
  GOLD:     { variant: 'warning', label: 'Gold' },
  PLATINUM: { variant: 'purple',  label: 'Platinum' },
  // Priority
  LOW:    { variant: 'gray',    label: 'Low' },
  MEDIUM: { variant: 'info',    label: 'Medium' },
  HIGH:   { variant: 'warning', label: 'High' },
  URGENT: { variant: 'danger',  label: 'Urgent' },
};

const variantClasses = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  gray:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export default function Badge({ status, variant, label, className = '' }) {
  const config = status ? (statusMap[status] || { variant: 'gray', label: status }) : { variant: variant || 'gray', label: label || '' };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[config.variant],
      className
    )}>
      {config.label || label}
    </span>
  );
}
