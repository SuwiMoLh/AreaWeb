"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteConversation } from "@/app/actions/chat-actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter, usePathname } from "next/navigation"

interface DeleteConversationButtonProps {
  conversationId: string
  otherUserId: string
}

export default function DeleteConversationButton({ conversationId, otherUserId }: DeleteConversationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const result = await deleteConversation(conversationId, otherUserId)

      if (result.success) {
        setIsOpen(false)
        toast({
          title: "ลบการสนทนาสำเร็จ",
          description: "การสนทนาและข้อความทั้งหมดถูกลบแล้ว",
        })

        // ตรวจสอบว่าอยู่ในหน้าแชทหรือไม่
        if (pathname.includes("/chat/")) {
          // ถ้าอยู่ในหน้าแชท ให้นำทางกลับไปยังหน้าข้อความ
          router.push("/messages")
        } else {
          // ถ้าอยู่ในหน้าข้อความอยู่แล้ว ให้รีเฟรชหน้านั้น
          router.refresh()
        }
      } else {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการลบการสนทนา")
      }
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบการสนทนาได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center justify-center h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <Trash2 className="h-4 w-4" data-trash="true" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบการสนทนา</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือไม่ว่าต้องการลบการสนทนานี้? การกระทำนี้ไม่สามารถย้อนกลับได้ และข้อความทั้งหมดจะถูกลบอย่างถาวร
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={(e) => e.stopPropagation()}>
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "กำลังลบ..." : "ลบการสนทนา"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
