"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Image {
  id: number
  base64: string
  createdAt: string
}

interface ImageGalleryProps {
  images: Image[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null)

  const handlePrevious = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    setSelectedImage(images[prevIndex])
  }

  const handleNext = () => {
    if (!selectedImage) return
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id)
    const nextIndex = (currentIndex + 1) % images.length
    setSelectedImage(images[nextIndex])
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative cursor-pointer overflow-hidden rounded-md"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={`data:image/jpeg;base64,${image.base64}`}
              alt={`Image captured at ${new Date(image.createdAt).toLocaleString()}`}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <p className="text-xs text-white">{new Date(image.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 sm:p-0">
          <div className="relative flex h-full w-full flex-col">
            <div className="absolute right-2 top-2 z-10">
              <button
                onClick={() => setSelectedImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedImage && (
              <>
                <div className="relative flex h-[70vh] w-full items-center justify-center bg-black">
                  <img
                    src={`data:image/jpeg;base64,${selectedImage.base64}`}
                    alt={`Image captured at ${new Date(selectedImage.createdAt).toLocaleString()}`}
                    className="max-h-full max-w-full object-contain"
                  />

                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Captured: {new Date(selectedImage.createdAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

