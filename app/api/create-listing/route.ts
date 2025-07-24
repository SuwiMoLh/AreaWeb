import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// สร้าง Supabase client ด้วย service role key เพื่อข้าม RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const cookieStore = cookies()

    // ดึง session ของผู้ใช้
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    })

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนสร้างรายการ" }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // ตรวจสอบว่ามีตาราง listings หรือไม่
    const { error: tableCheckError } = await supabaseAdmin.from("listings").select("id").limit(1)

    // ถ้าไม่มีตาราง listings ให้สร้างใหม่
    if (tableCheckError) {
      // สร้างตาราง listings
      const { error: createTableError } = await supabaseAdmin.rpc("create_listings_table")

      if (createTableError) {
        console.error("Error creating listings table:", createTableError)
        return NextResponse.json({ error: "ไม่สามารถสร้างตารางรายการได้" }, { status: 500 })
      }
    }

    // เพิ่มข้อมูลลงในตาราง listings
    const { error: insertError, data: insertData } = await supabaseAdmin
      .from("listings")
      .insert({
        title: data.title,
        description: data.description,
        property_type: data.propertyType,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        price: data.price,
        size: data.size,
        zoning: data.zoning,
        images: data.images,
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()

    if (insertError) {
      console.error("Error inserting listing:", insertError)
      return NextResponse.json({ error: `ไม่สามารถสร้างรายการได้: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      listing: insertData[0],
    })
  } catch (error: any) {
    console.error("Server error:", error)
    return NextResponse.json({ error: `เกิดข้อผิดพลาดในการสร้างรายการ: ${error.message}` }, { status: 500 })
  }
}
