// Skeleton shapes for each content type — consistent shimmer effect across the app

function Shimmer({ className }: { className: string }) {
  return <div className={`bg-border/60 rounded animate-pulse ${className}`} />;
}

export function SkeletonAssetRow() {
  return (
    <div className="card p-4 flex items-center gap-3">
      {/* Icon */}
      <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
      {/* Text */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Shimmer className="h-3.5 w-16" />
          <Shimmer className="h-3 w-10 rounded-full" />
        </div>
        <Shimmer className="h-3 w-32" />
      </div>
      {/* Button */}
      <Shimmer className="h-7 w-16 rounded-lg flex-shrink-0" />
    </div>
  );
}

export function SkeletonDashboardRow() {
  return (
    <div className="card p-4 flex items-center gap-3">
      <Shimmer className="w-9 h-9 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-20" />
        <Shimmer className="h-3 w-36" />
      </div>
      <Shimmer className="w-4 h-4 rounded flex-shrink-0" />
    </div>
  );
}

export function SkeletonNewsCard() {
  return (
    <div className="card p-4 space-y-2">
      {/* Meta row */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-4 w-12 rounded" />
        <Shimmer className="h-4 w-14 rounded" />
        <Shimmer className="h-3 w-10 rounded ml-auto" />
      </div>
      {/* Title lines */}
      <Shimmer className="h-3.5 w-full" />
      <Shimmer className="h-3.5 w-4/5" />
      {/* Link indicator */}
      <Shimmer className="h-3 w-24 mt-1" />
    </div>
  );
}

export function SkeletonChartPage() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shimmer className="w-4 h-4 rounded" />
            <Shimmer className="h-5 w-20" />
            <Shimmer className="h-4 w-12 rounded-full" />
          </div>
          <Shimmer className="h-3.5 w-40 ml-6" />
        </div>
        <Shimmer className="h-8 w-20 rounded-xl flex-shrink-0" />
      </div>
      {/* Period selector */}
      <Shimmer className="h-9 w-full rounded-xl" />
      {/* Chart */}
      <Shimmer className="h-80 w-full rounded-2xl" />
      {/* Hint bar */}
      <Shimmer className="h-9 w-full rounded-xl" />
      {/* Events */}
      <Shimmer className="h-3.5 w-36" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4 flex items-start gap-3">
            <Shimmer className="h-5 w-20 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3.5 w-full" />
              <Shimmer className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
