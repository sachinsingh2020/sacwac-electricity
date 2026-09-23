/**
 * Reusable loading components used throughout the app.
 */

/** Inline spinner circle - use inside buttons or inline text */
export function Spinner({ size = 'sm', color = 'white' }) {
  const sizeClass = size === 'lg' ? 'w-6 h-6 border-[3px]' : size === 'md' ? 'w-5 h-5 border-2' : 'w-4 h-4 border-2';
  const colorClass = color === 'amber' ? 'border-amber-500 border-t-transparent' : 'border-white border-t-transparent';
  return (
    <div className={`${sizeClass} ${colorClass} rounded-full animate-spin shrink-0`} />
  );
}

/** Full-screen centered loading overlay */
export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-400/40 animate-pulse">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h6.5L11 22l8.91-9.96A1 1 0 0 0 19 10.5H12.5L13 2z" />
        </svg>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-[2.5px] border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
    </div>
  );
}

/** Skeleton shimmer card - for tenant list */
export function TenantCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 overflow-hidden relative">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-24 bg-slate-200 rounded-lg shimmer" />
          <div className="h-5 w-36 bg-slate-200 rounded-lg shimmer" />
        </div>
        <div className="h-7 w-20 bg-slate-200 rounded-xl shimmer" />
      </div>
      <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3">
        <div className="h-10 bg-slate-200 rounded-lg shimmer" />
        <div className="h-10 bg-slate-200 rounded-lg shimmer" />
      </div>
      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <div className="h-9 flex-1 bg-slate-200 rounded-xl shimmer" />
        <div className="h-9 w-24 bg-slate-200 rounded-xl shimmer" />
      </div>
    </div>
  );
}

/** Skeleton shimmer row - for reading history */
export function ReadingRowSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-40 bg-slate-200 rounded-lg shimmer" />
        <div className="h-6 w-16 bg-slate-200 rounded-full shimmer" />
      </div>
      <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-slate-50 rounded-xl">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-10 bg-slate-200 rounded-lg shimmer" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-7 w-32 bg-slate-200 rounded-xl shimmer" />
        <div className="h-7 w-24 bg-slate-200 rounded-xl shimmer" />
      </div>
    </div>
  );
}

/** Inline dot pulse - for subtle "loading" states inside text/cards */
export function DotPulse() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}
