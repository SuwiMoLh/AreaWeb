import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import ChatSidebar from "@/components/chat-sidebar"
import ChatWindow from "@/components/chat-window"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { conversation?: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // ตรวจสอบว่าผู้ใช้ล็อกอินหรือไม่
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // ถ้าไม่ได้ล็อกอิน แสดงหน้าให้ล็อกอินแทนการ redirect
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">กรุณาเข้าสู่ระบบ</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">คุณจำเป็นต้องเข้าสู่ระบบก่อนเพื่อดูข้อความของคุณ</p>
          <Link href={`/login?redirect=/messages`}>
            <Button className="rounded-full">
              <LogIn className="h-4 w-4 mr-2" />
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const userId = session.user.id
  const conversationId = searchParams.conversation

  return (
    <div className="flex min-h-screen">
      <ChatSidebar userId={userId} activeConversationId={conversationId} />
      <ChatWindow userId={userId} />
    </div>
  )
}

function ChatSidebarSkeleton() {
  return (
    <div className="w-80 border-r border-gray-200/30 dark:border-gray-800/30 bg-white/20 dark:bg-gray-900/20 backdrop-blur-md">
      <div className="p-4 border-b border-gray-200/30 dark:border-gray-800/30">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="p-4 space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
      </div>
    </div>
  )
}

function ChatWindowSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full bg-white/10 dark:bg-gray-900/10 backdrop-blur-md">
      <div className="p-4 border-b border-gray-200/30 dark:border-gray-800/30 flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-3 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex-1 p-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"} mb-4`}>
              <Skeleton className={`h-12 w-64 rounded-2xl ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`} />
            </div>
          ))}
      </div>
      <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  )
}
