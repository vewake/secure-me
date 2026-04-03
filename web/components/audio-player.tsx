"use client"

import { useEffect, useRef, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Pause, Play, Volume2 } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface AudioPlayerProps {
  audioData: string
  createdAt: string
}

export function AudioPlayer({ audioData, createdAt }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = new Audio(`data:audio/mp3;base64,${audioData}`)
    audioRef.current = audio

    const setAudioData = () => {
      setDuration(audio.duration)
    }

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("loadedmetadata", setAudioData)
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [audioData])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <div>
            <p className="text-sm font-medium">Audio Recording</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} className="w-20" />
        </div>
      </div>

      <div className="space-y-2">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.01}
          onValueChange={handleTimeChange}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{duration ? formatTime(duration) : "--:--"}</span>
        </div>
      </div>
    </div>
  )
}

