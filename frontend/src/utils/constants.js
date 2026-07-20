// Notification types from backend model
export const NOTIFICATION_TYPES = [
  'WELCOME', 'EMAIL_VERIFIED', 'PROFILE_COMPLETED',
  'REFERRAL_JOINED', 'REFERRAL_REWARD', 'AMBASSADOR_LEVEL_UP',
  'WITHDRAWAL_REQUESTED', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'WITHDRAWAL_PAID',
  'SUPPORT_CREATED', 'SUPPORT_REPLY',
  'ACCOUNT_BLOCKED', 'ACCOUNT_UNBLOCKED', 'ADMIN_ANNOUNCEMENT',
  'LOGIN_ALERT', 'PASSWORD_CHANGED',
];

// Support categories
export const SUPPORT_CATEGORIES = [
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'UNBLOCK_REQUEST', label: 'Unblock Request' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'PROFILE', label: 'Profile' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'BUG', label: 'Bug Report' },
  { value: 'FEATURE_REQUEST', label: 'Feature Request' },
  { value: 'OTHER', label: 'Other' },
];

export const SUPPORT_PRIORITIES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export const SUPPORT_STATUSES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_USER', label: 'Waiting for User' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const WITHDRAWAL_STATUSES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const AMBASSADOR_LEVELS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

export const ROLES = ['USER', 'AMBASSADOR', 'ADMIN'];
