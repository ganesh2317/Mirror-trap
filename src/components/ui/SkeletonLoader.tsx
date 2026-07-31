import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'chart' | 'table' | 'stats' | 'feed';
  rows?: number;
  className?: string;
}

function ShimmerBlock({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonLoader({ type = 'card', rows = 3, className }: SkeletonLoaderProps) {
  if (type === 'text') {
    const widths = ['w-full', 'w-4/5', 'w-3/4', 'w-full', 'w-2/3', 'w-5/6'];
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <ShimmerBlock key={i} className={cn('h-4', widths[i % widths.length])} />
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <ShimmerBlock className="h-3 w-28 rounded" />
            <ShimmerBlock className="h-10 w-20 rounded-lg" />
            <ShimmerBlock className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className={cn('space-y-2.5', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-3 border border-border/40 bg-bg-surface/30">
            <ShimmerBlock className="h-4 w-4 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <ShimmerBlock className="h-3.5 w-3/4 rounded" />
              <ShimmerBlock className="h-2.5 w-1/2 rounded" />
            </div>
            <ShimmerBlock className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        <ShimmerBlock className="h-9 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, i) => (
          <ShimmerBlock key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={cn('card p-5 space-y-4', className)}>
        <div className="flex items-center justify-between">
          <ShimmerBlock className="h-4 w-32 rounded" />
          <ShimmerBlock className="h-6 w-24 rounded-lg" />
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <ShimmerBlock className="h-48 w-full" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bg-card to-transparent" />
        </div>
      </div>
    );
  }

  // card (default)
  return (
    <div className={cn('card p-5 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <ShimmerBlock className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <ShimmerBlock className="h-3 w-24" />
          <ShimmerBlock className="h-6 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-4/5" />
        <ShimmerBlock className="h-4 w-3/4" />
      </div>
    </div>
  );
}
