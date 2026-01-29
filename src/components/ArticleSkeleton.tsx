export default function ArticleSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  )
}
