"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {

  const [accessCode, setAccessCode] = useState("")
  function handleSubmit(e: any) {
    e.preventDefault()
    router.push(`/alert/${accessCode}`)
  }
  const router = useRouter()
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Secure Me</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Enter an access code to view an alert</p>
          </div>
          <form
            className="mx-auto flex max-w-md flex-col gap-4"
          >
            <input
              type="text"
              name="accessCode"
              onChange={(e) => setAccessCode(e.target.value)}
              value={accessCode}
              placeholder="Enter access code"
              className="rounded-md border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
              onClick={handleSubmit}
            >
              View Alert
            </button>
          </form>
        </div>
        {/* download app apk file button*/}
        <div className="flex justify-center items-center m-8">
          {process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL && (
            <a href={process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL} download="secureme.apk" className="bg-red-500 text-white font-bold px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Download App</a>
          )}
        </div>
      </div>
    </main>
  )
}

