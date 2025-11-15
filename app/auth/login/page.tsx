"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { Candy, ChevronRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Brand Section */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/95 via-accent/95 to-primary/90 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/chocolate-background.png')] opacity-30 bg-cover bg-center" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-transparent to-primary/40" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <Candy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SweetFlow</h1>
              <p className="text-white/80 text-sm">Distribution Management</p>
            </div>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Manage your wholesale distribution with ease
            </h2>
            <p className="text-lg text-white/90">
              Track products, customers, invoices, and payments all in one powerful platform designed for chocolate and candy distributors.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-sm text-white/80">Products</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">200+</div>
            <div className="text-sm text-white/80">Customers</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold mb-1">99%</div>
            <div className="text-sm text-white/80">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="bg-primary text-primary-foreground rounded-xl p-3">
              <Candy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SweetFlow</h1>
              <p className="text-sm text-muted-foreground">Distribution Management</p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className="p-6 shadow-lg border-2">
            <form onSubmit={handleLogin} className="space-y-5">
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  "Logging in..."
                ) : (
                  <>
                    Log in to your account
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/auth/sign-up" 
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                Create account
                <ChevronRight className="w-3 h-3" />
              </Link>
            </p>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
