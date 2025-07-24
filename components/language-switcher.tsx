"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

// Available languages
const languages = [
  { code: "th", name: "ภาษาไทย" },
  { code: "en", name: "English" },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (code: string) => {
    console.log("Changing language to:", code)
    setLang(code)

    // บันทึกภาษาที่เลือกลงใน localStorage เพื่อให้ใช้ได้ทุกหน้า
    try {
      localStorage.setItem("language", code)
      // ตั้งค่า HTML lang attribute เพื่อให้เบราว์เซอร์รู้ว่าหน้าเว็บใช้ภาษาอะไร
      document.documentElement.lang = code

      // สร้าง event เพื่อแจ้งเตือนคอมโพเนนต์อื่นๆ ว่ามีการเปลี่ยนภาษา
      const event = new CustomEvent("languageChange", { detail: { language: code } })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error saving language preference:", error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl"
      >
        {languages.map((language) => (
          <DropdownMenuItem key={language.code} onClick={() => handleLanguageChange(language.code)}>
            <div className="flex items-center w-full">
              {language.name}
              {lang === language.code && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500"></span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export LanguageSelector as an alias for LanguageSwitcher to maintain compatibility
export const LanguageSelector = LanguageSwitcher
