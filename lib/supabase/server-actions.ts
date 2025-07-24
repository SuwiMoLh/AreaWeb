import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function getUserMetadata(userId: string) {
  const supabase = createServerActionClient<Database>({ cookies })

  try {
    // ดึงข้อมูลผู้ใช้จาก auth.users
    const { data: userData, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      console.error("Error fetching user metadata:", error)
      return null
    }

    return userData?.user?.user_metadata || null
  } catch (error) {
    console.error("Error in getUserMetadata:", error)
    return null
  }
}
