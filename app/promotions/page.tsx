"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Tag, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

// ข้อมูลจำลองสำหรับโปรโมชัน
const mockPromotions = [
  {
    id: 1,
    title: "ส่วนลด 20% สำหรับการโปรโมทรายการ",
    description: "รับส่วนลด 20% สำหรับการโปรโมทรายการที่ดินของคุณในเดือนนี้",
    image: "/placeholder.svg?key=qerid",
    expiryDate: "31 พฤษภาคม 2568",
    code: "PROMO20",
    used: false,
  },
  {
    id: 2,
    title: "ฟรีค่าธรรมเนียมสำหรับสมาชิกใหม่",
    description: "สมาชิกใหม่รับสิทธิ์ยกเว้นค่าธรรมเนียมการลงประกาศครั้งแรก",
    image: "/placeholder.svg?key=z58q7",
    expiryDate: "ไม่มีกำหนด",
    code: "NEWUSER",
    used: false,
  },
  {
    id: 3,
    title: "แพ็คเกจพรีเมียม 3 เดือนในราคาพิเศษ",
    description: "อัปเกรดเป็นสมาชิกพรีเมียมเป็นเวลา 3 เดือนในราคาพิเศษ ประหยัดถึง 30%",
    image: "/premium-subscription-benefits.png",
    expiryDate: "15 มิถุนายน 2568",
    code: "PREMIUM30",
    used: false,
  },
]

export default function PromotionsPage() {
  const { t } = useTranslation()
  const { session, isLoading } = useSupabase()
  const { toast } = useToast()
  const [promotions, setPromotions] = useState(mockPromotions)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    if (!isLoading && !session) {
      setShowLoginPrompt(true)
    } else {
      setShowLoginPrompt(false)
    }
  }, [isLoading, session])

  // แสดงหน้าโหลดระหว่างตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดโปรโมชัน...</p>
        </div>
      </div>
    )
  }

  // แสดงข้อความให้ล็อกอินถ้าไม่มี session
  if (showLoginPrompt) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30 text-center">
          <div className="mb-6">
            <Tag className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">คุณต้องเข้าสู่ระบบก่อนเข้าถึงโปรโมชัน</p>
          <Button
            className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
            onClick={() => (window.location.href = "/login")}
          >
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    )
  }

  const handleUsePromotion = (id: number) => {
    // คัดลอกรหัสโปรโมชันไปยังคลิปบอร์ด
    const promotion = promotions.find((p) => p.id === id)
    if (promotion) {
      navigator.clipboard.writeText(promotion.code)
      toast({
        title: "คัดลอกรหัสโปรโมชันแล้ว",
        description: `รหัสโปรโมชัน ${promotion.code} ถูกคัดลอกไปยังคลิปบอร์ดแล้ว`,
      })

      // อัปเดตสถานะการใช้งานโปรโมชัน
      setPromotions(promotions.map((p) => (p.id === id ? { ...p, used: true } : p)))
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex items-center mb-6">
          <Tag className="h-6 w-6 mr-2" />
          <h1 className="text-3xl font-semibold tracking-tight">โปรโมชันพิเศษ</h1>
        </div>

        <div className="space-y-6">
          {promotions.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-medium mb-2">ไม่มีโปรโมชันในขณะนี้</h3>
              <p className="text-gray-600 dark:text-gray-400">โปรดกลับมาตรวจสอบในภายหลัง</p>
            </div>
          ) : (
            promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-lg border border-gray-200/30 dark:border-gray-800/30 transition-all hover:shadow-xl"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-1/3 h-48 md:h-auto">
                    <Image
                      src={promotion.image || "/placeholder.svg"}
                      alt={promotion.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-2/3 flex flex-col">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">{promotion.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{promotion.description}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      หมดเขต: {promotion.expiryDate}
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                        <span className="font-mono font-medium">{promotion.code}</span>
                      </div>
                      <Button
                        onClick={() => handleUsePromotion(promotion.id)}
                        disabled={promotion.used}
                        className={`rounded-full ${
                          promotion.used
                            ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                            : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                        }`}
                      >
                        {promotion.used ? "ใช้งานแล้ว" : "ใช้โปรโมชัน"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
