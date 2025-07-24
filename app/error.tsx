"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6 mb-6">
        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-semibold mt-2 mb-2">เกิดข้อผิดพลาด</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        ขออภัย เกิดข้อผิดพลาดขึ้นในระบบ โปรดลองใหม่อีกครั้งหรือกลับไปยังหน้าแรก
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => reset()}
          className="rounded-full px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
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
  )
}
