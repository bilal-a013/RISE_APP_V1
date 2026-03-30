export default function HomeLoading() {
  return (
    <div className="rise-page">
      <div className="mb-6">
        <div className="h-4 w-24 bg-gray-200 rounded-full animate-pulse mb-2" />
        <div className="h-7 w-40 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <SkeletonCard tall />
      <SkeletonCard />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <SkeletonCard small />
        <SkeletonCard small />
      </div>
    </div>
  )
}

function SkeletonCard({ tall, small }: { tall?: boolean; small?: boolean }) {
  return (
    <div className={`rise-card mb-3 ${tall ? 'h-40' : small ? 'h-24' : 'h-24'}`}>
      <div className="h-full flex flex-col gap-3 justify-center">
        <div className="h-3 w-1/3 bg-gray-100 rounded-full animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-100 rounded-full animate-pulse" />
        {tall && <div className="h-3 w-1/2 bg-gray-100 rounded-full animate-pulse" />}
      </div>
    </div>
  )
}
