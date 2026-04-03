"use client"
import AlertViewer from "@/components/alert-viewer"
import { useEffect, useState } from "react"

async function getAlertData(accessCode: string, page: number = 0) {

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alert/${accessCode}?page=` + page, {
    })
    if (!response.ok) {
      return null
    }
    return response.json()
  } catch (error) {
    console.error("Failed to fetch alert data:", error)
    return null
  }
}


interface Alert {
  id: number
  accessCode: string
  userId: number
  createdAt: string
  updatedAt: string
  audio: Array<{
    id: number
    base64: string
    createdAt: string
  }>
  image: Array<{
    id: number
    base64: string
    createdAt: string
  }>
  location: Array<{
    id: number
    latitude: number
    longitude: number
    createdAt: string
  }>
}


export default function AlertPage({ alert }: { alert: Alert }) {
  const [loadCount, setLoadCount] = useState(0)
  const [noMoreData, setNoMoreData] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    async function getData() {
      setLoading(true)
      const moreData = await getAlertData(alert.accessCode, loadCount)
      alert.audio.push(...moreData.alert.audio)
      alert.image.push(...moreData.alert.image)
      alert.location.push(...moreData.alert.location)
      if (moreData.alert.audio.length === 0 && moreData.alert.image.length === 0 && moreData.alert.location.length === 0) {
        setNoMoreData(true)
      }
      await new Promise(r => setTimeout(r, 1000))
      setLoading(false)

    }
    getData()
  }, [loadCount])
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <AlertViewer alert={alert} />
      </div>

      <div className="flex justify-center items-center w-full">
        {!noMoreData && (
          !loading ?
            <div onClick={() => setLoadCount(loadCount + 1)} className="flex justify-center items-center h-16 w-28 bg-red-400 rounded-md dark:bg-gray-800 text-black dark:text-gray-400 cursor-pointer">
              Load More
            </div >
            :
            <div className="flex justify-center items-center h-16 w-28 bg-red-400 rounded-md dark:bg-gray-800 text-black dark:text-gray-400 cursor-pointer">Loading.....
            </div>)
        }

      </div>
    </main >
  )
}

