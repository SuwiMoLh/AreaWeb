"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface ListingGalleryProps {
  images: string[]
  title: string
}

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleOpenImage = (index: number) => {
    setCurrentIndex(index)
    setOpen(true)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // ถ้าไม่มีรูปภาพ ให้ใช้รูปภาพตัวอย่าง
  if (images.length === 0) {
    images.push("/diverse-landscapes.png")
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden">
        {/* รูปภาพหลัก */}
        <div className="relative w-full h-[400px] cursor-pointer" onClick={() => handleOpenImage(0)}>
          <Image src={images[0] || "/placeholder.svg"} alt={title} fill className="object-cover" priority />
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {images.length} รูป
          </div>
        </div>

        {/* รูปภาพย่อย (ถ้ามีมากกว่า 1 รูป) */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 p-2">
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative w-full h-24 cursor-pointer" onClick={() => handleOpenImage(index)}>
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${title} - รูปที่ ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                {index === 3 && images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <span className="text-white font-medium">+{images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal สำหรับดูรูปขนาดใหญ่ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none">
          <div className="relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/70 text-white p-2 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative w-full h-[80vh]">
              <Image
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`${title} - รูปที่ ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-2 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/70 text-white p-2 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
