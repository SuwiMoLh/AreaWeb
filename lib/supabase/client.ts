import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// สร้าง singleton instance สำหรับใช้ทั่วไปใน client components
export const supabase = createClientComponentClient<Database>()
