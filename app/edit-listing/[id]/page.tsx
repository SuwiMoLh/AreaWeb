"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useParams } from "next/navigation"
import { MapPin, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { getListingById, updateListing } from "@/app/actions/listing-actions"
import Link from "next/link"

export default function EditListingPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string
  const [isPending, startTransition] = useTransition()
  const { supabase, session, user, isLoading } = useSupabase()

  // สถานะการตรวจสอบการล็อกอิน
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // สถานะของฟอร์ม
  const [formStep, setFormStep] = useState(1)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingListing, setIsLoadingListing] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "vacant",
    address: "",
    province: "",
    district: "",
    subdistrict: "",
    zipCode: "",
    price: "",
    size: "",
    zoning: "",
    country: "Thailand",
    status: "active",
  })

  // สถานะการส่งข้อมูล
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // ประเภทที่ดินในประเทศไทย
  const thaiPropertyTypes = [
    { value: "vacant", label: "ที่ดินเปล่า" },
    { value: "residential", label: "ที่อยู่อาศัย" },
    { value: "commercial", label: "พาณิชย์" },
    { value: "agricultural", label: "เกษตรกรรม" },
    { value: "industrial", label: "อุตสาหกรรม" },
  ]

  // สถานะรายการ
  const listingStatuses = [
    { value: "active", label: "กำลังแสดง" },
    { value: "pending", label: "รอดำเนินการ" },
    { value: "sold", label: "ขายแล้ว" },
    { value: "inactive", label: "ไม่แสดง" },
  ]

  // ตรวจสอบการล็อกอินเมื่อโหลดหน้า
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (session && user) {
          setIsAuthenticated(true)
          console.log("User is authenticated:", user.id)
        } else {
          setIsAuthenticated(false)
          toast({
            title: "กรุณาเข้าสู่ระบบ",
            description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแก้ไขรายการได้",
            variant: "destructive",
          })
        }
      }
    }

    checkAuth()
  }, [isLoading, session, user, toast])

  // โหลดข้อมูลรายการที่ดิน
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId || !isAuthenticated) return

      try {
        setIsLoadingListing(true)
        setErrorDetails(null)

        const result = await getListingById(listingId)

        if (!result.success) {
          throw new Error(result.error || "ไม่พบรายการที่ดิน")
        }

        const listing = result.listing

        // ตรวจสอบว่ารายการนี้เป็นของผู้ใช้นี้หรือไม่
        if (listing.user_id !== user?.id) {
          throw new Error("คุณไม่มีสิทธิ์แก้ไขรายการนี้")
        }

        // อัปเดตข้อมูลฟอร์ม
        setFormData({
          title: listing.title || "",
          description: listing.description || "",
          propertyType: listing.property_type || "vacant",
          address: listing.address || "",
          province: listing.province || "",
          district: listing.district || "",
          subdistrict: listing.subdistrict || "",
          zipCode: listing.zip_code || "",
          price: listing.price?.toString() || "",
          size: listing.size?.toString() || "",
          zoning: listing.zoning || "",
          country: listing.country || "Thailand",
          status: listing.status || "active",
        })

        // อัปเดตรูปภาพ
        if (listing.images && listing.images.length > 0) {
          setUploadedImageUrls(listing.images)
          setPreviews(listing.images)
        }
      } catch (error: any) {
        console.error("Error fetching listing:", error)
        setErrorDetails(error.message || "ไม่สามารถโหลดข้อมูลรายการที่ดินได้")
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถโหลดข้อมูลรายการที่ดินได้",
          variant: "destructive",
        })
      } finally {
        setIsLoadingListing(false)
      }
    }

    fetchListing()
  }, [listingId, isAuthenticated, user, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      const filesArray = Array.from(e.target.files)

      // สร้าง previews ชั่วคราว
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])

      try {
        // อัปโหลดแต่ละไฟล์ไปยัง API
        const uploadPromises = filesArray.map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload-listing-image", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "ไม่สามารถอัปโหลดรูปภาพได้")
          }

          return await response.json()
        })

        const results = await Promise.all(uploadPromises)
        const newImageUrls = results.map((result) => result.imageUrl || "/placeholder.svg")

        setUploadedImageUrls([...uploadedImageUrls, ...newImageUrls])
        setImages([...images, ...filesArray])

        toast({
          title: "อัปโหลดสำเร็จ",
          description: `อัปโหลดรูปภาพ ${filesArray.length} รูปสำเร็จ`,
        })
      } catch (error: any) {
        console.error("Upload error:", error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "ไม่สามารถอัปโหลดรูปภาพได้",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...previews]
    const newUploadedImageUrls = [...uploadedImageUrls]

    // ลบ URL ของ object ที่สร้างไว้เพื่อป้องกัน memory leak
    if (images[index]) {
      URL.revokeObjectURL(previews[index])
    }

    newPreviews.splice(index, 1)
    newUploadedImageUrls.splice(index, 1)

    setPreviews(newPreviews)
    setUploadedImageUrls(newUploadedImageUrls)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "กรุณากรอกชื่อรายการ",
        description: "ชื่อรายการเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.price) {
      toast({
        title: "กรุณากรอกราคา",
        description: "ราคาเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.size) {
      toast({
        title: "กรุณากรอกขนาดที่ดิน",
        description: "ขนาดที่ดินเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.province) {
      toast({
        title: "กรุณาเลือกจังหวัด",
        description: "จังหวัดเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.district) {
      toast({
        title: "กรุณาเลือกอำเภอ/เขต",
        description: "อำเภอ/เขตเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.subdistrict) {
      toast({
        title: "กรุณาเลือกตำบล/แขวง",
        description: "ตำบล/แขวงเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    if (!formData.address) {
      toast({
        title: "กรุณากรอกเลขที่",
        description: "เลขที่เป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ตรวจสอบข้อมูล
    if (!validateForm()) {
      return
    }

    setStatusMessage("กำลังเตรียมข้อมูล...")
    setErrorDetails(null)

    // ตรวจสอบการล็อกอิน
    if (!user || !user.id) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถแก้ไขรายการได้",
        variant: "destructive",
      })
      setStatusMessage(null)
      setErrorDetails("กรุณาเข้าสู่ระบบก่อนแก้ไขรายการ")
      router.push("/login?redirect=/edit-listing/" + listingId)
      return
    }

    // ถ้าไม่มีรูปภาพ ใช้รูปภาพตัวอย่าง
    const finalImages = uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/placeholder.svg?key=land-placeholder"]

    // สร้าง FormData สำหรับส่งไปยัง Server Action
    const submitFormData = new FormData()
    submitFormData.append("listingId", listingId)
    submitFormData.append("userId", user.id)
    submitFormData.append("title", formData.title)
    submitFormData.append("description", formData.description)
    submitFormData.append("propertyType", formData.propertyType)
    submitFormData.append("address", formData.address || "ไม่ระบุที่อยู่")
    submitFormData.append("province", formData.province || "")
    submitFormData.append("district", formData.district || "")
    submitFormData.append("subdistrict", formData.subdistrict || "")
    submitFormData.append("zipCode", formData.zipCode || "")
    submitFormData.append("price", formData.price.toString())
    submitFormData.append("size", formData.size.toString())
    submitFormData.append("zoning", formData.zoning || "")
    submitFormData.append("images", JSON.stringify(finalImages))
    submitFormData.append("status", formData.status)

    console.log("Updating listing ID:", listingId)
    setStatusMessage("กำลังบันทึกข้อมูล...")

    // ส่งข้อมูลไปยัง Server Action
    startTransition(async () => {
      try {
        const result = await updateListing(submitFormData)

        if (result.success) {
          setStatusMessage("บันทึกข้อมูลสำเร็จ")

          toast({
            title: "สำเร็จ",
            description: result.message || "แก้ไขรายการที่ดินสำเร็จ",
          })

          // นำทางกลับไปยังหน้าโปรไฟล์
          router.push("/profile")
        } else {
          console.error("Error updating listing:", result.error)
          setStatusMessage(null)
          setErrorDetails(result.error || "ไม่สามารถแก้ไขรายการที่ดินได้")

          toast({
            title: "เกิดข้อผิดพลาด",
            description: result.error || "ไม่สามารถแก้ไขรายการที่ดินได้",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Submission error:", error)
        setStatusMessage(null)
        setErrorDetails(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล")

        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล",
          variant: "destructive",
        })
      }
    })
  }

  // แสดงข้อความกำลังโหลดขณะตรวจสอบการล็อกอิน
  if (isLoading || isLoadingListing) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  // ถ้าไม่ได้ล็อกอิน ให้แสดงข้อความแจ้งเตือนและปุ่มไปยังหน้าล็อกอิน
  if (isAuthenticated === false) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p>กรุณาเข้าสู่ระบบก่อนแก้ไขรายการ</p>
          </div>
          <Button onClick={() => router.push(`/login?redirect=/edit-listing/${listingId}`)} className="w-full">
            ไปยังหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/profile" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">แก้ไขรายการที่ดิน</h1>
          </div>
        </div>

        {statusMessage && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <p className="text-yellow-600 dark:text-yellow-500">{statusMessage}</p>
          </div>
        )}

        {errorDetails && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <p className="text-red-600 dark:text-red-500 font-medium">ข้อผิดพลาด:</p>
            <p className="text-red-600 dark:text-red-500">{errorDetails}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* รายละเอียดทรัพย์สิน */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-medium">รายละเอียดทรัพย์สิน</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  ชื่อรายการ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="เช่น ที่ดินวิวภูเขา"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">ประเภททรัพย์สิน</Label>
                <select
                  id="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                >
                  {thaiPropertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับที่ดิน"
                className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 min-h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">สถานะรายการ</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 py-2 rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                >
                  {listingStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ส่วนของที่ตั้ง */}
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-medium">ที่ตั้งทรัพย์สิน</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">
                  เลขที่/ที่อยู่ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="บ้านเลขที่ ถนน ซอย"
                    className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">
                  จังหวัด <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่อจังหวัด"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">
                  อำเภอ/เขต <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่ออำเภอ/เขต"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdistrict">
                  ตำบล/แขวง <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subdistrict"
                  value={formData.subdistrict}
                  onChange={handleInputChange}
                  placeholder="กรอกชื่อตำบล/แขวง"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">รหัสไปรษณีย์</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="รหัสไปรษณีย์"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">ประเทศ</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="ประเทศ"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-6 mb-4">
              <h3 className="text-lg font-medium">ข้อมูลราคาและขนาด</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  ราคา (บาท) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="กรอกราคา (เฉพาะตัวเลข)"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  type="number"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">
                  ขนาดที่ดิน (ไร่) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="กรอกขนาดที่ดิน"
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50"
                  type="number"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* รูปภาพ */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-medium">รูปภาพ</h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-500 dark:text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">ลากและวางรูปภาพของคุณที่นี่ หรือคลิกเพื่อเรียกดู</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    รูปแบบที่รองรับ: JPG, PNG, WEBP (สูงสุด 10MB ต่อรูป)
                  </p>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    className="rounded-full"
                    disabled={isUploading}
                  >
                    {isUploading ? "กำลังอัปโหลด..." : "เรียกดูไฟล์"}
                  </Button>
                </div>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ปุ่มดำเนินการ */}
          <div className="pt-4 flex justify-between">
            <Link href="/profile">
              <Button type="button" variant="outline" className="rounded-full" disabled={isPending}>
                ยกเลิก
              </Button>
            </Link>

            <Button
              type="submit"
              className="rounded-full py-6 px-8 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
              disabled={isPending || isUploading}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
