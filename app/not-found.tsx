import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-9xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="text-3xl font-semibold mt-6 mb-2">ไม่พบหน้า</h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">ขออภัย เราไม่พบหน้าที่คุณกำลังค้นหา</p>
      <Link href="/">
        <Button className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105">
          กลับไปหน้าแรก
        </Button>
      </Link>
    </div>
  )
}
