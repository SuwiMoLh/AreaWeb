import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ListingsGrid } from "@/components/listings-grid"
import { getFavoriteListings } from "@/lib/supabase/queries"
import { Suspense } from "react"
import { ListingsSkeleton } from "@/components/listings-skeleton"

// ป้องกันการ cache หน้านี้
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function FavoritesPage() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/favorites")
  }

  const { data: listings, error } = await getFavoriteListings(session.user.id)

  if (error) {
    console.error("Error fetching favorite listings:", error)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">รายการโปรดของฉัน</h1>

      <Suspense fallback={<ListingsSkeleton />}>
        {listings && listings.length > 0 ? (
          <ListingsGrid listings={listings} searchParams={{}} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">คุณยังไม่มีรายการโปรด</h2>
            <p className="text-muted-foreground mb-6">เมื่อคุณเพิ่มรายการที่ดินในรายการโปรด รายการเหล่านั้นจะปรากฏที่นี่</p>
            <a
              href="/listings"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              ดูรายการที่ดินทั้งหมด
            </a>
          </div>
        )}
      </Suspense>
    </div>
  )
}
