"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
        : `${window.location.origin}/auth/reset-password`
        
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })
      
      if (error) throw error

      setSuccess(true)
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

      {/* Forgot Password Card */}
      <Card className="relative z-10 w-full max-w-md p-8 shadow-2xl border-2 bg-background/95 backdrop-blur-md">
        <div className="space-y-6">
          {!success ? (
            <>
              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Reset your password</h2>
                <p className="text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    "Sending reset link..."
                  ) : (
                    <>
                      Send reset link
                      <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link 
                  href="/auth/login" 
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
                >
                  <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Click the link in the email to reset your password. The link will expire in 1 hour.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => setSuccess(false)} 
                  variant="outline"
                  className="w-full h-11 text-base font-semibold"
                >
                  Try another email
                </Button>

                <div className="text-center">
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
                  >
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
