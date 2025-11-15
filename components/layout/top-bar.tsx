"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { useState } from "react"

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 z-20">
      <h2 className="text-lg sm:text-xl font-semibold truncate mr-4">{title}</h2>
      <Button 
        variant="outline" 
        onClick={handleLogout} 
        disabled={isLoading} 
        className="text-xs sm:text-sm bg-transparent whitespace-nowrap touch-manipulation"
        size="sm"
      >
        {isLoading ? "Logging out..." : "Logout"}
      </Button>
    </div>
  )
}
