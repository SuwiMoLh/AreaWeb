"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface ListingMapProps {
  latitude: number
  longitude: number
  address: string
}

export default function ListingMap({ latitude, longitude, address }: ListingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ในโค้ดจริง เราจะใช้ Google Maps หรือ Mapbox API
    // แต่สำหรับตัวอย่างนี้ เราจะใช้ Canvas เพื่อจำลองแผนที่

    if (!mapRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = mapRef.current.clientWidth
    canvas.height = mapRef.current.clientHeight
    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // วาดพื้นหลังแผนที่
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#e0f2fe")
    gradient.addColorStop(1, "#bae6fd")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // วาดเส้นถนน
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 3

    // ถนนแนวนอน
    for (let i = 1; i < 5; i++) {
      const y = (canvas.height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // ถนนแนวตั้ง
    for (let i = 1; i < 5; i++) {
      const x = (canvas.width / 5) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // วาดพื้นที่สีเขียว (ป่า, สวน)
    ctx.fillStyle = "#86efac"
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = 30 + Math.random() * 50

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    // วาดหมุดตำแหน่ง
    const pinX = canvas.width / 2
    const pinY = canvas.height / 2

    // เงาของหมุด
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.arc(pinX, pinY + 5, 10, 0, Math.PI * 2)
    ctx.fill()

    // หมุดสีแดง
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(pinX, pinY, 12, 0, Math.PI * 2)
    ctx.fill()

    // วงกลมสีขาวตรงกลางหมุด
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(pinX, pinY, 5, 0, Math.PI * 2)
    ctx.fill()

    // ข้อความแสดงตำแหน่ง
    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 4
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.strokeText("ตำแหน่งที่ดิน", pinX, pinY - 30)
    ctx.fillText("ตำแหน่งที่ดิน", pinX, pinY - 30)

    // ข้อความแสดงพิกัด
    ctx.font = "12px Arial"
    ctx.fillStyle = "#1e293b"
    ctx.fillText(`พิกัด: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, pinX, pinY + 30)
  }, [latitude, longitude])

  return (
    <div className="relative h-full w-full bg-blue-50">
      <div ref={mapRef} className="h-full w-full"></div>
      <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-md">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-700 dark:text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{address}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              พิกัด: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
