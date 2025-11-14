export default function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 skeleton rounded" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-square skeleton" />

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 skeleton rounded" />
          <div className="h-6 w-6 skeleton rounded" />
          <div className="h-6 w-6 skeleton rounded" />
        </div>

        <div className="h-4 w-20 skeleton rounded" />

        <div className="space-y-2">
          <div className="h-3 w-full skeleton rounded" />
          <div className="h-3 w-3/4 skeleton rounded" />
        </div>
      </div>
    </div>
  )
}
