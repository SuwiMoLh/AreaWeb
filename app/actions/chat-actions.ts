"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// ฟังก์ชันสำหรับส่งข้อความ
export async function sendMessage(conversationId: string, senderId: string, receiverId: string, message: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // ตรวจสอบว่ามีการสนทนาอยู่แล้วหรือไม่
    if (!conversationId) {
      // สร้างการสนทนาใหม่
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          buyer_id: senderId, // สมมติว่าผู้ส่งเป็นผู้ซื้อ (ต้องปรับตามความเหมาะสม)
          seller_id: receiverId,
          last_message: message,
        })
        .select("id")
        .single()

      if (conversationError) {
        console.error("Error creating conversation:", conversationError)
        return { success: false, error: conversationError.message }
      }

      conversationId = newConversation.id
    } else {
      // อัปเดตข้อความล่าสุดในการสนทนา
      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          last_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)

      if (updateError) {
        console.error("Error updating conversation:", updateError)
        return { success: false, error: updateError.message }
      }
    }

    // บันทึกข้อความ
    const { error: messageError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
    })

    if (messageError) {
      console.error("Error sending message:", messageError)
      return { success: false, error: messageError.message }
    }

    revalidatePath(`/chat/${receiverId}`)
    return { success: true, conversationId }
  } catch (error) {
    console.error("Unexpected error in sendMessage:", error)
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" }
  }
}

// ฟังก์ชันสำหรับลบข้อความ
export async function deleteMessage(messageId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // ดึงข้อมูลข้อความเพื่อใช้ในการ revalidate path
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("conversation_id, receiver_id")
      .eq("id", messageId)
      .single()

    if (fetchError) {
      console.error("Error fetching message:", fetchError)
      return { success: false, error: fetchError.message }
    }

    // ลบข้อความ
    const { error: deleteError } = await supabase.from("messages").delete().eq("id", messageId)

    if (deleteError) {
      console.error("Error deleting message:", deleteError)
      return { success: false, error: deleteError.message }
    }

    // อัปเดตข้อความล่าสุดในการสนทนา (ถ้าจำเป็น)
    const { data: latestMessage, error: latestError } = await supabase
      .from("messages")
      .select("message")
      .eq("conversation_id", message.conversation_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!latestError && latestMessage) {
      await supabase
        .from("conversations")
        .update({
          last_message: latestMessage.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", message.conversation_id)
    }

    revalidatePath(`/chat/${message.receiver_id}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteMessage:", error)
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" }
  }
}

// ฟังก์ชันสำหรับลบการสนทนาทั้งหมด
export async function deleteConversation(conversationId: string, otherUserId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // ลบข้อความทั้งหมดในการสนทนา
    const { error: messagesError } = await supabase.from("messages").delete().eq("conversation_id", conversationId)

    if (messagesError) {
      console.error("Error deleting messages:", messagesError)
      return { success: false, error: messagesError.message }
    }

    // ลบการสนทนา
    const { error: conversationError } = await supabase.from("conversations").delete().eq("id", conversationId)

    if (conversationError) {
      console.error("Error deleting conversation:", conversationError)
      return { success: false, error: conversationError.message }
    }

    // รีเฟรชหน้าข้อความ
    revalidatePath("/messages")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in deleteConversation:", error)
    return { success: false, error: "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง" }
  }
}
