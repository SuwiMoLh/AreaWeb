"use client"

import { useSupabase } from "@/lib/supabase/supabase-provider"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n/use-translation"

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { t } = useTranslation()

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
      router.push("/")
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={`cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 ${className}`}
    >
      {t("nav.logout")}
    </button>
  )
}
