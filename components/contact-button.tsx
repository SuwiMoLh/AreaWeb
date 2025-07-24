"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface ContactButtonProps {
  sellerId: string
  listingId?: string
  className?: string
}

export default function ContactButton({ sellerId, listingId, className }: ContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleContact = async () => {
    setIsLoading(true)

    try {
      // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "กรุณาเข้าสู่ระบบ",
          description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถส่งข้อความได้",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const currentUserId = session.user.id

      // ตรวจสอบว่าเป็นผู้ขายเองหรือไม่
      if (currentUserId === sellerId) {
        toast({
          title: "ไม่สามารถส่งข้อความถึงตัวเองได้",
          description: "คุณไม่สามารถส่งข้อความถึงตัวเองได้",
          variant: "destructive",
        })
        return
      }

      // ตรวจสอบว่ามีการสนทนาอยู่แล้วหรือไม่
      const { data: existingConversation, error: fetchError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(buyer_id.eq.${currentUserId},seller_id.eq.${sellerId}),and(buyer_id.eq.${sellerId},seller_id.eq.${currentUserId})`,
        )
        .eq("listing_id", listingId)
        .maybeSingle()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      let conversationId

      if (existingConversation) {
        // ใช้การสนทนาที่มีอยู่แล้ว
        conversationId = existingConversation.id
      } else {
        // สร้างการสนทนาใหม่
        const { data: newConversation, error: insertError } = await supabase
          .from("conversations")
          .insert({
            buyer_id: currentUserId,
            seller_id: sellerId,
            listing_id: listingId,
          })
          .select("id")
          .single()

        if (insertError) {
          throw new Error(insertError.message)
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

  return (
    <Button onClick={handleContact} className={className} disabled={isLoading}>
      <MessageSquare className="mr-2 h-4 w-4" />
      {isLoading ? "กำลังดำเนินการ..." : "ส่งข้อความถึงผู้ขาย"}
    </Button>
  )
}
