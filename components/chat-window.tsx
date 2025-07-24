"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function ChatWindow({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationParam = searchParams.get("conversation")

  // ฟังก์ชันสำหรับเลื่อนไปยังข้อความล่าสุด
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // โหลดข้อความเมื่อ conversationId เปลี่ยนแปลง
  useEffect(() => {
    if (!conversationParam) {
      setIsLoading(false)
      return
    }

    setConversationId(conversationParam)

    const fetchMessages = async () => {
      setIsLoading(true)
      try {
        // ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงการสนทนานี้หรือไม่
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationParam)
          .single()

        if (convError || !conversation) {
          console.error("Error fetching conversation:", convError)
          toast({
            title: "ไม่พบการสนทนา",
            description: "ไม่พบการสนทนาที่คุณต้องการเข้าถึง",
            variant: "destructive",
          })
          router.push("/messages")
          return
        }

        // ตรวจสอบว่าผู้ใช้เป็นส่วนหนึ่งของการสนทนานี้หรือไม่
        if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
          toast({
            title: "ไม่มีสิทธิ์เข้าถึง",
            description: "คุณไม่มีสิทธิ์เข้าถึงการสนทนานี้",
            variant: "destructive",
          })
          router.push("/messages")
          return
        }

        // ดึงข้อมูลผู้ใช้อีกฝ่าย
        const otherUserId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", otherUserId)
          .single()

        setOtherUser(profile)

        // ดึงข้อความทั้งหมดในการสนทนา
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationParam)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
          return
        }

        setMessages(messagesData || [])

        // อัปเดตสถานะการอ่านข้อความ
        const unreadMessages = messagesData?.filter((msg) => !msg.read && msg.sender_id !== userId) || []

        if (unreadMessages.length > 0) {
          const unreadIds = unreadMessages.map((msg) => msg.id)
          await supabase.from("messages").update({ read: true }).in("id", unreadIds)
        }
      } catch (error) {
        console.error("Error in fetchMessages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [conversationParam, userId, supabase, router, toast])

  // เลื่อนไปยังข้อความล่าสุดเมื่อข้อความเปลี่ยนแปลง
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ตั้งค่า Supabase Realtime subscription
  useEffect(() => {
    if (!conversationId) return

    // สมัครสมาชิกเพื่อรับข้อความใหม่
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])

          // อัปเดตสถานะการอ่านถ้าข้อความไม่ได้ส่งจากผู้ใช้ปัจจุบัน
          if (newMsg.sender_id !== userId) {
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", newMsg.id)
              .then(({ error }) => {
                if (error) console.error("Error updating read status:", error)
              })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [conversationId, supabase, userId])

  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !conversationId) return

    setIsSending(true)

    try {
      // ดึงข้อมูลการสนทนาเพื่อหา receiver_id
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single()

      if (convError) {
        console.error("Error fetching conversation:", convError)
        throw convError
      }

      // กำหนด receiver_id เป็น ID ของผู้ใช้อีกฝ่าย
      const receiverId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id

      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: receiverId,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "ส่งข้อความไม่สำเร็จ",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // แสดงข้อความว่าไม่มีการสนทนาที่เลือก
  if (!conversationId) {
    return <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900"></div>
  }

  // แสดงตัวโหลดระหว่างโหลดข้อมูล
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* ส่วนหัวของหน้าต่างแชท */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3">
          {otherUser?.avatar_url ? (
            <Image
              src={otherUser.avatar_url || "/placeholder.svg"}
              alt={otherUser.full_name || "ผู้ใช้"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {(otherUser?.full_name || "?")[0]}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium">{otherUser?.full_name || "ผู้ใช้"}</h3>
        </div>
      </div>

      {/* ส่วนแสดงข้อความ */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 my-8">
            ยังไม่มีข้อความในการสนทนานี้ เริ่มส่งข้อความเพื่อเริ่มการสนทนา
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender_id === userId
            const messageTime = formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: th,
            })

            return (
              <div key={message.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
                    {messageTime}
                    {isCurrentUser && <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ส่วนส่งข้อความ */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 resize-none"
            rows={1}
            maxLength={1000}
            disabled={isSending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (newMessage.trim()) sendMessage(e)
              }
            }}
          />
          <Button type="submit" className="ml-2" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
