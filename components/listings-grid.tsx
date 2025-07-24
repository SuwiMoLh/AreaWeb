import { ListingCard } from "@/components/listing-card"

interface ListingsGridProps {
  listings: any[]
  userId?: string
}

export function ListingsGrid({ listings, userId }: ListingsGridProps) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">ไม่พบรายการที่ดินที่คุณกำลังค้นหา</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => {
        // ตรวจสอบและแปลงค่า imageUrl
        let imageUrl = listing.image_url

        // ถ้ามี images array และมีรูปภาพอย่างน้อย 1 รูป ให้ใช้รูปแรก
        if (!imageUrl && listing.images && listing.images.length > 0) {
          imageUrl = listing.images[0]
        }

        // ถ้ายังไม่มี imageUrl ให้ใช้รูปเริ่มต้น
        if (!imageUrl) {
          imageUrl = "/diverse-landscapes.png"
        }

        // สร้างข้อความที่อยู่
        const location = [listing.subdistrict, listing.district, listing.province].filter(Boolean).join(", ")

        return (
          <ListingCard
            key={listing.id}
            id={listing.id}
            title={listing.title || "ไม่ระบุชื่อ"}
            price={listing.price || 0}
            location={location || "ไม่ระบุที่อยู่"}
            size={listing.size || 0}
            imageUrl={imageUrl}
            isFavorite={listing.isFavorite}
          />
        )
      })}
    </div>
  )
}
