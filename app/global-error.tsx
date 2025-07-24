"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="th">
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-semibold mt-2 mb-2">เกิดข้อผิดพลาดร้ายแรง</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
            ขออภัย เกิดข้อผิดพลาดร้ายแรงในระบบ โปรดลองใหม่อีกครั้งหรือกลับมาภายหลัง
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => reset()}
              className="rounded-full px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
            >
              ลองใหม่อีกครั้ง
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="rounded-full px-6 py-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-105"
              >
                <Home className="h-4 w-4 mr-2" />
                กลับไปหน้าแรก
              </Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
