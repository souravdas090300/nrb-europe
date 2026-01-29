import Link from 'next/link'

export default function CategoryNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-4xl font-bold mb-6">Category Not Found</h1>
      <p className="text-xl text-gray-600 mb-8">
        The requested category doesn't exist.
      </p>
      <Link
        href="/"
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition inline-block"
      >
        Back to Homepage
      </Link>
    </div>
  )
}
