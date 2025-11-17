"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Image from "next/image"

interface BusinessSettings {
  id: string
  business_name: string
  currency: string
  tax_rate: number
  invoice_prefix: string
  organization_id: string
  business_logo_url: string | null
}

interface BusinessSettingsProps {
  settings: BusinessSettings | null
  userId: string
}

export function BusinessSettings({ settings, userId }: BusinessSettingsProps) {
  const supabase = createClient()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    business_name: settings?.business_name || "My Business",
    currency: settings?.currency || "TND",
    tax_rate: settings?.tax_rate || 0,
    invoice_prefix: settings?.invoice_prefix || "INV-",
    business_logo_url: settings?.business_logo_url ?? null,
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // --------------------------------------------------------------------
  //  LOGO UPLOAD HANDLER
  // --------------------------------------------------------------------

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)

      const fileExt = file.name.split(".").pop()
      const fileName = `${settings?.id}-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("business_logos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get PUBLIC URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("business_logos").getPublicUrl(filePath)

      // Update formData instantly
      setFormData((prev) => ({
        ...prev,
        business_logo_url: publicUrl,
      }))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to upload logo")
    } finally {
      setIsUploading(false)
    }
  }

  // --------------------------------------------------------------------
  //  SAVE BUSINESS SETTINGS
  // --------------------------------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      const updateData = { ...formData }

      if (settings) {
        const { error } = await supabase
          .from("business_settings")
          .update(updateData)
          .eq("id", settings.id)

        if (error) throw error
      }

      setSuccess(true)
      setIsEditing(false)
      router.refresh()

    } catch (error: any) {
      console.error(error)
      setError(error.message || "Failed to update business settings")
    }
  }

  // --------------------------------------------------------------------
  //  UI
  // --------------------------------------------------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏢</span> Business Settings
        </CardTitle>
        <CardDescription>Configure your business information</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* LOGO PREVIEW + UPLOAD */}
          <div className="space-y-2">
            <Label>Business Logo</Label>

            <div className="flex items-center gap-4">
              {/* Image Preview */}
              <div className="w-20 h-20 border rounded-md bg-gray-50 flex items-center justify-center overflow-hidden">
                {formData.business_logo_url ? (
                  <Image
                    src={formData.business_logo_url}
                    alt="Business Logo"
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400">No Logo</span>
                )}
              </div>

              {/* Upload Button */}
              {isEditing && (
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                  />
                  {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
                </div>
              )}
            </div>
          </div>

          {/* FORM FIELDS */}
          <div>
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              disabled={!isEditing}
              className="h-9"
              required
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              disabled={!isEditing}
              className="w-full h-9 px-3 border border-input rounded-md bg-background"
            >
              <option value="TND">Tunisian Dinar (TND)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                value={formData.tax_rate}
                onChange={(e) => setFormData({ ...formData, tax_rate: Number.parseFloat(e.target.value) })}
                disabled={!isEditing}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
              <Input
                id="invoice_prefix"
                value={formData.invoice_prefix}
                onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                disabled={!isEditing}
                className="h-9"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
              Saved successfully!
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button className="w-full" asChild>
                <button type="button" onClick={() => setIsEditing(true)}>
                  Edit Settings
                </button>
              </Button>
            ) : (
              <>
                <Button type="submit" className="flex-1">
                  Save Settings
                </Button>

                <Button variant="outline" className="flex-1" asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        business_name: settings?.business_name || "My Business",
                        currency: settings?.currency || "TND",
                        tax_rate: settings?.tax_rate || 0,
                        invoice_prefix: settings?.invoice_prefix || "INV-",
                        business_logo_url: settings?.business_logo_url ?? null,
                      })
                      setError(null)
                      setSuccess(false)
                    }}
                  >
                    Cancel
                  </button>
                </Button>
              </>
            )}
          </div>

        </form>
      </CardContent>
    </Card>
  )
}
