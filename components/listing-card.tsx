"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Ruler } from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"

interface ListingCardProps {
  id: string
  title: string
  price: number
  location: string
  size: number
  imageUrl: string
  images?: string[]
  isFavorite?: boolean
}

export function ListingCard({ id, title, price, location, size, imageUrl, images, isFavorite }: ListingCardProps) {
  // ฟังก์ชันสำหรับจัดรูปแบบราคา
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `฿${(price / 1000000).toFixed(2)}M`
    } else if (price >= 1000) {
      return `฿${(price / 1000).toFixed(0)}K`
    } else {
      return `฿${price}`
    }
  }

  // ฟังก์ชันสำหรับจัดรูปแบบขนาดที่ดิน
  const formatSize = (size: number) => {
    if (size < 1) {
      // แปลงเป็นตารางวา (1 ไร่ = 400 ตารางวา)
      const squareWah = Math.round(size * 400)
      return `${squareWah} ตร.ว.`
    } else {
      return `${size} ไร่`
    }
  }

  // ใช้รูปภาพแรกจาก images ถ้ามี หรือใช้ imageUrl ถ้าไม่มี
  const displayImage = images && images.length > 0 ? images[0] : imageUrl || "/diverse-property-showcase.png"

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 border-gray-200/50 dark:border-gray-800/50">
      <Link href={`/listings/${id}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={displayImage || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // ถ้าโหลดรูปไม่สำเร็จ ให้ใช้รูปเริ่มต้น
            const target = e.target as HTMLImageElement
            target.src = "/diverse-property-showcase.png"
          }}
        />
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton listingId={id} initialIsFavorite={isFavorite} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <Badge className="bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90">
            {formatPrice(price)}
          </Badge>
        </div>
      </Link>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <Ruler className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm">{size} ไร่</span>
        </div>
      </CardContent>
    </Card>
  )
}
