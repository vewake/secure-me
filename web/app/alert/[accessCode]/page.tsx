import AlertComponent from "@/components/alertPage"
import { notFound } from "next/navigation"

async function getAlertData(accessCode: string, page: number = 0) {

  try {
    const response = await fetch(`${process.env.API_URL}/alert/${accessCode}?page=` + page, {
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

export default async function AlertPage({ params }: any) {
  const { accessCode } = await params
  const alertData = await getAlertData(accessCode)
  if (!alertData) {
    return notFound()
  }

  return (
    <AlertComponent alert={alertData.alert} />
  )
}

