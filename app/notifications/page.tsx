"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useSupabase } from "@/lib/supabase/supabase-provider"
import Link from "next/link"

// ข้อมูลจำลองสำหรับการแจ้งเตือน
const mockNotifications = [
  {
    id: 1,
    title: "มีข้อความใหม่",
    message: "คุณได้รับข้อความใหม่จาก Sarah Johnson เกี่ยวกับ Mountain View Estate",
    time: "10 นาทีที่แล้ว",
    read: false,
    link: "/messages",
  },
  {
    id: 2,
    title: "มีผู้สนใจรายการของคุณ",
    message: "Michael Chen สนใจรายการ Desert Oasis ของคุณ",
    time: "2 ชั่วโมงที่แล้ว",
    read: false,
    link: "/listings/listing-2",
  },
  {
    id: 3,
    title: "การชำระเงินสำเร็จ",
    message: "การชำระเงินสำหรับการโปรโมทรายการ Forest Retreat สำเร็จแล้ว",
    time: "1 วันที่แล้ว",
    read: true,
    link: "/listings/listing-3",
  },
  {
    id: 4,
    title: "มีการอัปเดตนโยบาย",
    message: "นโยบายความเป็นส่วนตัวของเราได้รับการอัปเดต โปรดตรวจสอบ",
    time: "3 วันที่แล้ว",
    read: true,
    link: "/settings/privacy",
  },
  {
    id: 5,
    title: "ข้อเสนอพิเศษ",
    message: "รับส่วนลด 20% สำหรับการโปรโมทรายการในเดือนนี้",
    time: "1 สัปดาห์ที่แล้ว",
    read: true,
    link: "/promotions",
  },
]

export default function NotificationsPage() {
  const { t } = useTranslation()
  const { session, isLoading } = useSupabase()
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  useEffect(() => {
    if (!isLoading && !session) {
      setShowLoginPrompt(true)
    } else {
      setShowLoginPrompt(false)
    }
  }, [isLoading, session])

  // แสดงหน้าโหลดระหว่างตรวจสอบสถานะการล็อกอิน
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดการแจ้งเตือน...</p>
        </div>
      </div>
    )
  }

  // แสดงข้อความให้ล็อกอินถ้าไม่มี session
  if (showLoginPrompt) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30 text-center">
          <div className="mb-6">
            <Bell className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-4">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">คุณต้องเข้าสู่ระบบก่อนเข้าถึงการแจ้งเตือน</p>
          <Link href="/login">
            <Button className="rounded-full px-8 py-6 text-lg bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all hover:scale-105">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    )
  }

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl p-8 shadow-xl border border-gray-200/30 dark:border-gray-800/30">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">การแจ้งเตือน</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">คุณมี {unreadCount} การแจ้งเตือนที่ยังไม่ได้อ่าน</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="rounded-full" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              {t("notifications.markRead")}
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium mb-2">ไม่มีการแจ้งเตือน</h3>
            <p className="text-gray-600 dark:text-gray-400">คุณไม่มีการแจ้งเตือนในขณะนี้</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl p-4 transition-all ${
                  notification.read
                    ? "bg-white/50 dark:bg-gray-900/50"
                    : "bg-blue-50/70 dark:bg-blue-900/20 border-l-4 border-blue-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <Link href={notification.link} className="flex-1" onClick={() => markAsRead(notification.id)}>
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{notification.time}</p>
                  </Link>
                  <div className="flex items-center ml-4">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
