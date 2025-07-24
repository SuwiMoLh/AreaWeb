import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ListingsGrid } from "@/components/listings-grid"
import ListingsFilter from "@/components/listings-filter"
import type { Database } from "@/types/supabase"

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  try {
    console.log("Starting ListingsPage with searchParams:", searchParams)

    // แปลงพารามิเตอร์การค้นหาเป็นรูปแบบที่ใช้งานได้
    const search = typeof searchParams.search === "string" ? searchParams.search : undefined
    const minPrice = typeof searchParams.minPrice === "string" ? Number.parseFloat(searchParams.minPrice) : undefined
    const maxPrice = typeof searchParams.maxPrice === "string" ? Number.parseFloat(searchParams.maxPrice) : undefined
    const minSize = typeof searchParams.minSize === "string" ? Number.parseFloat(searchParams.minSize) : undefined
    const maxSize = typeof searchParams.maxSize === "string" ? Number.parseFloat(searchParams.maxSize) : undefined
    const propertyType = typeof searchParams.propertyType === "string" ? searchParams.propertyType : undefined
    const location = typeof searchParams.location === "string" ? searchParams.location : undefined

    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // ดึงข้อมูล session เพื่อตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id

    console.log("User ID:", userId)

    // สร้าง query พื้นฐาน
    let query = supabase.from("listings").select("*")

    // เพิ่มเงื่อนไขการค้นหา
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    if (location) {
      query = query.or(`province.ilike.%${location}%,district.ilike.%${location}%,subdistrict.ilike.%${location}%`)
    }

    if (propertyType) {
      query = query.eq("property_type", propertyType)
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice)
    }

    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice)
    }

    if (minSize !== undefined) {
      query = query.gte("size", minSize)
    }

    if (maxSize !== undefined) {
      query = query.lte("size", maxSize)
    }

    // ดึงข้อมูลรายการที่ดิน
    console.log("Fetching listings...")
    const { data: listings, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching listings:", error)
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">รายการที่ดิน</h1>
          <p className="text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
        </div>
      )
    }

    console.log(`Found ${listings?.length || 0} listings`)

    // ถ้ามี userId ให้ตรวจสอบรายการโปรด
    let listingsWithFavorites = listings || []
    if (userId && listings && listings.length > 0) {
      console.log("Fetching favorites for user:", userId)
      const { data: favorites, error: favoritesError } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", userId)

      if (favoritesError) {
        console.error("Error fetching favorites:", favoritesError)
      } else {
        console.log(`Found ${favorites?.length || 0} favorites`)
        // สร้าง Set ของ listing_id ที่เป็นรายการโปรด
        const favoriteIds = new Set(favorites?.map((fav) => fav.listing_id) || [])

        // เพิ่มข้อมูล isFavorite ให้กับรายการที่ดิน
        listingsWithFavorites = listings.map((listing) => ({
          ...listing,
          isFavorite: favoriteIds.has(listing.id),
        }))
      }
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">รายการที่ดินทั้งหมด</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ฟิลเตอร์ด้านซ้าย */}
          <div className="lg:col-span-1">
            <ListingsFilter
              initialValues={{
                search,
                minPrice,
                maxPrice,
                minSize,
                maxSize,
                propertyType,
                location,
              }}
            />
          </div>

          {/* รายการที่ดินด้านขวา */}
          <div className="lg:col-span-3">
            <p className="mb-6">พบ {listingsWithFavorites.length} รายการ</p>
            <ListingsGrid listings={listingsWithFavorites} userId={userId} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in ListingsPage:", error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">รายการที่ดิน</h1>
        <p className="text-red-500">เกิดข้อผิดพลาดที่ไม่คาดคิด: {(error as Error).message || "Unknown error"}</p>
      </div>
    )
  }
}
