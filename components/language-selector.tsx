"use client"

import { useTranslation } from "@/lib/i18n/use-translation"
import { Globe } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

export function LanguageSelector() {
  const { lang, setLang, t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (value: string) => {
    console.log("Changing language to:", value)
    setLang(value)

    // Save language preference to localStorage
    try {
      localStorage.setItem("language", value)
      document.documentElement.lang = value
    } catch (error) {
      console.error("Error saving language preference:", error)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Globe className="h-5 w-5" />
        <Label>{t("settings.language")}</Label>
      </div>
      <Select value={lang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-40 bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="th">ภาษาไทย</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
