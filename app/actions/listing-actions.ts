"use server"

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// สร้าง Supabase client สำหรับ server action
const createServerActionClient = () => {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ใช้ service role key เพื่อข้าม RLS
    {
      auth: {
        persistSession: false,
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
}

// ฟังก์ชันสำหรับตรวจสอบการล็อกอิน
export async function checkAuth() {
  try {
    const supabase = createServerActionClient()
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return { authenticated: false, user: null }
    }

    return {
      authenticated: true,
      user: data.session.user,
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return { authenticated: false, user: null }
  }
}

// แก้ไขฟังก์ชัน createListing เพื่อรับ userId จาก client แทนการตรวจสอบ session ใหม่
export async function createListing(formData: FormData) {
  try {
    // สร้าง Supabase client
    const supabase = createServerActionClient()

    // ดึง userId จาก formData ที่ส่งมาจาก client
    const userId = formData.get("userId") as string

    // ตรวจสอบว่ามี userId หรือไม่
    if (!userId) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนสร้างรายการ" }
    }

    console.log("Creating listing with user ID:", userId)

    // ดึงข้อมูลจาก formData
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const propertyType = (formData.get("propertyType") as string) || "vacant"
    const address = (formData.get("address") as string) || "ไม่ระบุที่อยู่"
    const province = formData.get("province") as string
    const district = formData.get("district") as string
    const subdistrict = (formData.get("subdistrict") as string) || ""
    const zipCode = (formData.get("zipCode") as string) || ""
    const price = Number.parseFloat(formData.get("price") as string)
    const size = Number.parseFloat(formData.get("size") as string)
    const zoning = (formData.get("zoning") as string) || ""
    const images = JSON.parse((formData.get("images") as string) || "[]")
    const city = district || "ไม่ระบุเมือง" // ใช้ district เป็น city ถ้าไม่มีการระบุ
    const state = province || "ไม่ระบุจังหวัด" // ใช้ province เป็น state ถ้าไม่มีการระบุ
    const country = "Thailand" // กำหนดค่าเริ่มต้นเป็นประเทศไทย

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !price || !size || !province || !district || !subdistrict || !address) {
      return { success: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อรายการ, ราคา, ขนาด, จังหวัด, อำเภอ, ตำบล, เลขที่)" }
    }

    // แปลงค่า price และ size เป็นตัวเลขที่ปลอดภัยสำหรับฐานข้อมูล
    let safePrice: number
    let safeSize: number

    try {
      // ตรวจสอบว่าค่า price อยู่ในช่วงที่ PostgreSQL สามารถรองรับได้ (integer: -2147483648 ถึง 2147483647)
      const priceValue = Number.parseFloat(formData.get("price") as string)
      safePrice = Math.min(priceValue, 2147483647)

      // ตรวจสอบว่าค่า size อยู่ในช่วงที่ PostgreSQL สามารถรองรับได้
      const sizeValue = Number.parseFloat(formData.get("size") as string)
      safeSize = Math.min(sizeValue, 2147483647)
    } catch (error) {
      console.error("Error parsing numeric values:", error)
      return { success: false, error: "ข้อมูลตัวเลขไม่ถูกต้อง กรุณาตรวจสอบราคาและขนาดที่ดิน" }
    }

    // สร้างข้อมูลสำหรับบันทึกลงฐานข้อมูล
    const listingData = {
      title,
      description,
      property_type: propertyType,
      address,
      province,
      district,
      subdistrict,
      zip_code: zipCode,
      price: safePrice,
      size: safeSize,
      zoning,
      images,
      user_id: userId,
      created_at: new Date().toISOString(),
      location: `${district || "ไม่ระบุอำเภอ"}, ${province || "ไม่ระบุจังหวัด"}`,
      type:
        propertyType === "residential"
          ? "ที่อยู่อาศัย"
          : propertyType === "commercial"
            ? "พาณิชย์"
            : propertyType === "agricultural"
              ? "เกษตรกรรม"
              : propertyType === "industrial"
                ? "อุตสาหกรรม"
                : "ที่ดินเปล่า",
      city, // เพิ่มฟิลด์ city
      state, // เพิ่มฟิลด์ state
      status: "active", // เพิ่มฟิลด์ status
      country, // เพิ่มฟิลด์ country
    }

    console.log("Listing data:", listingData)

    // บันทึกข้อมูลลงในตาราง listings
    const { data, error } = await supabase.from("listings").insert(listingData).select()

    if (error) {
      console.error("Error creating listing:", error)
      return { success: false, error: `ไม่สามารถสร้างรายการได้: ${error.message}` }
    }

    // รีวาลิเดทหน้ารายการที่ดินเพื่อให้แสดงข้อมูลล่าสุด
    revalidatePath("/listings")
    revalidatePath("/profile") // รีวาลิเดทหน้าโปรไฟล์ด้วย

    // ส่งคืนข้อมูลที่สร้างสำเร็จ
    return {
      success: true,
      message: "สร้างรายการที่ดินสำเร็จ",
      listing: data[0],
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return { success: false, error: `เกิดข้อผิดพลาดในการสร้างรายการ: ${error.message}` }
  }
}

// แก้ไขฟังก์ชันลบรายการที่ดิน
export async function deleteListing(formData: FormData) {
  try {
    // สร้าง Supabase client
    const supabase = createServerActionClient()

    // ดึง listingId และ userId จาก formData
    const listingId = formData.get("listingId") as string
    const userId = formData.get("userId") as string

    if (!listingId) {
      return { success: false, error: "ไม่พบรหัสรายการที่ต้องการลบ" }
    }

    if (!userId) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนลบรายการ" }
    }

    console.log("Deleting listing:", listingId, "by user:", userId)

    // ตรวจสอบว่ารายการที่ดินนี้เป็นของผู้ใช้นี้หรือไม่
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single()

    if (listingError) {
      console.error("Error checking listing ownership:", listingError)
      return { success: false, error: `ไม่พบรายการที่ดิน: ${listingError.message}` }
    }

    if (listingData.user_id !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์ลบรายการนี้" }
    }

    // ลบรายการที่ดิน
    const { error: deleteError } = await supabase.from("listings").delete().eq("id", listingId)

    if (deleteError) {
      console.error("Error deleting listing:", deleteError)
      return { success: false, error: `ไม่สามารถลบรายการได้: ${deleteError.message}` }
    }

    // รีวาลิเดทหน้ารายการที่ดินเพื่อให้แสดงข้อมูลล่าสุด
    revalidatePath("/listings")
    revalidatePath("/profile") // รีวาลิเดทหน้าโปรไฟล์ด้วย

    return {
      success: true,
      message: "ลบรายการที่ดินสำเร็จ",
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return { success: false, error: `เกิดข้อผิดพลาดในการลบรายการ: ${error.message}` }
  }
}

// เพิ่มฟังก์ชันดึงข้อมูลรายการที่ดินตาม ID
export async function getListingById(listingId: string) {
  try {
    // สร้าง Supabase client
    const supabase = createServerActionClient()

    // ดึงข้อมูลรายการที่ดิน
    const { data, error } = await supabase.from("listings").select("*").eq("id", listingId).single()

    if (error) {
      console.error("Error fetching listing:", error)
      return { success: false, error: `ไม่พบรายการที่ดิน: ${error.message}` }
    }

    return {
      success: true,
      listing: data,
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return { success: false, error: `เกิดข้อผิดพลาดในการดึงข้อมูล: ${error.message}` }
  }
}

// แก้ไขฟังก์ชันอัปเดตรายการที่ดิน
export async function updateListing(formData: FormData) {
  try {
    // สร้าง Supabase client
    const supabase = createServerActionClient()

    // ดึง listingId และ userId จาก formData
    const listingId = formData.get("listingId") as string
    const userId = formData.get("userId") as string

    if (!listingId) {
      return { success: false, error: "ไม่พบรหัสรายการที่ต้องการแก้ไข" }
    }

    if (!userId) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนแก้ไขรายการ" }
    }

    console.log("Updating listing:", listingId, "by user:", userId)

    // ตรวจสอบว่ารายการที่ดินนี้เป็นของผู้ใช้นี้หรือไม่
    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("user_id")
      .eq("id", listingId)
      .single()

    if (listingError) {
      console.error("Error checking listing ownership:", listingError)
      return { success: false, error: `ไม่พบรายการที่ดิน: ${listingError.message}` }
    }

    if (listingData.user_id !== userId) {
      return { success: false, error: "คุณไม่มีสิทธิ์แก้ไขรายการนี้" }
    }

    // ดึงข้อมูลจาก formData
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const propertyType = (formData.get("propertyType") as string) || "vacant"
    const address = (formData.get("address") as string) || "ไม่ระบุที่อยู่"
    const province = formData.get("province") as string
    const district = formData.get("district") as string
    const subdistrict = (formData.get("subdistrict") as string) || ""
    const zipCode = (formData.get("zipCode") as string) || ""
    const price = Number.parseFloat(formData.get("price") as string)
    const size = Number.parseFloat(formData.get("size") as string)
    const zoning = (formData.get("zoning") as string) || ""
    const images = JSON.parse((formData.get("images") as string) || "[]")
    const status = (formData.get("status") as string) || "active"

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!title || !price || !size || !province || !district || !subdistrict || !address) {
      return { success: false, error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อรายการ, ราคา, ขนาด, จังหวัด, อำเภอ, ตำบล, เลขที่)" }
    }

    // แปลงค่า price และ size เป็นตัวเลขที่ปลอดภัยสำหรับฐานข้อมูล
    let safePrice: number
    let safeSize: number

    try {
      // ตรวจสอบว่าค่า price อยู่ในช่วงที่ PostgreSQL สามารถรองรับได้ (integer: -2147483648 ถึง 2147483647)
      const priceValue = Number.parseFloat(formData.get("price") as string)
      safePrice = Math.min(priceValue, 2147483647)

      // ตรวจสอบว่าค่า size อยู่ในช่วงที่ PostgreSQL สามารถรองรับได้
      const sizeValue = Number.parseFloat(formData.get("size") as string)
      safeSize = Math.min(sizeValue, 2147483647)
    } catch (error) {
      console.error("Error parsing numeric values:", error)
      return { success: false, error: "ข้อมูลตัวเลขไม่ถูกต้อง กรุณาตรวจสอบราคาและขนาดที่ดิน" }
    }

    // สร้างข้อมูลสำหรับอัปเดตลงฐานข้อมูล
    const updateData = {
      title,
      description,
      property_type: propertyType,
      address,
      province,
      district,
      subdistrict,
      zip_code: zipCode,
      price: safePrice,
      size: safeSize,
      zoning,
      images,
      status,
      location: `${district || "ไม่ระบุอำเภอ"}, ${province || "ไม่ระบุจังหวัด"}`,
      type:
        propertyType === "residential"
          ? "ที่อยู่อาศัย"
          : propertyType === "commercial"
            ? "พาณิชย์"
            : propertyType === "agricultural"
              ? "เกษตรกรรม"
              : propertyType === "industrial"
                ? "อุตสาหกรรม"
                : "ที่ดินเปล่า",
      updated_at: new Date().toISOString(),
    }

    console.log("Update data:", updateData)

    // อัปเดตข้อมูลในตาราง listings
    const { data, error } = await supabase.from("listings").update(updateData).eq("id", listingId).select()

    if (error) {
      console.error("Error updating listing:", error)
      return { success: false, error: `ไม่สามารถอัปเดตรายการได้: ${error.message}` }
    }

    // รีวาลิเดทหน้ารายการที่ดินเพื่อให้แสดงข้อมูลล่าสุด
    revalidatePath("/listings")
    revalidatePath(`/listings/${listingId}`)
    revalidatePath("/profile")

    return {
      success: true,
      message: "อัปเดตรายการที่ดินสำเร็จ",
      listing: data[0],
    }
  } catch (error: any) {
    console.error("Server error:", error)
    return { success: false, error: `เกิดข้อผิดพลาดในการอัปเดตรายการ: ${error.message}` }
  }
}
