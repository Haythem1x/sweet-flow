"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
}

interface UserProfileProps {
  profile: Profile | null
  userId: string
}

export function UserProfile({ profile, userId }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log("[v0] Updating profile with data:", formData)
      const { error } = await supabase.from("profiles").update(formData).eq("id", userId)

      if (error) throw error
      
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>👤</span> User Profile
        </CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || ""} disabled className="h-9 bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={profile?.role || "admin"} disabled className="h-9 bg-muted capitalize" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button 
                type="button" 
                onClick={() => {
                  setIsEditing(true)
                  setError(null)
                  setSuccess(false)
                }} 
                className="w-full"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({ full_name: profile?.full_name || "" })
                    setError(null)
                    setSuccess(false)
                  }} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
