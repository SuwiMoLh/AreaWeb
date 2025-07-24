import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User } from "lucide-react"
import ChatInterface from "@/components/chat-interface"
import DeleteConversationButton from "@/components/delete-conversation-button"

export default async function ChatPage({ params }: { params: { userId: string } }) {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ถ้าไม่มีการล็อกอิน ให้ redirect ไปที่หน้าล็อกอิน
  if (!session) {
    redirect(`/login?redirect=/chat/${params.userId}`)
  }

  const currentUserId = session.user.id
  const otherUserId = params.userId

  // ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่กำลังคุยด้วย
  const { data: otherUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, updated_at")
    .eq("id", otherUserId)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
  }

  // ตรวจสอบว่ามีการสนทนาระหว่างผู้ใช้ทั้งสองคนหรือไม่
  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
    .or(`buyer_id.eq.${otherUserId},seller_id.eq.${otherUserId}`)
    .single()

  let conversationId = existingConversation?.id

  // ถ้ายังไม่มีการสนทนา ให้สร้างใหม่
  if (!conversationId) {
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        buyer_id: currentUserId,
        seller_id: otherUserId,
        listing_id: null, // อาจจะต้องเพิ่ม listing_id ถ้ามี
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      // จัดการข้อผิดพลาด
      return (
        <div className="container mx-auto p-4">
          <p className="text-red-500">เกิดข้อผิดพลาดในการสร้างการสนทนา กรุณาลองใหม่อีกครั้ง</p>
        </div>
      )
    }

    conversationId = newConversation.id
  }

  // สร้าง URL สำหรับรูปโปรไฟล์ที่ไม่มีการแคช
  const randomParam = Math.random().toString(36).substring(7)
  const defaultAvatar = "/default-avatar.png"

  // ใช้รูปโปรไฟล์จากฐานข้อมูลโดยตรง หรือใช้รูปเริ่มต้นถ้าไม่มี
  const profileImageUrl = otherUserProfile?.avatar_url || defaultAvatar

  return (
    <div className="container mx-auto p-4 flex flex-col h-[calc(100vh-4rem)]">
      {/* แสดงข้อมูลผู้ใช้ที่กำลังคุยด้วย - ส่วนนี้จะอยู่คงที่ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <Link
            href="/messages"
            className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="ย้อนกลับ"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
            <User className="h-8 w-8 text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{otherUserProfile?.full_name || "ผู้ใช้"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">กำลังสนทนา</p>
          </div>
        </div>
        <DeleteConversationButton conversationId={conversationId} otherUserId={otherUserId} />
      </div>

      {/* ส่วนแชทที่สามารถเลื่อนได้ */}
      <div className="flex-1 overflow-y-auto">
        <ChatInterface
          currentUserId={currentUserId}
          otherUserId={otherUserId}
          conversationId={conversationId}
          otherUserProfile={{
            ...otherUserProfile,
            avatar_url: `${profileImageUrl}?v=${randomParam}`,
          }}
        />
      </div>
    </div>
  )
}
