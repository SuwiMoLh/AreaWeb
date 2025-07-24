"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Session, SupabaseClient, User } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

type SupabaseContext = {
  supabase: SupabaseClient | null
  session: Session | null
  user: User | null
  isLoading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// สร้าง mock client สำหรับกรณีที่ไม่มีตัวแปรสภาพแวดล้อม Supabase
const createMockClient = () => {
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      getUser: () => Promise.resolve({ data: { user: null } }),
      signInWithPassword: () => Promise.resolve({ error: new Error("Supabase not configured") }),
      signUp: () => Promise.resolve({ error: new Error("Supabase not configured") }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => {
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
  } as unknown as SupabaseClient
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  // เพิ่มตัวแปร state เพื่อติดตามว่าเป็นการโหลดครั้งแรกหรือไม่
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  // เพิ่มตัวแปร state เพื่อติดตามว่าได้แสดง toast แล้วหรือยัง
  const [hasShownLoginToast, setHasShownLoginToast] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่ามีตัวแปรสภาพแวดล้อม Supabase หรือไม่
    const hasSupabaseEnv =
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string"

    try {
      // สร้าง client จริงหรือ mock client ตามความเหมาะสม
      const client = hasSupabaseEnv ? createClientComponentClient() : createMockClient()

      setSupabase(client)

      if (hasSupabaseEnv) {
        // ถ้ามีตัวแปรสภาพแวดล้อม ให้ตั้งค่า auth listener
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((event, session) => {
          setSession(session)
          setUser(session?.user || null)

          // แสดง toast เฉพาะเมื่อไม่ใช่การโหลดครั้งแรก และยังไม่เคยแสดง toast
          if (!isInitialLoad) {
            if (event === "SIGNED_IN" && !hasShownLoginToast) {
              toast({
                title: "เข้าสู่ระบบสำเร็จ",
                description: "ยินดีต้อนรับกลับมา!",
              })
              // ตั้งค่าว่าได้แสดง toast แล้ว
              setHasShownLoginToast(true)
            }

            if (event === "SIGNED_OUT") {
              toast({
                title: "ออกจากระบบสำเร็จ",
                description: "คุณได้ออกจากระบบแล้ว",
              })
              // รีเซ็ตสถานะการแสดง toast เมื่อออกจากระบบ
              setHasShownLoginToast(false)
            }
          }
        })

        const getSession = async () => {
          try {
            const { data } = await client.auth.getSession()
            console.log("Session data:", data) // เพิ่มการล็อกข้อมูล session
            setSession(data.session)
            setUser(data.session?.user || null)
          } catch (error) {
            console.error("Error getting session:", error)
          } finally {
            setIsLoading(false)
            // ตั้งค่า isInitialLoad เป็น false หลังจากดึงข้อมูล session เสร็จ
            setIsInitialLoad(false)
          }
        }

        getSession()

        return () => {
          subscription.unsubscribe()
        }
      } else {
        // ถ้าไม่มีตัวแปรสภาพแวดล้อม ให้แสดง toast แจ้งเตือน
        console.warn("Supabase environment variables are missing. Using mock client.")
        toast({
          title: "โหมดพรีวิว",
          description: "กำลังใช้งานในโหมดพรีวิว ฟีเจอร์บางอย่างอาจไม่ทำงาน",
        })
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      setSupabase(null)
      setIsLoading(false)
    }
  }, [toast])

  return <Context.Provider value={{ supabase, session, user, isLoading }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
