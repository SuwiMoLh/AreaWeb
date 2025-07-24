import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// ไม่มี 'use client' directive เพื่อให้เป็น Server Component

// ข้อมูลจำลองสำหรับรายการแนะนำ
const mockListings = [
  {
    id: "listing-1",
    title: "Mountain View Estate",
    location: "อำเภอแม่ริม, เชียงใหม่",
    price: 4500000,
    size: 5.2,
    image: "/beautiful-mountain-landscape.png",
  },
  {
    id: "listing-2",
    title: "ที่ดินวิวทะเล",
    location: "อำเภอเกาะสมุย, สุราษฎร์ธานี",
    price: 12500000,
    size: 2,
    image: "/beach-land-property.png",
  },
  {
    id: "listing-3",
    title: "ที่ดินติดแม่น้ำ",
    location: "อำเภอปาย, แม่ฮ่องสอน",
    price: 3200000,
    size: 3,
    image: "/diverse-landscapes.png",
  },
  {
    id: "listing-4",
    title: "ที่ดินเชิงเขา",
    location: "อำเภอเชียงดาว, เชียงใหม่",
    price: 2750000,
    size: 4,
    image: "/diverse-property-showcase.png",
  },
]

export default async function FeaturedListings() {
  try {
    // รูปภาพเริ่มต้นสำหรับกรณีที่ไม่มีรูปภาพ
    const defaultImages = [
      "/beautiful-mountain-landscape.png",
      "/beach-land-property.png",
      "/diverse-landscapes.png",
      "/diverse-property-showcase.png",
    ]

    let listings = []

    try {
      const cookieStore = cookies()
      const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

      // ลบ throwOnError ออกเพื่อให้จัดการข้อผิดพลาดเองได้
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4)

      if (error) {
        console.error("Error fetching featured listings:", error)
        throw new Error(`Error fetching featured listings: ${error.message}`)
      }

      // ถ้าไม่มีข้อมูล
      if (!data || data.length === 0) {
        console.log("No listings found, using mock data")
        throw new Error("No listings found")
      }

      listings = data
    } catch (error: any) {
      console.error("Error in Supabase query:", error)

      // ตรวจสอบว่าเป็นข้อผิดพลาด Failed to fetch หรือไม่
      if (
        error.message &&
        (error.message.includes("Failed to fetch") ||
          error.message.includes("fetch failed") ||
          error.message.includes("network") ||
          error.message.includes("Too Many") ||
          error.message.includes("429") ||
          error.message.includes("rate limit"))
      ) {
        console.log("Network error or rate limit exceeded, using mock data")
      }

      // ใช้ข้อมูลจำลองแทนเมื่อเกิดข้อผิดพลาด
      listings = mockListings
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing, index) => {
          // ตรวจสอบและแปลงค่า image_url
          let imageUrl = "/placeholder.svg?key=36u62"

          // ถ้ามี image_url และเป็น array ให้ใช้รูปภาพแรก
          if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
            imageUrl = listing.images[0]
          }
          // ถ้ามี image_url และเป็น string ให้ใช้ค่านั้น
          else if (listing.image_url && typeof listing.image_url === "string") {
            imageUrl = listing.image_url
          }
          // ถ้ามี image_url และเป็น array ให้ใช้รูปภาพแรก
          else if (listing.image_url && Array.isArray(listing.image_url) && listing.image_url.length > 0) {
            imageUrl = listing.image_url[0]
          }
          // ถ้ามีรูปภาพ ให้ใช้รูปภาพเริ่มต้น
          else if (listing.image) {
            imageUrl = listing.image
          }
          // ถ้าไม่มีรูปภาพ ให้ใช้รูปภาพเริ่มต้น
          else {
            imageUrl = defaultImages[index % defaultImages.length]
          }

          // ตรวจสอบว่า imageUrl เป็น URL ที่ถูกต้องหรือไม่
          const isValidImageUrl =
            typeof imageUrl === "string" &&
            (imageUrl.startsWith("http") || imageUrl.startsWith("/") || imageUrl.startsWith("data:image"))

          // ใช้รูปภาพเริ่มต้นถ้า imageUrl ไม่ถูกต้อง
          const displayImageUrl = isValidImageUrl ? imageUrl : defaultImages[index % defaultImages.length]

          // จัดรูปแบบราคาแบบไทย
          const formattedPrice = formatThaiCurrency(listing.price || 0)

          // จัดรูปแบบขนาดที่ดิน
          const formattedSize = typeof listing.size === "number" ? listing.size.toString() : listing.size || "ไม่ระบุขนาด"

          return (
            <Link key={listing.id} href={`/listings/${listing.id}`}>
              <div className="rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-lg border border-gray-200/30 dark:border-gray-800/30 transition-all hover:scale-105 hover:shadow-xl">
                <div className="relative h-48">
                  <Image
                    src={displayImageUrl || "/placeholder.svg"}
                    alt={listing.title || "ที่ดิน"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{listing.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.district && listing.province
                      ? `${listing.district}, ${listing.province}`
                      : listing.location || listing.province || "ไม่ระบุตำแหน่ง"}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">฿{formattedPrice}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formattedSize} ไร่</p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error("Error in FeaturedListings:", error)
    console.log("Falling back to mock data due to error")

    // แสดงข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockListings.map((listing, index) => (
          <Link key={listing.id} href={`/listings/${listing.id}`}>
            <div className="rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-lg border border-gray-200/30 dark:border-gray-800/30 transition-all hover:scale-105 hover:shadow-xl">
              <div className="relative h-48">
                <Image src={listing.image || "/placeholder.svg"} alt={listing.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{listing.title}</h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    ฿{formatThaiCurrency(listing.price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{listing.size} ไร่</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }
}

// ฟังก์ชันสำหรับจัดรูปแบบราคาแบบไทย
function formatThaiCurrency(price: number): string {
  try {
    return new Intl.NumberFormat("th-TH").format(price)
  } catch (error) {
    console.error("Error formatting price:", error)
    return price.toString()
  }
}
