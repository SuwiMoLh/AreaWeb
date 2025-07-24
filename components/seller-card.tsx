"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MessageSquare, User, Phone, Mail, Calendar, Copy, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import type { Database } from "@/types/supabase"

interface SellerCardProps {
  sellerId: string
  listingId: string
  currentUserId?: string
  sellerData: any & {
    listingsCount?: number
  }
}

export default function SellerCard({ sellerId, listingId, currentUserId, sellerData }: SellerCardProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()

  // ตรวจสอบว่าเป็นผู้ขายคนเดียวกับผู้ใช้ปัจจุบันหรือไม่
  const isCurrentUser = currentUserId === sellerId

  // คำนวณระยะเวลาตั้งแต่สมัครสมาชิก
  const memberSince = sellerData?.created_at
    ? formatDistanceToNow(new Date(sellerData.created_at), { addSuffix: false, locale: th })
    : "ไม่ระบุ"

  // ฟังก์ชันคัดลอกข้อมูลการติดต่อ
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // ฟังก์ชันสำหรับส่งข้อความถึงผู้ขาย
  const handleSendMessage = async () => {
    if (!currentUserId) {
      // ถ้ายังไม่ได้เข้าสู่ระบบ ให้ redirect ไปหน้า login และกลับมาที่หน้าแชทโดยตรง
      router.push(`/login?redirect=/chat/${sellerId}?listing=${listingId}`)
      return
    }

    setIsLoading(true)

    try {
      // ตรวจสอบว่ามีการสนทนาอยู่แล้วหรือไม่
      const { data: existingConversation, error: searchError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(buyer_id.eq.${currentUserId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${currentUserId})`,
        )
        .maybeSingle()

      if (searchError) {
        throw searchError
      }

      let conversationId

      if (existingConversation) {
        // ถ้ามีการสนทนาอยู่แล้ว ให้ใช้ conversation_id เดิม
        conversationId = existingConversation.id
      } else {
        // ถ้ายังไม่มีการสนทนา ให้สร้างการสนทนาใหม่
        const { data: newConversation, error: createError } = await supabase
          .from("conversations")
          .insert({
            buyer_id: currentUserId,
            seller_id: sellerId,
            listing_id: listingId,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single()

        if (createError) {
          throw createError
        }

        conversationId = newConversation.id
      }

      // นำทางไปยังหน้าแชทกับผู้ขายโดยตรง
      router.push(`/chat/${sellerId}?conversation=${conversationId}`)
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้างการสนทนาได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ตรวจสอบว่ามีข้อมูลการติดต่อหรือไม่
  const hasContactInfo = Boolean(sellerData?.email || sellerData?.phone || sellerData?.line_id)

  if (!sellerData) {
    return (
      <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-500">ไม่พบข้อมูลผู้ขาย</p>
        </CardContent>
      </Card>
    )
  }

  // ตรวจสอบว่ามีรูปโปรไฟล์หรือไม่ (ตรวจสอบทั้ง avatar_url และ auth_avatar_url)
  const avatarUrl = sellerData.auth_avatar_url || sellerData.avatar_url
  const hasAvatar = Boolean(
    avatarUrl && avatarUrl !== "https://example.com/avatar-placeholder.png" && avatarUrl !== "/placeholder.svg",
  )

  return (
    <TooltipProvider>
      <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            {/* อวาตาร์ผู้ขาย */}
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
              {hasAvatar ? (
                <Image
                  src={avatarUrl || "/placeholder.svg"}
                  alt={sellerData.full_name || "ผู้ขาย"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.error("Error loading avatar image:", e)
                    const target = e.target as HTMLImageElement
                    target.src = "/abstract-geometric-shapes.png"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <User className="w-12 h-12 text-gray-400 dark:text-gray-300" />
                </div>
              )}
            </div>

            {/* ชื่อผู้ขาย */}
            <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
              {sellerData.full_name || "ไม่ระบุชื่อ"}
            </h3>

            {/* วันที่สมัครสมาชิก */}
            <div className="flex items-center mb-4 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1.5" />
              <span>สมาชิกมาแล้ว {memberSince}</span>
            </div>

            {/* ข้อมูลการติดต่อ */}
            {hasContactInfo ? (
              <div className="w-full space-y-3 mt-2">
                {sellerData.email && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
                        {sellerData.email}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyToClipboard(sellerData.email!, "email")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === "email" ? (
                            <span className="text-green-500 text-xs">คัดลอกแล้ว!</span>
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>คัดลอกอีเมล</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {sellerData.phone && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{sellerData.phone}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyToClipboard(sellerData.phone!, "phone")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === "phone" ? (
                            <span className="text-green-500 text-xs">คัดลอกแล้ว!</span>
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>คัดลอกเบอร์โทร</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {sellerData.line_id && sellerData.line_id.trim() !== "" && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 group hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-3 text-green-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">LINE: {sellerData.line_id}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyToClipboard(sellerData.line_id!, "line")}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied === "line" ? (
                            <span className="text-green-500 text-xs">คัดลอกแล้ว!</span>
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>คัดลอก LINE ID</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 mt-2 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="text-sm text-yellow-700 dark:text-yellow-400">ผู้ขายยังไม่ได้เพิ่มข้อมูลการติดต่อ</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-3">
          {/* ลบปุ่มดูโปรไฟล์ออก และแทนที่ด้วยข้อมูลเพิ่มเติม */}
          <div className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">รายการที่ดินทั้งหมด</div>
            <div className="text-lg font-semibold">{sellerData.listingsCount || 0} รายการ</div>
          </div>

          {/* ปุ่มส่งข้อความ (ไม่แสดงถ้าเป็นผู้ขายคนเดียวกับผู้ใช้ปัจจุบัน) */}
          {!isCurrentUser && (
            <Button
              className="w-full rounded-xl h-11 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  ส่งข้อความถึงผู้ขาย
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </TooltipProvider>
  )
}
