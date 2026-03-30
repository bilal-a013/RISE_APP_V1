export default function SubjectLoading() {
  return (
    <div className="rise-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
        <div>
          <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rise-card">
            <div className="h-5 w-40 bg-gray-200 rounded-full animate-pulse mb-3" />
            <div className="h-1.5 bg-gray-100 rounded-full mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50">
                  <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-36 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
