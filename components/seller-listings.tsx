"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ListingCard } from "@/components/listing-card"
import { Skeleton } from "@/components/ui/skeleton"

interface SellerListingsProps {
  sellerId: string
  currentListingId: string
  limit?: number
}

export default function SellerListings({ sellerId, currentListingId, limit }: SellerListingsProps) {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchSellerListings() {
      try {
        setLoading(true)

        // ดึงจำนวนรายการทั้งหมดของผู้ขาย
        const { count, error: countError } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", sellerId)
          .neq("id", currentListingId)

        if (!countError) {
          setTotalCount(count || 0)
        }

        // ดึงรายการที่ดินของผู้ขาย ยกเว้นรายการปัจจุบัน
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("user_id", sellerId)
          .neq("id", currentListingId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching seller listings:", error)
          return
        }

        // ตรวจสอบว่ามีการเข้าสู่ระบบหรือไม่
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const userId = session?.user?.id

        // ถ้ามีการเข้าสู่ระบบ ให้ตรวจสอบรายการโปรด
        if (userId && data.length > 0) {
          const listingIds = data.map((listing) => listing.id)
          const { data: favorites, error: favoritesError } = await supabase
            .from("favorites")
            .select("listing_id")
            .eq("user_id", userId)
            .in("listing_id", listingIds)

          if (!favoritesError && favorites) {
            const favoriteIds = new Set(favorites.map((fav) => fav.listing_id))

            // เพิ่มข้อมูล isFavorite ให้กับรายการที่ดิน
            setListings(
              data.map((listing) => ({
                ...listing,
                isFavorite: favoriteIds.has(listing.id),
              })),
            )
          } else {
            setListings(data)
          }
        } else {
          setListings(data)
        }
      } catch (error) {
        console.error("Unexpected error in fetchSellerListings:", error)
      } finally {
        setLoading(false)
      }
    }

    if (sellerId) {
      fetchSellerListings()
    }
  }, [sellerId, currentListingId, supabase])

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">รายการที่ดินของผู้ขาย</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return null
  }

  // แสดงรายการทั้งหมดหรือแค่ตามจำนวน limit
  const maxToShow = limit || 3
  const displayedListings = showAll ? listings : listings.slice(0, maxToShow)

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">รายการที่ดินของผู้ขาย</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayedListings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title}
            price={listing.price}
            location={`${listing.province}${listing.district ? `, ${listing.district}` : ""}`}
            size={listing.size}
            imageUrl={listing.image_url}
            images={listing.images || []}
            isFavorite={listing.isFavorite}
          />
        ))}
      </div>
    </div>
  )
}
