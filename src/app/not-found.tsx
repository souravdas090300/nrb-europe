import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition inline-block font-semibold"
          >
            Back to Homepage
          </Link>
          <Link
            href="/en/search"
            className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition inline-block font-semibold"
          >
            Search Articles
          </Link>
        </div>
      </div>
    </main>
  )
}
