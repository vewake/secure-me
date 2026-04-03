"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { MapContainer } from "@/components/map-container"
import { ImageGallery } from "@/components/image-gallery"
import { AudioPlayer } from "@/components/audio-player"
import { AlertCircle, MapPin, ImageIcon, Mic } from "lucide-react"

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

export default function AlertViewer({ alert }: { alert: Alert }) {
  const [activeTab, setActiveTab] = useState("overview")

  const alertTime = new Date(alert.createdAt)
  const timeAgo = formatDistanceToNow(alertTime, { addSuffix: true })

  const latestLocation = alert.location.length > 0 ? alert.location[alert.location.length - 1] : null

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Secure Me</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Alert ID: {alert.accessCode}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>Alert triggered {timeAgo}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="audio">Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Latest Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestLocation ? (
                  <div className="h-[260px] w-full overflow-hidden rounded-md">
                    <MapContainer locations={
                      [latestLocation, { "latitude": 18.5656446, "longitude": 73.7682295, "createdAt": "2025-02-28T20:49:04.761Z" }, { "latitude": 18.4656446, "longitude": 73.5682295, "createdAt": "2025-02-28T20:49:04.761Z" }]
                    } className="h-full w-full" zoom={15} />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No location data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                  Latest Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alert.image.length > 0 ? (
                  <div className="overflow-hidden rounded-md">
                    <img
                      src={`data:image/jpeg;base64,${alert.image[alert.image.length - 1].base64}`}
                      alt="Latest captured image"
                      className="h-[200px] w-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No images available</p>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-purple-500" />
                  Latest Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alert.audio.length > 0 ? (
                  <AudioPlayer
                    audioData={alert.audio[alert.audio.length - 1].base64}
                    createdAt={alert.audio[alert.audio.length - 1].createdAt}
                  />
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No audio recordings available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Location History</CardTitle>
              <CardDescription>Tracking {alert.location.length} location points</CardDescription>
            </CardHeader>
            <CardContent>
              {alert.location.length > 0 ? (
                <div className="h-[500px] w-full overflow-hidden rounded-md">
                  <MapContainer locations={alert.location} className="h-full w-full" showPath={true} />
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No location data available</p>
              )}

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Location Timeline</h3>
                <div className="space-y-3">
                  {alert.location.map((loc, index) => (
                    <div key={loc.id} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Location point {index + 1}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(loc.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Lat: {loc.latitude.toFixed(6)}, Long: {loc.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>{alert.image.length} images captured</CardDescription>
            </CardHeader>
            <CardContent>
              {alert.image.length > 0 ? (
                <ImageGallery images={alert.image} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No images available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Recordings</CardTitle>
              <CardDescription>{alert.audio.length} audio recordings</CardDescription>
            </CardHeader>
            <CardContent>
              {alert.audio.length > 0 ? (
                <div className="space-y-4">
                  {alert.audio.map((audio) => (
                    <div key={audio.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(audio.createdAt).toLocaleString()}
                      </p>
                      <AudioPlayer audioData={audio.base64} createdAt={audio.createdAt} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No audio recordings available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

