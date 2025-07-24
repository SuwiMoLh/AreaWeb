"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSubmitted(true)
      toast({
        title: "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว",
        description: "โปรดตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
      })
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ โปรดลองอีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-3xl glass-card p-8 animate-float">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">ลืมรหัสผ่าน</h1>
          <p className="text-gray-600 dark:text-gray-400">กรอกอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน</p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6">
              <p>เราได้ส่งอีเมลพร้อมลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง {email} แล้ว</p>
              <p className="mt-2 text-sm">โปรดตรวจสอบกล่องจดหมายของคุณและทำตามคำแนะนำ</p>
            </div>
            <Button
              onClick={() => router.push("/login")}
              className="w-full rounded-full py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
            >
              กลับไปยังหน้าเข้าสู่ระบบ
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                อีเมล
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
              disabled={loading || !supabase}
            >
              {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </Button>

            {!supabase && (
              <p className="text-center text-sm text-amber-600 dark:text-amber-400 mt-2">
                โหมดพรีวิว: ระบบรีเซ็ตรหัสผ่านไม่สามารถใช้งานได้ในขณะนี้
              </p>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            จำรหัสผ่านได้แล้ว?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
