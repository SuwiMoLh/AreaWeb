"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Calendar, Home, FileText, Droplets, Zap, RouteIcon as Road, Map } from "lucide-react"
import { formatPrice, formatDate, formatSize } from "@/lib/utils"
import SellerCard from "@/components/seller-card"
import FavoriteButton from "@/components/favorite-button"
import ImageGallery from "@/components/image-gallery"
import MapView from "@/components/map-view"
import SimilarListings from "@/components/similar-listings"

interface ListingDetailPageProps {
  listing: any
  userId?: string
}

export default function ListingDetailPage({ listing, userId }: ListingDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")

  // ตรวจสอบว่ามีข้อมูลรายการที่ดินหรือไม่
  if (!listing) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">ไม่พบข้อมูลรายการที่ดิน</p>
        </div>
      </div>
    )
  }

  // ดึงข้อมูลผู้ขายจาก profiles
  const seller = listing.profiles || {}

  // ตรวจสอบว่ามีรูปภาพหรือไม่
  const images = listing.images || []
  const mainImage = images[0] || "/diverse-landscapes.png"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* คอลัมน์ซ้าย: รูปภาพและรายละเอียด */}
        <div className="lg:col-span-2 space-y-6">
          {/* รูปภาพหลัก */}
          <div className="relative w-full h-[300px] md:h-[400px] rounded-3xl overflow-hidden">
            <Image
              src={mainImage || "/placeholder.svg"}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            {/* ปุ่มรายการโปรด */}
            {userId && (
              <div className="absolute top-4 right-4">
                <FavoriteButton listingId={listing.id} initialState={listing.isFavorite} />
              </div>
            )}
          </div>

          {/* แกลเลอรีรูปภาพ */}
          {images.length > 1 && <ImageGallery images={images} title={listing.title} />}

          {/* ชื่อและราคา */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
            <div className="flex items-center mt-2 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {listing.subdistrict && `${listing.subdistrict}, `}
                {listing.district && `${listing.district}, `}
                {listing.province}
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-primary mt-2">{formatPrice(listing.price)}</p>
          </div>

          {/* แท็บข้อมูล */}
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">รายละเอียด</TabsTrigger>
              <TabsTrigger value="map">แผนที่</TabsTrigger>
            </TabsList>

            {/* แท็บรายละเอียด */}
            <TabsContent value="details" className="space-y-6">
              {/* คุณสมบัติหลัก */}
              <Card>
                <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* ขนาดที่ดิน */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Home className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">ขนาดที่ดิน</span>
                    <span className="font-medium">{formatSize(listing.size, listing.size_unit)}</span>
                  </div>

                  {/* ประเภทที่ดิน */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Map className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">ประเภทที่ดิน</span>
                    <span className="font-medium">{listing.property_type || "ไม่ระบุ"}</span>
                  </div>

                  {/* เอกสารสิทธิ์ */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileText className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">เอกสารสิทธิ์</span>
                    <span className="font-medium">{listing.document_type || "ไม่ระบุ"}</span>
                  </div>

                  {/* วันที่ลงประกาศ */}
                  <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">วันที่ลงประกาศ</span>
                    <span className="font-medium">{formatDate(listing.created_at)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* สิ่งอำนวยความสะดวก */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">สิ่งอำนวยความสะดวก</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* น้ำประปา */}
                    <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                      <span>น้ำประปา: {listing.has_water ? "มี" : "ไม่มี"}</span>
                    </div>

                    {/* ไฟฟ้า */}
                    <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      <span>ไฟฟ้า: {listing.has_electricity ? "มี" : "ไม่มี"}</span>
                    </div>

                    {/* ถนนเข้าออก */}
                    <div className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Road className="w-5 h-5 mr-2 text-gray-500" />
                      <span>ถนนเข้าออก: {listing.road_access || "ไม่ระบุ"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* รายละเอียดเพิ่มเติม */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">รายละเอียดเพิ่มเติม</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {listing.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                  </p>
                </CardContent>
              </Card>

              {/* การใช้ประโยชน์ที่ดิน */}
              {listing.zoning && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-3">การใช้ประโยชน์ที่ดิน</h3>
                    <Badge variant="outline">{listing.zoning}</Badge>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* แท็บแผนที่ */}
            <TabsContent value="map">
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3">ตำแหน่งที่ตั้ง</h3>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <MapView latitude={listing.latitude} longitude={listing.longitude} title={listing.title} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* รายการที่คล้ายกัน */}
          <SimilarListings currentId={listing.id} />
        </div>

        {/* คอลัมน์ขวา: ข้อมูลผู้ขายและการติดต่อ */}
        <div className="space-y-6">
          {/* ข้อมูลผู้ขาย */}
          <SellerCard
            seller={seller}
            listingsCount={listing.sellerListingsCount || 0}
            currentUserId={userId}
            listingId={listing.id}
          />

          {/* ปุ่มกลับไปหน้าหลัก */}
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            กลับไปหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  )
}
