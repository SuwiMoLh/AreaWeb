"use server"

import { createClient } from "@supabase/supabase-js"

// สร้าง Supabase client ด้วย service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function createProfilesBucket() {
  try {
    const { error } = await supabaseAdmin.storage.createBucket("profiles", {
      public: true,
    })

    if (error) {
      console.error("Error creating bucket:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error creating bucket:", error)
    return { success: false, error: error.message }
  }
}
