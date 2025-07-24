"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Send, Paperclip, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
  read_at: string | null
  conversation_id: string
  image_url: string | null
}

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}

export default function ChatInterface({
  currentUserId,
  otherUserId,
  conversationId,
  otherUserProfile,
}: {
  currentUserId: string
  otherUserId: string
  conversationId: string
  otherUserProfile?: {
    full_name: string | null
    avatar_url: string | null
  }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const channelRef = useRef<any>(null)
  const { toast } = useToast()

  // ฟังก์ชันสำหรับเลื่อนไปยังข้อความล่าสุด
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // ฟังก์ชันสำหรับเลือกรูปภาพ
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // สร้าง URL สำหรับแสดงตัวอย่างรูปภาพ
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  // ฟังก์ชันสำหรับยกเลิกการเลือกรูปภาพ
  const cancelImageSelection = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // โหลดข้อความและข้อมูลผู้ใช้
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        console.log("Fetching data for conversation:", conversationId)

        // ดึงข้อมูลผู้ใช้อีกฝ่าย (ถ้ายังไม่มี)
        if (!otherUserProfile) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url")
            .eq("id", otherUserId)
            .single()

          if (profileError) {
            console.error("Error fetching profile:", profileError)
          } else {
            console.log("Fetched profile:", profile)
            setOtherUser(profile)
          }
        } else {
          console.log("Using provided profile:", otherUserProfile)
          setOtherUser({
            id: otherUserId,
            full_name: otherUserProfile.full_name,
            avatar_url: otherUserProfile.avatar_url,
          })
        }

        // ดึงข้อความทั้งหมดในการสนทนา
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error fetching messages:", messagesError)
        } else {
          console.log("Fetched messages:", messagesData?.length || 0)
          setMessages(messagesData || [])

          // อัปเดตสถานะการอ่านข้อความ
          const unreadMessages = messagesData?.filter((msg) => !msg.read && msg.sender_id !== currentUserId) || []

          if (unreadMessages.length > 0) {
            console.log("Marking messages as read:", unreadMessages.length)
            const unreadIds = unreadMessages.map((msg) => msg.id)
            const now = new Date().toISOString()

            await supabase.from("messages").update({ read: true, read_at: now }).in("id", unreadIds)
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [conversationId, currentUserId, otherUserId, otherUserProfile])

  // เลื่อนไปยังข้อความล่าสุดเมื่อข้อความเปลี่ยนแปลง
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ตั้งค่า Supabase Realtime subscription
  useEffect(() => {
    console.log("Setting up realtime subscription for conversation:", conversationId)

    // สมัครสมาชิกเพื่อรับข้อความใหม่
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("New message received via realtime:", payload)
          const newMsg = payload.new as Message

          // เพิ่มข้อความใหม่เข้าไปใน state
          setMessages((prev) => [...prev, newMsg])

          // อัปเดตสถานะการอ่านถ้าข้อความไม่ได้ส่งจากผู้ใช้ปัจจุบัน
          if (newMsg.sender_id !== currentUserId) {
            const now = new Date().toISOString()

            supabase
              .from("messages")
              .update({ read: true, read_at: now })
              .eq("id", newMsg.id)
              .then(({ error }) => {
                if (error) console.error("Error updating read status:", error)
              })
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Message updated via realtime:", payload)
          const updatedMsg = payload.new as Message

          // อัปเดตข้อความใน state
          setMessages((prev) => prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg)))
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Message deleted via realtime:", payload)
          const deletedMsgId = payload.old.id

          // ลบข้อความออกจาก state
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedMsgId))
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to chat channel")
        }
      })

    channelRef.current = channel

    // ยกเลิกการสมัครสมาชิกเมื่อ component unmount
    return () => {
      console.log("Unsubscribing from chat channel")
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [conversationId, currentUserId])

  // ฟังก์ชันสำหรับอัปโหลดรูปภาพไปยัง Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true)
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `chat-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("chat-images").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // ดึง URL ของรูปภาพที่อัปโหลด
      const { data } = supabase.storage.from("chat-images").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "อัปโหลดรูปภาพไม่สำเร็จ",
        description: "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  // ฟังก์ชันสำหรับส่งข้อความ
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!newMessage.trim() && !selectedImage) || isUploading) return

    setIsSending(true)

    try {
      console.log("Sending message to conversation:", conversationId)

      let imageUrl = null

      // อัปโหลดรูปภาพถ้ามีการเลือก
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
        if (!imageUrl && !newMessage.trim()) {
          setIsSending(false)
          return
        }
      }

      const messageData = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim() || (imageUrl ? "รูปภาพ" : ""),
        read: false,
        read_at: null,
        image_url: imageUrl,
      }

      const { data, error } = await supabase.from("messages").insert(messageData).select()

      if (error) {
        console.error("Error sending message:", error)
        throw error
      }

      console.log("Message sent successfully:", data)
      setNewMessage("")
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error in sendMessage:", error)
      toast({
        title: "ส่งข้อความไม่สำเร็จ",
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // แสดงตัวโหลดระหว่างโหลดข้อมูล
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  console.log("Current otherUser state:", otherUser) // เพิ่ม log เพื่อตรวจสอบข้อมูล

  // หาข้อความสุดท้ายที่ส่งโดยผู้ใช้ปัจจุบันและถูกอ่านแล้ว
  const lastReadMessage = [...messages]
    .reverse()
    .find((msg) => msg.sender_id === currentUserId && msg.read && msg.read_at)

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 rounded-lg shadow-md overflow-hidden">
      {/* ส่วนแสดงข้อความ */}
      <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 my-8">
            ยังไม่มีข้อความในการสนทนานี้ เริ่มส่งข้อความเพื่อเริ่มการสนทนา
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.sender_id === currentUserId
            const messageTime = formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: th,
            })

            // ตรวจสอบว่าเป็นข้อความสุดท้ายที่ถูกอ่านหรือไม่
            const isLastReadMessage = message.id === lastReadMessage?.id

            return (
              <div key={message.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg p-3 relative group ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {/* เนื้อหาข้อความ */}
                  <div className="text-sm">
                    {message.content}

                    {/* แสดงรูปภาพถ้ามี */}
                    {message.image_url && (
                      <div className="mt-2">
                        <Image
                          src={message.image_url || "/placeholder.svg"}
                          alt="รูปภาพในข้อความ"
                          width={200}
                          height={150}
                          className="rounded-md object-cover cursor-pointer"
                          onClick={() => window.open(message.image_url!, "_blank")}
                        />
                      </div>
                    )}
                  </div>

                  {/* เวลาและสถานะการอ่าน */}
                  <div className="text-xs mt-1 opacity-70 flex items-center justify-end">
                    {messageTime}
                    {isCurrentUser && <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>}
                  </div>

                  {/* แสดง "อ่านแล้ว" ใต้ข้อความสุดท้ายที่ถูกอ่าน */}
                  {isLastReadMessage && <div className="text-xs text-right mt-1 text-blue-300">อ่านแล้ว</div>}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ส่วนแสดงตัวอย่างรูปภาพที่เลือก */}
      {imagePreview && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <div className="relative inline-block">
            <Image
              src={imagePreview || "/placeholder.svg"}
              alt="ตัวอย่างรูปภาพ"
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
            <button
              onClick={cancelImageSelection}
              className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1"
              aria-label="ยกเลิกการเลือกรูปภาพ"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* ส่วนส่งข้อความ */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <div className="flex-1 min-w-0">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..."
              className="resize-none min-h-[40px] max-h-[120px] py-2 px-3"
              rows={1}
              maxLength={1000}
              disabled={isSending || isUploading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (newMessage.trim() || selectedImage) sendMessage(e)
                }
              }}
            />
          </div>

          {/* ปุ่มแนบรูปภาพ */}
          <div className="flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              ref={fileInputRef}
              disabled={isSending || isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              className="h-10 w-10 rounded-full"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>

          {/* ปุ่มส่งข้อความ */}
          <div className="flex-shrink-0">
            <Button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || isSending || isUploading}
              className={`h-10 w-10 rounded-full p-0 ${isUploading ? "opacity-70" : ""}`}
            >
              {isUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
