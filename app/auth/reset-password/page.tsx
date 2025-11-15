"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { ChevronRight, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error

      router.push("/auth/login?reset=success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_11tixf11tixf11ti-61t32DDnz2udx2nMvbHjmRxCU7OImi.png')" }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Reset Password Card */}
      <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-2 bg-background/95 backdrop-blur-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Set new password</h2>
            <p className="text-muted-foreground">
              Enter a new password for your account
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-semibold group" 
              disabled={isLoading}
            >
              {isLoading ? (
                "Updating password..."
              ) : (
                <>
                  Update password
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
