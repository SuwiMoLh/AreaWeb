import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// ฟังก์ชันสำหรับดึงรายการที่ดินทั้งหมด
export async function getListings(userId?: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*, profiles(id, full_name, avatar_url, created_at)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching listings:", error)
    return { data: [], error }
  }

  // ถ้ามี userId ให้ตรวจสอบรายการโปรด
  if (userId) {
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)

    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError)
    } else {
      // สร้าง Set ของ listing_id ที่เป็นรายการโปรด
      const favoriteIds = new Set(favorites?.map((fav) => fav.listing_id) || [])

      // เพิ่มข้อมูล isFavorite ให้กับรายการที่ดิน
      return {
        data: listings.map((listing) => ({
          ...listing,
          isFavorite: favoriteIds.has(listing.id),
        })),
        error: null,
      }
    }
  }

  return { data: listings, error: null }
}

// ฟังก์ชันสำหรับดึงรายการที่ดินตาม ID พร้อมข้อมูลผู้ขาย
export async function getListingById(id: string, userId?: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: listing, error } = await supabase.from("listings").select("*, profiles(*)").eq("id", id).single()

  if (error) {
    console.error("Error fetching listing:", error)
    return { data: null, error }
  }

  // ถ้ามี userId ให้ตรวจสอบรายการโปรด
  if (userId) {
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("listing_id", id)
      .maybeSingle()

    if (favoriteError) {
      console.error("Error fetching favorite:", favoriteError)
    } else {
      // ดึงจำนวนรายการที่ดินของผู้ขาย
      if (listing.user_id) {
        const { count: listingsCount, error: countError } = await supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", listing.user_id)

        if (!countError) {
          return {
            data: {
              ...listing,
              isFavorite: !!favorite,
              sellerListingsCount: listingsCount || 0,
            },
            error: null,
          }
        }
      }

      return {
        data: {
          ...listing,
          isFavorite: !!favorite,
        },
        error: null,
      }
    }
  }

  // ดึงจำนวนรายการที่ดินของผู้ขาย
  if (listing.user_id) {
    const { count: listingsCount, error: countError } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", listing.user_id)

    if (!countError) {
      return {
        data: {
          ...listing,
          sellerListingsCount: listingsCount || 0,
        },
        error: null,
      }
    }
  }

  return { data: listing, error: null }
}

// แก้ไขฟังก์ชัน getUserById ให้ดึงข้อมูลเพิ่มเติมและจัดการข้อผิดพลาดได้ดีขึ้น
export async function getUserById(id: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // ดึงข้อมูลจาก profiles
    const { data: user, error } = await supabase.from("profiles").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return { data: null, error }
    }

    // ดึงข้อมูลจาก auth_user_view เพื่อให้ได้ raw_user_meta_data
    try {
      const { data: authUser, error: authError } = await supabase
        .from("auth_user_view")
        .select("*")
        .eq("id", id)
        .maybeSingle()

      if (!authError && authUser && authUser.raw_user_meta_data && authUser.raw_user_meta_data.avatar_url) {
        // ถ้ามีข้อมูล avatar_url ใน raw_user_meta_data ให้เพิ่มเข้าไปในข้อมูลผู้ใช้
        user.auth_avatar_url = authUser.raw_user_meta_data.avatar_url
      } else if (authError) {
        console.warn("Non-critical error fetching auth user:", authError)
      }
    } catch (authFetchError) {
      console.warn("Failed to fetch auth user data, continuing with profile data only:", authFetchError)
      // ไม่ต้อง return error เพราะเราสามารถใช้ข้อมูลจาก profiles ได้
    }

    // ดึงจำนวนรายการที่ดินของผู้ใช้
    const { count: listingsCount, error: countError } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id)

    if (countError) {
      console.warn("Non-critical error counting listings:", countError)
    }

    return {
      data: {
        ...user,
        listingsCount: listingsCount || 0,
      },
      error: null,
    }
  } catch (error) {
    console.error("Unexpected error in getUserById:", error)
    return { data: null, error }
  }
}

// ฟังก์ชันสำหรับดึงรายการที่ดินของผู้ใช้
export async function getUserListings(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user listings:", error)
    return { data: [], error }
  }

  return { data: listings, error: null }
}

// ฟังก์ชันสำหรับดึงรายการที่ดินที่คล้ายกัน
export async function getSimilarListings(currentId: string, limit = 3) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

  // ดึงข้อมูลรายการปัจจุบันเพื่อใช้เป็นเกณฑ์ในการค้นหารายการที่คล้ายกัน
  const { data: currentListing } = await supabase
    .from("listings")
    .select("province, district, property_type")
    .eq("id", currentId)
    .single()

  if (!currentListing) {
    return []
  }

  // ค้นหารายการที่อยู่ในจังหวัดเดียวกันหรือประเภทเดียวกัน
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*, profiles(id, full_name, avatar_url)")
    .neq("id", currentId) // ไม่รวมรายการปัจจุบัน
    .or(`province.eq.${currentListing.province},property_type.eq.${currentListing.property_type}`)
    .limit(limit)

  if (error) {
    console.error("Error fetching similar listings:", error)
    return []
  }

  return listings
}

// แก้ไขฟังก์ชันสำหรับดึงรายการโปรดของผู้ใช้
export async function getFavoriteListings(userId: string) {
  try {
    console.log("Fetching favorite listings for user:", userId)

    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    // ดึงรายการโปรดของผู้ใช้
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", userId)

    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError)
      return { data: [], error: favoritesError }
    }

    console.log("Favorites found:", favorites?.length || 0)

    if (!favorites || favorites.length === 0) {
      return { data: [], error: null }
    }

    // ดึงข้อมูลรายการที่ดินตาม listing_id แต่ไม่รวมความสัมพันธ์กับ profiles
    const listingIds = favorites.map((fav) => fav.listing_id)
    console.log("Listing IDs:", listingIds)

    // แก้ไขการดึงข้อมูล - ไม่รวม profiles
    const { data: listings, error: listingsError } = await supabase.from("listings").select("*").in("id", listingIds)

    if (listingsError) {
      console.error("Error fetching favorite listings:", listingsError)
      return { data: [], error: listingsError }
    }

    console.log("Listings found:", listings?.length || 0)

    // ดึงข้อมูลผู้ขายแยกต่างหาก
    const sellerIds = [...new Set(listings.map((listing) => listing.user_id))].filter(Boolean)
    let sellerProfiles = {}

    if (sellerIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", sellerIds)

      if (!profilesError && profiles) {
        sellerProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {})
      }
    }

    // เพิ่มข้อมูล isFavorite และข้อมูลผู้ขายให้กับรายการที่ดิน
    const listingsWithFavorite = listings.map((listing) => {
      const seller = sellerProfiles[listing.user_id] || null
      return {
        ...listing,
        isFavorite: true,
        profiles: seller,
      }
    })

    return { data: listingsWithFavorite, error: null }
  } catch (error) {
    console.error("Unexpected error in getFavoriteListings:", error)
    return { data: [], error }
  }
}
