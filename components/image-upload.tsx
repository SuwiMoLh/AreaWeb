"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void
  maxImages?: number
  initialImages?: string[]
}

export function ImageUpload({ onImagesChange, maxImages = 5, initialImages = [] }: ImageUploadProps) {
  const { toast } = useToast()
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // เมื่อมีการเปลี่ยนแปลง uploadedImageUrls ให้ส่งค่าไปยัง parent component
    onImagesChange(uploadedImageUrls)
  }, [uploadedImageUrls, onImagesChange])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // ตรวจสอบจำนวนรูปภาพทั้งหมด
      const totalImages = images.length + e.target.files.length
      if (totalImages > maxImages) {
        toast({
          title: "เกินจำนวนรูปภาพที่กำหนด",
          description: `คุณสามารถอัปโหลดได้สูงสุด ${maxImages} รูปเท่านั้น`,
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      const filesArray = Array.from(e.target.files)

      // สร้าง previews ชั่วคราว
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])

      try {
        // อัปโหลดแต่ละไฟล์ไปยัง API
        const uploadPromises = filesArray.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload-listing-image", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "ไม่สามารถอัปโหลดรูปภาพได้")
          }

          return await response.json()
        })

        const results = await Promise.all(uploadPromises)
        const newImageUrls = results.map((result) => result.imageUrl || "/placeholder.svg")

        setUploadedImageUrls([...uploadedImageUrls, ...newImageUrls])
        setImages([...images, ...filesArray])

        toast({
          title: "อัปโหลดสำเร็จ",
          description: `อัปโหลดรูปภาพ ${filesArray.length} รูปสำเร็จ`,
        })
      } catch (error: any) {
        console.error("Upload error:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถอัปโหลดรูปภาพได้",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    const newPreviews = [...previews]
    const newUploadedImageUrls = [...uploadedImageUrls]

    // ลบ URL ของ object ที่สร้างไว้เพื่อป้องกัน memory leak
    URL.revokeObjectURL(previews[index])

    newImages.splice(index, 1)
    newPreviews.splice(index, 1)
    newUploadedImageUrls.splice(index, 1)

    setImages(newImages)
    setPreviews(newPreviews)
    setUploadedImageUrls(newUploadedImageUrls)
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center">
          <Upload className="h-10 w-10 text-gray-500 dark:text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ลากและวางรูปภาพของคุณที่นี่ หรือคลิกเพื่อเรียกดู</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">รูปแบบที่รองรับ: JPG, PNG, WEBP (สูงสุด 10MB ต่อรูป)</p>
          <input
            type="file"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("images")?.click()}
            className="rounded-full"
            disabled={isUploading}
          >
            {isUploading ? "กำลังอัปโหลด..." : "เรียกดูไฟล์"}
          </Button>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview || "/placeholder.svg"}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1.5 transition-all duration-300"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <p className="text-sm text-gray-500">
          {previews.length} รูปภาพ (สูงสุด {maxImages} รูป)
        </p>
      )}
    </div>
  )
}
