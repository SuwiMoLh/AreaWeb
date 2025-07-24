"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { getTranslation } from "./translations"

type LanguageContextType = {
  lang: string
  setLang: (lang: string) => void
  t: (key: string) => string
}

const defaultContext: LanguageContextType = {
  lang: "th",
  setLang: () => {},
  t: (key) => key,
}

// Create context without JSX
export const LanguageContext = createContext<LanguageContextType>(defaultContext)

export function useTranslation() {
  return useContext(LanguageContext)
}

// แก้ไขฟังก์ชัน LanguageProvider เพื่อให้ตอบสนองต่อการเปลี่ยนภาษาได้ดีขึ้น
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("th")
  const [mounted, setMounted] = useState(false)

  // โหลดภาษาจาก localStorage เมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    setMounted(true)
    // Get language from localStorage or browser settings
    try {
      const savedLang = localStorage.getItem("language") || navigator.language.split("-")[0]
      if (savedLang === "th" || savedLang === "en") {
        setLang(savedLang)
      } else {
        // Default to Thai if not Thai or English
        setLang("th")
      }

      // Set the HTML lang attribute
      document.documentElement.lang = savedLang === "th" || savedLang === "en" ? savedLang : "th"
    } catch (error) {
      console.error("Error accessing localStorage:", error)
      // Default to Thai if there's an error
      setLang("th")
      document.documentElement.lang = "th"
    }
  }, [])

  // ตรวจจับการเปลี่ยนแปลงใน localStorage จากแท็บหรือหน้าต่างอื่น
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && e.newValue) {
        if (e.newValue === "th" || e.newValue === "en") {
          setLang(e.newValue)
          document.documentElement.lang = e.newValue
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // ตรวจจับ custom event "languageChange" ที่ถูกส่งจาก language-switcher
  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      const newLang = e.detail?.language
      if (newLang && (newLang === "th" || newLang === "en")) {
        console.log("Language change event detected:", newLang)
        setLang(newLang)
      }
    }

    // ต้องใช้ as any เพื่อแก้ปัญหา TypeScript กับ CustomEvent
    window.addEventListener("languageChange", handleLanguageChange as any)

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange as any)
    }
  }, [])

  const handleSetLang = (newLang: string) => {
    try {
      console.log("Setting language to:", newLang)
      setLang(newLang)
      localStorage.setItem("language", newLang)
      document.documentElement.lang = newLang

      // Create event to notify other components of language change
      const event = new CustomEvent("languageChange", { detail: { language: newLang } })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error setting language:", error)
    }
  }

  const t = (key: string) => {
    if (!mounted) return key
    return getTranslation(lang, key)
  }

  // Create context provider value
  const contextValue = {
    lang,
    setLang: handleSetLang,
    t,
  }

  // Return the provider using React.createElement instead of JSX
  return React.createElement(LanguageContext.Provider, { value: contextValue }, children)
}
