export default function LessonLoading() {
  return (
    <div className="rise-page">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-28 bg-gray-200 rounded-full animate-pulse mb-2" />
          <div className="h-5 w-48 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse" />
      </div>
      {/* Hook skeleton */}
      <div className="glass-card border-l-4 border-primary-300/40 p-4 mb-4">
        <div className="h-4 bg-primary-100/50 rounded-full animate-pulse mb-2" />
        <div className="h-4 w-3/4 bg-primary-100/40 rounded-full animate-pulse" />
      </div>
      {/* Block skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card-solid p-5 mb-4">
          <div className="h-4 w-32 bg-primary-100/50 rounded-full animate-pulse mb-3" />
          <div className="space-y-2">
            <div className="h-3 bg-primary-100/40 rounded-full animate-pulse" />
            <div className="h-3 w-4/5 bg-primary-100/40 rounded-full animate-pulse" />
            <div className="h-3 w-2/3 bg-primary-100/40 rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
