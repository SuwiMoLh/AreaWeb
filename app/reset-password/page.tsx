"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasResetToken, setHasResetToken] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่ามี hash parameter สำหรับการรีเซ็ตรหัสผ่านหรือไม่
    const hash = window.location.hash
    setHasResetToken(hash.includes("type=recovery"))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านของคุณ",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      toast({
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        description: "รหัสผ่านของคุณได้รับการอัปเดตแล้ว",
      })

      // รอสักครู่ก่อนเปลี่ยนเส้นทาง
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้ โปรดลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!hasResetToken) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl glass-card p-8 animate-float">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight mb-2">ลิงก์ไม่ถูกต้อง</h1>
            <p className="text-gray-600 dark:text-gray-400">ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่</p>
          </div>

          <Link href="/forgot-password">
            <Button className="w-full rounded-full py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105">
              ขอลิงก์รีเซ็ตรหัสผ่านใหม่
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-3xl glass-card p-8 animate-float">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">รีเซ็ตรหัสผ่าน</h1>
          <p className="text-gray-600 dark:text-gray-400">กรุณากำหนดรหัสผ่านใหม่ของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              ยืนยันรหัสผ่านใหม่
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
            disabled={loading || !supabase}
          >
            {loading ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน"}
          </Button>

          {!supabase && (
            <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
              โหมดพรีวิว: ระบบรีเซ็ตรหัสผ่านไม่สามารถใช้งานได้ในขณะนี้
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
