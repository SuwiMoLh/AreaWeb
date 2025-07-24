import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Image from "next/image"
import { Star, Calendar, Phone, Mail, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { getUserById, getUserListings } from "@/lib/supabase/queries"
import { Button } from "@/components/ui/button"
import { ListingsGrid } from "@/components/listings-grid"
import { ListingsSkeleton } from "@/components/listings-skeleton"

export default async function SellerProfilePage({ params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { data: session } = await supabase.auth.getSession()
    const userId = session?.user?.id

    // ดึงข้อมูลผู้ขาย
    const { data: seller, error } = await getUserById(params.id)

    if (error || !seller) {
      console.error("Error fetching seller:", error)
      notFound()
    }

    // แสดงข้อมูลในคอนโซลเพื่อตรวจสอบ
    console.log("Seller data:", seller)
    console.log("Avatar URL:", seller.avatar_url)
    console.log("Auth Avatar URL:", seller.auth_avatar_url)

    // คำนวณระยะเวลาตั้งแต่สมัครสมาชิก
    const memberSince = seller.created_at
      ? formatDistanceToNow(new Date(seller.created_at), { addSuffix: false, locale: th })
      : "ไม่ระบุ"

    // ตรวจสอบว่ามีรูปโปรไฟล์หรือไม่
    const avatarUrl = seller.auth_avatar_url || seller.avatar_url
    const hasAvatar = Boolean(avatarUrl && avatarUrl !== "/placeholder.svg")

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {hasAvatar ? (
                <Image
                  src={avatarUrl || "/placeholder.svg"}
                  alt={seller.full_name || "ผู้ขาย"}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.log("Error loading profile image, using fallback")
                    const target = e.target as HTMLImageElement
                    target.src = "/abstract-geometric-shapes.png"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <User className="w-16 h-16 text-gray-400 dark:text-gray-300" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold mb-2">{seller.full_name || "ไม่ระบุชื่อ"}</h1>
              <div className="flex items-center justify-center md:justify-start text-amber-500 mb-4">
                <Star className="h-5 w-5 fill-current" />
                <span className="ml-1">4.8 · {seller.listingsCount || 0} รายการ</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span>
                    <span className="text-gray-500 dark:text-gray-400">สมาชิกตั้งแต่:</span> {memberSince}
                  </span>
                </div>
                {seller.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>
                      <span className="text-gray-500 dark:text-gray-400">โทรศัพท์:</span> {seller.phone}
                    </span>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center col-span-1 md:col-span-2">
                    <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    <span>
                      <span className="text-gray-500 dark:text-gray-400">อีเมล:</span> {seller.email}
                    </span>
                  </div>
                )}
                {seller.line_id && (
                  <div className="flex items-center col-span-1 md:col-span-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    <span>
                      <span className="text-gray-500 dark:text-gray-400">LINE:</span> {seller.line_id}
                    </span>
                  </div>
                )}
              </div>

              {userId && userId !== params.id && (
                <div className="mt-6">
                  <Button asChild>
                    <a href={`/messages?seller=${params.id}`}>ติดต่อผู้ขาย</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">รายการที่ดินของผู้ขาย</h2>
        <Suspense fallback={<ListingsSkeleton />}>
          <SellerListings sellerId={params.id} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in SellerProfilePage:", error)
    notFound()
  }
}

async function SellerListings({ sellerId }: { sellerId: string }) {
  try {
    const { data: listings, error } = await getUserListings(sellerId)

    if (error) {
      console.error("Error fetching seller listings:", error)
      return <p>เกิดข้อผิดพลาดในการโหลดรายการที่ดิน</p>
    }

    if (!listings || listings.length === 0) {
      return <p>ไม่พบรายการที่ดินของผู้ขายรายนี้</p>
    }

    return <ListingsGrid listings={listings} />
  } catch (error) {
    console.error("Unexpected error in SellerListings:", error)
    return <p>เกิดข้อผิดพลาดในการโหลดรายการที่ดิน</p>
  }
}
