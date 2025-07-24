import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// สร้าง Supabase client ด้วย service role key เพื่อข้าม RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // ตรวจสอบว่ามี URL และ Key ของ Supabase หรือไม่
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase URL or Service Key")
      return NextResponse.json({ error: "การตั้งค่าเซิร์ฟเวอร์ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ" }, { status: 500 })
    }

    // แปลง request เป็น FormData
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json({ error: "ไม่สามารถอ่านข้อมูลฟอร์มได้" }, { status: 400 })
    }

    // ตรวจสอบว่ามีไฟล์หรือไม่
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 })
    }

    // ตรวจสอบว่าเป็นไฟล์รูปภาพหรือไม่
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น" }, { status: 400 })
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน
    const fileExt = file.name.split(".").pop() || "jpg"
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = fileName

    // ตรวจสอบว่ามี bucket "listings" หรือไม่
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets()

      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError)
        return NextResponse.json({ error: `ไม่สามารถตรวจสอบ storage buckets: ${bucketsError.message}` }, { status: 500 })
      }

      const listingsBucket = buckets?.find((bucket) => bucket.name === "listings")

      // ถ้าไม่มี bucket ให้สร้างใหม่
      if (!listingsBucket) {
        const { error: createBucketError } = await supabaseAdmin.storage.createBucket("listings", {
          public: true,
        })

        if (createBucketError) {
          console.error("Error creating bucket:", createBucketError)
          return NextResponse.json(
            { error: `ไม่สามารถสร้าง storage bucket: ${createBucketError.message}` },
            { status: 500 },
          )
        }
      }
    } catch (error: any) {
      console.error("Error checking/creating bucket:", error)
      return NextResponse.json({ error: `เกิดข้อผิดพลาดในการตรวจสอบ/สร้าง bucket: ${error.message}` }, { status: 500 })
    }

    // อัปโหลดไฟล์
    try {
      const { error: uploadError } = await supabaseAdmin.storage.from("listings").upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return NextResponse.json({ error: `ไม่สามารถอัปโหลดไฟล์: ${uploadError.message}` }, { status: 500 })
      }
    } catch (error: any) {
      console.error("Error during upload:", error)
      return NextResponse.json({ error: `เกิดข้อผิดพลาดระหว่างการอัปโหลด: ${error.message}` }, { status: 500 })
    }

    // สร้าง public URL
    try {
      const { data: urlData } = supabaseAdmin.storage.from("listings").getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        return NextResponse.json({ error: "ไม่สามารถสร้าง URL สาธารณะได้" }, { status: 500 })
      }

      // ส่งคืนข้อมูลในรูปแบบ JSON
      return NextResponse.json({
        success: true,
        imageUrl: urlData.publicUrl,
        fileName: filePath,
      })
    } catch (error: any) {
      console.error("Error getting public URL:", error)
      return NextResponse.json({ error: `ไม่สามารถสร้าง URL สาธารณะ: ${error.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Unhandled server error:", error)
    // ส่งคืนข้อผิดพลาดในรูปแบบ JSON
    return NextResponse.json({ error: `เกิดข้อผิดพลาดที่ไม่คาดคิด: ${error.message || "Unknown error"}` }, { status: 500 })
  }
}
