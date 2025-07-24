"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { MessageSquare, User } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
// ลบการนำเข้า DeleteConversationButton
import { useRouter } from "next/navigation"

interface Conversation {
  id: string
  last_message: string | null
  updated_at: string
  buyer_id: string
  seller_id: string
  listing_id: string | null
  other_user: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  unread_count: number
  current_user_avatar?: string | null
}

export default function ChatSidebar({ userId }: { userId: string; activeConversationId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 1. ดึงข้อมูลการสนทนาทั้งหมดที่เกี่ยวข้องกับผู้ใช้ปัจจุบัน
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select(`
          id, 
          last_message, 
          updated_at, 
          buyer_id, 
          seller_id,
          listing_id
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("updated_at", { ascending: false })

      if (conversationsError) {
        throw conversationsError
      }

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([])
        setIsLoading(false)
        return
      }

      // หลังจากดึงข้อมูลการสนทนาและก่อนดึงข้อมูลโปรไฟล์ของผู้อื่น เพิ่มโค้ดนี้:
      // ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
      const { data: currentUserProfile, error: currentUserError } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .single()

      if (currentUserError) {
        console.error("Error fetching current user profile:", currentUserError)
      }

      const currentUserAvatar = currentUserProfile?.avatar_url

      // 2. รวบรวม user IDs ทั้งหมดที่เกี่ยวข้อง
      const otherUserIds = conversationsData.map((conv) => (conv.buyer_id === userId ? conv.seller_id : conv.buyer_id))

      // 3. ดึงข้อมูลโปรไฟล์ของผู้ใช้ทั้งหมดในครั้งเดียว
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", otherUserIds)

      if (profilesError) {
        throw profilesError
      }

      // 4. สร้าง map ของข้อมูลโปรไฟล์เพื่อง่ายต่อการเข้าถึง
      const profilesMap = (profilesData || []).reduce(
        (map, profile) => {
          map[profile.id] = profile
          return map
        },
        {} as Record<string, any>,
      )

      // 5. แปลงข้อมูลให้อยู่ในรูปแบบที่ต้องการ
      const formattedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id
          const otherUserProfile = profilesMap[otherUserId] || { full_name: "ผู้ใช้", avatar_url: null }

          // เพิ่ม timestamp เพื่อป้องกันการแคชรูปภาพ
          const timestamp = new Date().getTime()
          const avatarUrl = otherUserProfile?.avatar_url ? `${otherUserProfile.avatar_url}?t=${timestamp}` : null

          // นับจำนวนข้อความที่ยังไม่ได้อ่าน
          const { count, error: countError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("receiver_id", userId)
            .eq("read", false)

          if (countError) {
            console.error("Error counting unread messages:", countError)
          }

          return {
            id: conv.id,
            last_message: conv.last_message,
            updated_at: conv.updated_at,
            buyer_id: conv.buyer_id,
            seller_id: conv.seller_id,
            listing_id: conv.listing_id,
            other_user: {
              id: otherUserId,
              full_name: otherUserProfile?.full_name || "ผู้ใช้",
              avatar_url: avatarUrl,
            },
            unread_count: count || 0,
            current_user_avatar: currentUserAvatar, // เพิ่มข้อมูลรูปโปรไฟล์ของผู้ใช้ปัจจุบัน
          }
        }),
      )

      setConversations(formattedConversations)
    } catch (err: any) {
      console.error("Error fetching conversations:", err)
      setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()

    // ตั้งค่า Supabase Realtime subscription
    const channel = supabase
      .channel("conversations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `buyer_id=eq.${userId}`,
        },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `seller_id=eq.${userId}`,
        },
        () => fetchConversations(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchConversations(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchConversations])

  // ฟังก์ชันสำหรับจัดการการลบการสนทนา
  const handleConversationDeleted = (deletedConversationId: string) => {
    setConversations((prevConversations) => prevConversations.filter((conv) => conv.id !== deletedConversationId))
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full p-4 text-center text-red-500">
        <p>เกิดข้อผิดพลาดในการโหลดข้อมูล:</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="w-full h-full">
        <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-800">ข้อความ</h2>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-600" />
          <p>ยังไม่มีข้อความ</p>
          <p className="text-sm mt-1">เริ่มต้นติดต่อผู้ขายเพื่อสอบถามข้อมูลเพิ่มเติม</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <h2 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-800">ข้อความ</h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {conversations.map((conversation) => {
          const timeAgo = formatDistanceToNow(new Date(conversation.updated_at), {
            addSuffix: true,
            locale: th,
          })

          return (
            <div
              key={conversation.id}
              className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <Link href={`/chat/${conversation.other_user.id}`} className="block p-4 flex-1">
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{conversation.other_user.full_name}</h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.last_message || "ยังไม่มีข้อความ"}
                    </p>
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
