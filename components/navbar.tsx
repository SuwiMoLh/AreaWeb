"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { MessageSquare, Moon, Settings, Sun, User, Upload, LogIn, Home, Map, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import { usePathname, useRouter } from "next/navigation"
import LogoutButton from "@/components/auth/logout-button"
import { SearchBar } from "@/components/search-bar"
import { supabase } from "@/lib/supabase/client"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t, lang, setLang } = useTranslation()
  const { session, isLoading } = useSupabase()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const channelRef = useRef<any>(null)

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Setup Supabase Realtime subscription
  useEffect(() => {
    if (!session?.user?.id || !mounted) return

    const currentUserId = session.user.id

    // แก้ไขฟังก์ชัน fetchUnreadMessagesCount ให้ใช้คอลัมน์ receiver_id โดยตรง
    const fetchUnreadMessagesCount = async () => {
      try {
        // ใช้คอลัมน์ receiver_id โดยตรง
        const { data, error } = await supabase
          .from("messages")
          .select("id")
          .eq("receiver_id", currentUserId)
          .eq("read", false)

        if (error) {
          console.error("Error fetching unread messages:", error.message)
          return
        }

        // นับจำนวนข้อความที่ยังไม่ได้อ่าน
        if (data) {
          setUnreadMessages(data.length)
        }
      } catch (err) {
        console.error("Failed to fetch unread messages:", err)
      }
    }

    // Initial fetch of unread messages
    fetchUnreadMessagesCount()

    // Setup Realtime subscription
    const setupRealtimeSubscription = async () => {
      try {
        // แก้ไขการตั้งค่า Realtime subscription ให้ใช้คอลัมน์ receiver_id โดยตรง
        // แทนที่ฟังก์ชัน setupRealtimeSubscription ทั้งหมดด้วยโค้ดนี้
        const channel = supabase
          .channel(`new-messages-${currentUserId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `receiver_id=eq.${currentUserId}`,
            },
            (payload) => {
              console.log("New message received:", payload)

              // ตรวจสอบว่าเรากำลังอยู่ในหน้าแชทกับผู้ส่งหรือไม่
              const senderId = payload.new.sender_id
              const isInChatWithSender = pathname?.includes(`/chat/${senderId}`)

              if (!isInChatWithSender) {
                setUnreadMessages((prev) => prev + 1)

                // Optional: Show browser notification if supported
                if ("Notification" in window && Notification.permission === "granted") {
                  new Notification("ข้อความใหม่", {
                    body: "คุณมีข้อความใหม่",
                    icon: "/favicon.ico",
                  })
                }
              }
            },
          )
          .subscribe((status) => {
            console.log("Subscription status:", status)
            if (status === "SUBSCRIBED") {
              console.log("Subscribed to new messages for user:", currentUserId)
            }
          })

        channelRef.current = channel
      } catch (err) {
        console.error("Failed to setup realtime subscription:", err)
      }
    }

    setupRealtimeSubscription()

    // Request notification permission
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission()
    }

    return () => {
      if (channelRef.current) {
        console.log("Unsubscribing from channel")
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [session, mounted, pathname])

  // Reset unread count when navigating to messages page
  useEffect(() => {
    if (pathname === "/messages" && unreadMessages > 0) {
      setUnreadMessages(0)
    }
  }, [pathname, unreadMessages])

  if (!mounted) {
    return null
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  const handleProfileClick = () => {
    setProfileMenuOpen(!profileMenuOpen)
  }

  const handleMenuItemClick = (path: string) => {
    navigateTo(path)
    setProfileMenuOpen(false)
  }

  const handleMessagesClick = () => {
    navigateTo("/messages")
    setUnreadMessages(0) // Reset unread count when clicking on messages
  }

  // Get user display name or fallback to email username
  const getUserDisplayName = () => {
    if (!session?.user) return "ผู้ใช้"

    // ใช้ชื่อที่ผู้ใช้ตั้งไว้ในโปรไฟล์ (full_name) ถ้ามี
    if (session.user.user_metadata?.full_name) {
      return session.user.user_metadata.full_name
    }

    // ถ้าไม่มีชื่อที่ตั้งไว้ ให้ใช้ชื่อจากอีเมล
    if (session.user.email) {
      return session.user.email.split("@")[0]
    }

    return "ผู้ใช้"
  }

  // Get user initials or fallback to "U"
  const getUserInitials = () => {
    if (!session?.user) return "U"

    // ถ้ามีชื่อที่ตั้งไว้ ให้ใช้อักษรตัวแรกของชื่อ
    if (session.user.user_metadata?.full_name) {
      const nameParts = session.user.user_metadata.full_name.split(/\s+/)
      if (nameParts.length > 1) {
        return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
      }
      return session.user.user_metadata.full_name.charAt(0).toUpperCase()
    }

    // ถ้าไม่มีชื่อที่ตั้งไว้ ให้ใช้อักษรจากอีเมล
    const nameParts = session.user.email.split("@")[0].split(/[._-]/)
    if (nameParts.length > 1) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
    }
    return session.user.email.charAt(0).toUpperCase()
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border-b border-gray-200/30 dark:border-gray-800/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Area
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <Link href="/">
                <Button variant={isActive("/") ? "default" : "ghost"} size="sm" className="rounded-full">
                  <Home className="h-4 w-4 mr-2" />
                  {t("nav.home")}
                </Button>
              </Link>
              <Link href="/listings">
                <Button variant={isActive("/listings") ? "default" : "ghost"} size="sm" className="rounded-full">
                  <Map className="h-4 w-4 mr-2" />
                  {t("nav.listings")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant={isActive("/contact") ? "default" : "ghost"} size="sm" className="rounded-full">
                  {t("nav.contact")}
                </Button>
              </Link>
            </div>

            <SearchBar />

            {!isLoading && session ? (
              <>
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  aria-label={t("nav.quickUpload")}
                  onClick={() => navigateTo("/upload")}
                >
                  <Plus className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 relative"
                  aria-label={t("nav.messages")}
                  onClick={handleMessagesClick}
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                  onClick={() => navigateTo("/login")}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("nav.login")}
                </Button>
                <Button
                  className="rounded-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                  size="sm"
                  onClick={() => navigateTo("/register")}
                >
                  {t("nav.register")}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {!isLoading && session && (
              <div className="border-l pl-4 border-gray-200/50 dark:border-gray-700/50">
                <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Avatar
                      className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-all"
                      onClick={handleProfileClick}
                      role="button"
                      aria-label={t("nav.profile") || "โปรไฟล์"}
                      tabIndex={0}
                    >
                      <AvatarImage src={session?.user?.user_metadata?.avatar_url || ""} />
                      <AvatarFallback className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl"
                  >
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                      <p className="text-sm font-medium">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => handleMenuItemClick("/profile")}>
                      <User className="h-4 w-4 mr-2" />
                      {t("nav.profile") || "โปรไฟล์"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMenuItemClick("/settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      {t("nav.settings") || "ตั้งค่า"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMenuItemClick("/upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("nav.upload") || "อัปโหลด"}
                    </DropdownMenuItem>
                    {session && (
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">รายการโปรดของฉัน</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <LogoutButton className="w-full flex items-center" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-4">
            {!isLoading && session && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50 relative"
                  aria-label={t("nav.messages")}
                  onClick={handleMessagesClick}
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Button>
                <Avatar
                  className="h-8 w-8 cursor-pointer border-2 border-transparent hover:border-gray-300 transition-all"
                  onClick={() => navigateTo("/profile")}
                  role="button"
                  aria-label={t("nav.profile") || "โปรไฟล์"}
                >
                  <AvatarImage src={session?.user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl">
            <div className="flex flex-col space-y-4 px-4">
              {!isLoading && session && (
                <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                  <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigateTo("/profile")}>
                    <AvatarImage src={session?.user?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-lg font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{getUserDisplayName()}</div>
                    <div
                      className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:underline"
                      onClick={() => navigateTo("/profile")}
                    >
                      {t("nav.editProfile") || "แก้ไขโปรไฟล์"}
                    </div>
                  </div>
                </div>
              )}
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                  isActive("/")
                    ? "bg-gray-200/70 dark:bg-gray-800/70"
                    : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => navigateTo("/")}
              >
                <Home className="h-5 w-5" />
                <span>{t("nav.home")}</span>
              </div>

              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                  isActive("/listings")
                    ? "bg-gray-200/70 dark:bg-gray-800/70"
                    : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => navigateTo("/listings")}
              >
                <Map className="h-5 w-5" />
                <span>{t("nav.listings")}</span>
              </div>

              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                  isActive("/contact")
                    ? "bg-gray-200/70 dark:bg-gray-800/70"
                    : "hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                }`}
                onClick={() => navigateTo("/contact")}
              >
                <span>{t("nav.contact")}</span>
              </div>

              <SearchBar />

              {!isLoading && session ? (
                <>
                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                    onClick={() => navigateTo("/upload")}
                  >
                    <Plus className="h-5 w-5" />
                    <span>{t("nav.quickUpload") || "ลงประกาศด่วน"}</span>
                  </div>

                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50 relative"
                    onClick={handleMessagesClick}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>{t("nav.messages")}</span>
                    {unreadMessages > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={() => navigateTo("/profile")}
                  >
                    <User className="h-5 w-5" />
                    <span>{t("nav.profile")}</span>
                  </div>

                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={() => navigateTo("/settings")}
                  >
                    <Settings className="h-5 w-5" />
                    <span>{t("nav.settings")}</span>
                  </div>

                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={() => navigateTo("/upload")}
                  >
                    <Upload className="h-5 w-5" />
                    <span>{t("nav.upload")}</span>
                  </div>

                  <div className="px-4 py-2">
                    <LogoutButton />
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                    onClick={() => navigateTo("/login")}
                  >
                    <LogIn className="h-5 w-5" />
                    <span>{t("nav.login")}</span>
                  </div>

                  <div
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    onClick={() => navigateTo("/register")}
                  >
                    <User className="h-5 w-5" />
                    <span>{t("nav.register")}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between px-4 py-2">
                <span>{theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
