"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("") // เพิ่มบรรทัดนี้เพื่อล้างค่า query หลังจากค้นหา
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <div className="relative">
        <Input
          type="text"
          placeholder="ค้นหารายการที่ดิน..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-16 py-2 w-full rounded-full border border-gray-200 bg-white/90 dark:bg-gray-800/90 dark:border-gray-700"
          searchIcon
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-3 py-1 h-8"
        >
          ค้นหา
        </Button>
      </div>
    </form>
  )
}
