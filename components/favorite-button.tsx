"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorite?: boolean
}

export function FavoriteButton({ listingId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsLoading(true)
    try {
      // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast({
          title: "ต้องเข้าสู่ระบบก่อน",
          description: "กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด",
          variant: "destructive",
        })
        router.push("/login?callbackUrl=/favorites")
        return
      }

      const userId = session.user.id

      // ตรวจสอบว่ารายการนี้เป็นรายการโปรดอยู่แล้วหรือไม่
      const { data: existingFavorite, error: checkError } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", userId)
        .eq("listing_id", listingId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking favorite status:", checkError)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถตรวจสอบสถานะรายการโปรดได้",
          variant: "destructive",
        })
        return
      }

      // ถ้ามีรายการโปรดอยู่แล้ว ให้ลบออก
      if (existingFavorite) {
        const { error: deleteError } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId)

        if (deleteError) {
          console.error("Error removing favorite:", deleteError)
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถลบรายการโปรดได้",
            variant: "destructive",
          })
          return
        }

        setIsFavorite(false)
        toast({
          title: "ลบรายการโปรด",
          description: "ลบออกจากรายการโปรดแล้ว",
        })
      }
      // ถ้ายังไม่มีรายการโปรด ให้เพิ่มเข้าไป
      else {
        const { error: insertError } = await supabase.from("favorites").insert({
          user_id: userId,
          listing_id: listingId,
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          console.error("Error adding favorite:", insertError)
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถเพิ่มรายการโปรดได้",
            variant: "destructive",
          })
          return
        }

        setIsFavorite(true)
        toast({
          title: "เพิ่มรายการโปรด",
          description: "เพิ่มในรายการโปรดแล้ว",
        })

        // นำทางไปยังหน้ารายการโปรด
        // router.push("/favorites")
      }

      // Force refresh to update the UI
      router.refresh()
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกรายการโปรดได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 ${
        isFavorite ? "text-red-500" : "text-gray-700 dark:text-gray-300"
      }`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
    >
      <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  )
}

export default FavoriteButton
