import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-6xl font-bold text-red-600 dark:text-red-500">404</h1>
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Alert Not Found</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The SOS alert you&apos;re looking for doesn&apos;t exist or has expired.
        </p>
        <Link
          href="/"
          className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}

