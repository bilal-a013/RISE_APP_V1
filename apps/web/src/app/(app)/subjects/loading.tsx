export default function SubjectsLoading() {
  return (
    <div className="rise-page">
      <div className="mb-6">
        <div className="h-7 w-28 bg-gray-200 rounded-full animate-pulse mb-2" />
        <div className="h-4 w-44 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card-solid p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100/50 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-primary-100/50 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
