"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { MapPin, Edit, Mail, Phone, User, LogIn, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserListings from "@/components/user-listings"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { createProfilesBucket } from "./actions"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { session, isLoading, user, supabase } = useSupabase()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")

  // ข้อมูลผู้ใช้
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [lineId, setLineId] = useState("") // เพิ่ม lineId

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    // ถ้าไม่ได้กำลังโหลดและไม่มี session ให้แสดงข้อความให้ล็อกอิน
    if (!isLoading && !session) {
      setShowLoginPrompt(true)
    } else {
      setShowLoginPrompt(false)

      // โหลดข้อมูลผู้ใช้
      if (session?.user) {
        const loadUserProfile = async () => {
          try {
            // ดึงข้อมูลจากตาราง profiles
            const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

            // ดึงข้อมูลจาก auth_user_view เพื่อให้ได้ข้อมูลจาก auth.users
            const { data: authUserData, error: authUserError } = await supabase
              .from("auth_user_view")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (authUserError) {
              console.error("Error fetching auth user data:", authUserError)
            } else if (authUserData) {
              console.log("Auth user data:", authUserData)
              // ถ้ามี avatar_url ใน raw_user_meta_data ให้ใช้เป็นรูปโปรไฟล์
              if (authUserData.raw_user_meta_data?.avatar_url) {
                setProfileImageUrl(authUserData.raw_user_meta_data.avatar_url)
                console.log("Using avatar URL from auth user:", authUserData.raw_user_meta_data.avatar_url)
              }

              // ถ้ามี line_id ใน raw_user_meta_data ให้ใช้
              if (authUserData.raw_user_meta_data?.line_id) {
                setLineId(authUserData.raw_user_meta_data.line_id)
              }
            }

            if (error) {
              console.error("Error loading profile:", error)
              // ถ้าไม่พบข้อมูลในตาราง profiles ให้ใช้ข้อมูลจาก user metadata
              setName(session.user.user_metadata?.full_name || "")
              setPhone(session.user.user_metadata?.phone || "")
              setLocation(session.user.user_metadata?.location || "")
              setLineId(session.user.user_metadata?.line_id || "")

              // ถ้ายังไม่ได้ตั้งค่า profileImageUrl จาก auth_user_view ให้ใช้จาก user_metadata
              if (!profileImageUrl && session.user.user_metadata?.avatar_url) {
                setProfileImageUrl(session.user.user_metadata.avatar_url)
              }
            } else if (data) {
              // ใช้ข้อมูลจากตาราง profiles
              setName(data.full_name || "")
              setPhone(data.phone || "")
              setLocation(data.location || "")
              setLineId(data.line_id || "")

              // ถ้ายังไม่ได้ตั้งค่า profileImageUrl จาก auth_user_view และมีใน profiles ให้ใช้จาก profiles
              if (!profileImageUrl && data.avatar_url) {
                setProfileImageUrl(data.avatar_url)
              }
            }
          } catch (error) {
            console.error("Failed to load profile:", error)
          }
        }

        loadUserProfile()
      }
    }
  }, [isLoading, session, supabase, profileImageUrl])

  // ฟังก์ชันเปิด file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // แก้ไขฟังก์ชัน handleAvatarChange ดังนี้:
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    try {
      setUploadingAvatar(true)

      if (!supabase || !session?.user) {
        throw new Error("Supabase client not available or user not logged in")
      }

      const file = e.target.files[0]

      // สร้าง FormData สำหรับส่งไปยัง API Route
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", session.user.id)

      // เรียกใช้ API Route
      const response = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        // ถ้าเกิดข้อผิดพลาด "Bucket not found" ให้ลองสร้าง bucket
        if (result.error && (result.error.includes("bucket") || result.error.includes("not found"))) {
          console.log("Attempting to create profiles bucket...")

          // เรียกใช้ Server Action เพื่อสร้าง bucket
          const { success, error: createBucketError } = await createProfilesBucket()

          if (!success) {
            throw new Error("ไม่สามารถสร้าง storage bucket ได้: " + createBucketError)
          }

          // ลองอัปโหลดอีกครั้ง
          const retryResponse = await fetch("/api/upload-profile-image", {
            method: "POST",
            body: formData,
          })

          const retryResult = await retryResponse.json()

          if (!retryResponse.ok) {
            throw new Error("ไม่สามารถอัปโหลดรูปภาพได้: " + retryResult.error)
          }

          // อัปเดต state
          setProfileImageUrl(retryResult.avatarUrl)
        } else {
          throw new Error("ไม่สามารถอัปโหลดรูปภาพได้: " + result.error)
        }
      } else {
        // อัปเดต state
        setProfileImageUrl(result.avatarUrl)
      }

      toast({
        title: "อัปโหลดรูปโปรไฟล์สำเร็จ",
        description: "รูปโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      toast({
        title: "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
      // รีเซ็ต input เพื่อให้สามารถเลือกไฟล์เดิมได้อีก
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // ฟังก์ชันบันทึกข้อมูลผู้ใช้
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      // อัปเดตข้อมูลใน auth.users
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          phone: phone,
          location: location,
          line_id: lineId, // เพิ่ม line_id
        },
      })

      if (error) {
        throw error
      }

      // อัปเดตข้อมูลในตาราง profiles
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: session?.user?.id,
        full_name: name,
        phone: phone,
        location: location,
        line_id: lineId, // เพิ่ม line_id
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error updating profile:", profileError)
        // ไม่ throw error เพื่อให้สามารถดำเนินการต่อได้
      }

      toast({
        title: "อัปเดตโปรไฟล์สำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      })

      setIsEditing(false)
    } catch (error: any) {
      toast({
        title: "อัปเดตโปรไฟล์ล้มเหลว",
        description: error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // แสดงหน้าโหลดระหว่างตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูลโปรไฟล์...</p>
        </div>
      </div>
    )
  }

  // แสดงข้อความให้ล็อกอินถ้าไม่มี session
  if (showLoginPrompt) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30 text-center">
          <div className="mb-6">
            <User className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">คุณต้องเข้าสู่ระบบก่อนเข้าถึงหน้าโปรไฟล์</p>
          <Button
            className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
            onClick={() => (window.location.href = "/login")}
          >
            <LogIn className="h-5 w-5 mr-2" />
            เข้าสู่ระบบ
          </Button>
        </div>
      </div>
    )
  }

  // เพิ่มการ log เพื่อตรวจสอบ URL ของรูปโปรไฟล์
  console.log("Profile image URL:", profileImageUrl)
  console.log("User metadata:", session?.user?.user_metadata)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Profile Image */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl || "/placeholder.svg"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover h-full w-full"
                  onError={(e) => {
                    console.error("Error loading profile image:", e)
                    // ถ้าโหลดรูปไม่สำเร็จ ให้ใช้รูปตัวอย่าง
                    e.currentTarget.src = "/professional-man-suit.png"
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <User className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <button
              className="absolute bottom-0 right-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full p-2 shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              disabled={uploadingAvatar}
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {name || session?.user?.user_metadata?.full_name || session?.user?.email || "ผู้ใช้งาน"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {location || session?.user?.user_metadata?.location || "ไม่ระบุตำแหน่ง"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "ยกเลิก" : "แก้ไขโปรไฟล์"}
              </Button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ชื่อ-นามสกุล</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="email"
                        defaultValue={session?.user?.email || ""}
                        disabled
                        className="pl-10 w-full py-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/30 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ตำแหน่ง</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">LINE ID</label>
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                      <input
                        type="text"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                        placeholder="ระบุ LINE ID ของคุณ"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="rounded-full px-6 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    disabled={loading}
                  >
                    {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">อีเมล</p>
                    <p className="flex items-center text-gray-900 dark:text-gray-100">
                      <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      {session?.user?.email || "ไม่ระบุอีเมล"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">เบอร์โทรศัพท์</p>
                    <p className="flex items-center text-gray-900 dark:text-gray-100">
                      <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                      {phone || session?.user?.user_metadata?.phone || "ไม่ระบุเบอร์โทรศัพท์"}
                    </p>
                  </div>

                  {lineId && (
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">LINE ID</p>
                      <p className="flex items-center text-gray-900 dark:text-gray-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        {lineId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* รายการของฉัน */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">รายการของฉัน</h2>
          <UserListings />
        </div>
      </div>
    </div>
  )
}
