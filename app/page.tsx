import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import FeaturedListings from "@/components/featured-listings"
import ClientHomeContent from "@/components/client-home-content"
import { ErrorBoundary } from "react-error-boundary"

// กำหนดให้หน้านี้เป็น dynamic rendering
export const dynamic = "force-dynamic"

// สร้าง Skeleton สำหรับ FeaturedListings
function FeaturedListingsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-lg border border-gray-200/30 dark:border-gray-800/30"
        >
          <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
          <div className="p-5 space-y-3">
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component สำหรับแสดงเมื่อเกิดข้อผิดพลาด
function ErrorFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <Link key={index} href="/listings">
          <div className="rounded-3xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-lg border border-gray-200/30 dark:border-gray-800/30 transition-all hover:scale-105 hover:shadow-xl">
            <div className="relative h-48">
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-600">ไม่สามารถโหลดรูปภาพได้</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {index === 0
                  ? "Mountain View Estate"
                  : index === 1
                    ? "ที่ดินวิวทะเล"
                    : index === 2
                      ? "ที่ดินติดแม่น้ำ"
                      : "ที่ดินเชิงเขา"}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="mr-1">📍</span>
                {index === 0
                  ? "อำเภอแม่ริม, เชียงใหม่"
                  : index === 1
                    ? "อำเภอเกาะสมุย, สุราษฎร์ธานี"
                    : index === 2
                      ? "อำเภอปาย, แม่ฮ่องสอน"
                      : "อำเภอเชียงดาว, เชียงใหม่"}
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  ฿{index === 0 ? "4,500,000" : index === 1 ? "12,500,000" : index === 2 ? "3,200,000" : "2,750,000"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {index === 0 ? "5.2 ไร่" : index === 1 ? "2 ไร่" : index === 2 ? "3 ไร่" : "4 ไร่"}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section with Animated Background - Client Component */}
      <ErrorBoundary
        fallback={
          <div className="min-h-[300px] flex items-center justify-center">
            <ClientHomeContent />
          </div>
        }
      >
        <ClientHomeContent />
      </ErrorBoundary>

      {/* Featured Listings - Server Component */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold">รายการแนะนำ</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">รายการที่ดีที่สุดจากเรา</p>
          </div>
          <Link href="/listings">
            <Button variant="ghost" className="rounded-full">
              ดูทั้งหมด
            </Button>
          </Link>
        </div>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<FeaturedListingsSkeleton />}>
            <FeaturedListings />
          </Suspense>
        </ErrorBoundary>
      </section>

      {/* Call to Action */}
      <section className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 md:p-12 shadow-xl border border-gray-200/30 dark:border-gray-800/30 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">พร้อมที่จะลงรายการที่ดินของคุณ?</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-xl">
            เข้าร่วมกับเจ้าของที่ดินนับพันที่ประสบความสำเร็จในการขายที่ดินบน Area แพลตฟอร์มของเราช่วยให้คุณเชื่อมต่อกับผู้ซื้อที่จริงจังได้อย่างง่ายดาย
          </p>
        </div>
        <Link href="/upload">
          <Button className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105 whitespace-nowrap">
            เริ่มขาย
          </Button>
        </Link>
      </section>
    </div>
  )
}
