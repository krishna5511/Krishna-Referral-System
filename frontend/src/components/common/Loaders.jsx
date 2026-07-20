import { clsx } from 'clsx';

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' };
  return (
    <div className={clsx('animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600', sizes[size], className)} />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function CardLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton h-4 w-24 mb-3 rounded" />
          <div className="skeleton h-8 w-16 mb-2 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableLoader({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className={clsx('skeleton h-4 rounded', j === 0 ? 'w-8' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ProfileLoader() {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="skeleton w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
          <div className="skeleton h-4 w-40 rounded" />
        </div>
      </div>
    </div>
  );
}

export function NotificationLoader({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="skeleton w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
