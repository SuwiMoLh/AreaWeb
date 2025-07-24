"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(formData: FormData) {
  try {
    const listingId = formData.get("listingId") as string

    if (!listingId) {
      return { success: false, error: "ข้อมูลไม่ครบถ้วน" }
    }

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด" }
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
      return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะรายการโปรด" }
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
        return { success: false, error: "ไม่สามารถลบรายการโปรดได้" }
      }

      // Revalidate paths
      revalidatePath("/favorites")
      revalidatePath("/listings")
      revalidatePath(`/listings/${listingId}`)

      return { success: true, isFavorite: false, message: "ลบออกจากรายการโปรดแล้ว" }
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
        return { success: false, error: "ไม่สามารถเพิ่มรายการโปรดได้" }
      }

      // Revalidate paths
      revalidatePath("/favorites")
      revalidatePath("/listings")
      revalidatePath(`/listings/${listingId}`)

      return { success: true, isFavorite: true, message: "เพิ่มในรายการโปรดแล้ว" }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกรายการโปรด" }
  }
}

export async function getFavoriteStatus(userId: string, listingId: string) {
  try {
    if (!userId || !listingId) {
      return { isFavorite: false }
    }

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("listing_id", listingId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking favorite status:", error)
      return { isFavorite: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะรายการโปรด" }
    }

    return { isFavorite: !!data }
  } catch (error) {
    console.error("Error getting favorite status:", error)
    return { isFavorite: false, error: "เกิดข้อผิดพลาดในการตรวจสอบสถานะรายการโปรด" }
  }
}
