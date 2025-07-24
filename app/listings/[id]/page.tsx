import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import ListingGallery from "@/components/listing-gallery"
import SellerCard from "@/components/seller-card"
import SellerListings from "@/components/seller-listings"
import { MapPin, Calendar, Home, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ListingPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    console.log("Fetching listing with ID:", params.id)

    // ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const currentUser = session?.user

    // ดึงข้อมูลรายการที่ดิน
    const { data: listing, error } = await supabase.from("listings").select("*").eq("id", params.id).single()

    // ถ้าเกิดข้อผิดพลาดหรือไม่พบข้อมูล ให้แสดงหน้า 404
    if (error) {
      console.error("Error fetching listing:", error)
      return (
        <div className="container mx-auto py-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 text-center">
            <p className="text-lg text-gray-500 dark:text-gray-400">เกิดข้อผิดพลาดในการดึงข้อมูล: {error.message}</p>
            <Link href="/" passHref>
              <Button className="mt-4">กลับไปหน้าหลัก</Button>
            </Link>
          </div>
        </div>
      )
    }

    if (!listing) {
      console.error("Listing not found")
      notFound()
    }

    console.log("Listing found:", listing.id, listing.title)
    console.log("Seller ID from listing:", listing.user_id)

    // ดึงข้อมูลผู้ขาย
    let sellerData = null
    if (listing.user_id) {
      try {
        // แก้ไข: ใช้ maybeSingle() แทน single() เพื่อป้องกันข้อผิดพลาดเมื่อไม่พบข้อมูล
        const { data: seller, error: sellerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", listing.user_id)
          .maybeSingle()

        if (sellerError) {
          console.error("Error fetching seller data:", sellerError)
        } else if (seller) {
          sellerData = seller
          console.log("Seller data found:", seller)
          console.log("Seller avatar URL:", seller.avatar_url)

          // ดึงจำนวนรายการที่ดินของผู้ขาย
          const { count: listingsCount, error: countError } = await supabase
            .from("listings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", listing.user_id)

          if (!countError) {
            sellerData.listingsCount = listingsCount || 0
          }
        }

        // ดึงข้อมูลผู้ใช้จาก auth_user_view
        try {
          // แก้ไข: ใช้ maybeSingle() แทน single() เพื่อป้องกันข้อผิดพลาดเมื่อไม่พบข้อมูล
          const { data: authUser, error: authError } = await supabase
            .from("auth_user_view")
            .select("*")
            .eq("id", listing.user_id)
            .maybeSingle()

          if (authError) {
            console.error("Error fetching auth user:", authError)
          } else if (authUser) {
            console.log("Auth user data:", authUser)

            // ถ้ามี sellerData แล้ว ให้เพิ่มข้อมูลจาก auth_user_view
            if (sellerData) {
              // ถ้ามี avatar_url ใน auth_user_view ให้ใช้แทน
              if (authUser.raw_user_meta_data?.avatar_url) {
                sellerData.auth_avatar_url = authUser.raw_user_meta_data.avatar_url
                console.log("Using avatar URL from auth user:", authUser.raw_user_meta_data.avatar_url)
              }
            } else {
              // ถ้ายังไม่มี sellerData ให้สร้างจาก auth_user_view
              sellerData = {
                id: listing.user_id,
                full_name: authUser.raw_user_meta_data?.full_name || authUser.raw_user_meta_data?.name || "ผู้ขายที่ดิน",
                auth_avatar_url: authUser.raw_user_meta_data?.avatar_url || null,
                email: authUser.email,
                phone: authUser.raw_user_meta_data?.phone || null,
                line_id: authUser.raw_user_meta_data?.line_id || null,
                created_at: authUser.created_at || listing.created_at,
              }

              // ดึงจำนวนรายการที่ดินของผู้ขาย
              const { count: listingsCount, error: countError } = await supabase
                .from("listings")
                .select("*", { count: "exact", head: true })
                .eq("user_id", listing.user_id)

              if (!countError) {
                sellerData.listingsCount = listingsCount || 0
              }

              console.log("Created seller data from auth user:", sellerData)
            }
          }
        } catch (error) {
          console.error("Error fetching auth user:", error)
        }
      } catch (error) {
        console.error("Error fetching seller data:", error)
      }

      // ถ้าไม่พบข้อมูลในตาราง profiles และ auth_user_view ให้สร้างข้อมูลผู้ขายขั้นต่ำ
      if (!sellerData) {
        sellerData = {
          id: listing.user_id,
          full_name: "ผู้ขายที่ดิน",
          avatar_url: "/professional-man-suit.png", // ใช้รูปตัวอย่างเป็นค่าเริ่มต้น
          email: null,
          phone: null,
          line_id: null,
          created_at: listing.created_at,
          listingsCount: 0,
        }
        console.log("Created minimal seller data:", sellerData)
      }
    }

    // เตรียมรูปภาพสำหรับแสดงใน gallery
    const images = []
    if (listing.image_url) {
      images.push(listing.image_url)
    }
    if (listing.images && Array.isArray(listing.images)) {
      images.push(...listing.images)
    }

    // ถ้าไม่มีรูปภาพ ให้ใช้รูปภาพตัวอย่าง
    if (images.length === 0) {
      images.push("/diverse-landscapes.png")
    }

    // แปลงประเภททรัพย์สินเป็นภาษาไทย
    const getPropertyTypeInThai = (type: string | null) => {
      if (!type) return "ไม่ระบุ"

      switch (type.toLowerCase()) {
        case "industrial":
          return "ที่ดินอุตสาหกรรม"
        case "residential":
          return "ที่ดินที่อยู่อาศัย"
        case "commercial":
          return "ที่ดินเชิงพาณิชย์"
        case "agricultural":
          return "ที่ดินเกษตรกรรม"
        case "vacant":
          return "ที่ดินว่างเปล่า"
        default:
          return type
      }
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* คอลัมน์ซ้าย: รูปภาพและข้อมูลที่ดิน */}
          <div className="lg:col-span-2 space-y-6">
            {/* รูปภาพ */}
            <ListingGallery images={images} title={listing.title} />

            {/* ชื่อและราคา */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
              <p className="text-2xl font-semibold text-primary mb-4">{formatPrice(listing.price)}</p>

              <div className="flex items-center mb-4 text-gray-500 dark:text-gray-400">
                <MapPin className="h-5 w-5 mr-2" />
                <span>
                  {listing.province} {listing.district && `, ${listing.district}`}
                  {listing.subdistrict && `, ${listing.subdistrict}`}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ขนาดที่ดิน</p>
                    <p className="font-medium">
                      {Number(listing.size).toLocaleString("th-TH")}{" "}
                      {listing.size_unit === "rai" || listing.size_unit === "acres"
                        ? "ไร่"
                        : listing.size_unit === "sqm"
                          ? "ตร.ม."
                          : listing.size_unit === "sqwa"
                            ? "ตร.วา"
                            : listing.size_unit === "ngan"
                              ? "งาน"
                              : listing.size_unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ประเภททรัพย์สิน</p>
                    <p className="font-medium">{getPropertyTypeInThai(listing.property_type)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">วันที่ลงประกาศ</p>
                    <p className="font-medium">{new Date(listing.created_at).toLocaleDateString("th-TH")}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-3">รายละเอียด</h2>
              <p className="mb-6 whitespace-pre-line">{listing.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
            </div>

            {/* เพิ่มส่วนแสดงรายการที่ดินอื่นๆ ของผู้ขาย */}
            {listing.user_id && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
                <SellerListings sellerId={listing.user_id} currentListingId={listing.id} limit={3} />
              </div>
            )}
          </div>

          {/* คอลัมน์ขวา: ข้อมูลผู้ขาย */}
          <div className="space-y-6">
            {/* ข้อมูลผู้ขาย */}
            <div>
              <h2 className="text-xl font-semibold mb-4">ข้อมูลผู้ขาย</h2>
              {sellerData ? (
                <SellerCard
                  sellerId={listing.user_id}
                  listingId={listing.id}
                  currentUserId={currentUser?.id}
                  sellerData={sellerData}
                />
              ) : (
                <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <p className="text-red-500">ไม่พบข้อมูลผู้ขายในระบบ</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* ปุ่มกลับไปหน้าหลัก */}
            <div className="text-center">
              <Link href="/" passHref>
                <Button variant="outline" className="w-full rounded-xl">
                  กลับไปหน้าหลัก
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in ListingPage:", error)
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง</p>
          <Link href="/" passHref>
            <Button className="mt-4">กลับไปหน้าหลัก</Button>
          </Link>
        </div>
      </div>
    )
  }
}
