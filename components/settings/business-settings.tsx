"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BusinessSettings {
  id: string
  business_name: string
  currency: string
  tax_rate: number
  invoice_prefix: string
  organization_id: string
}

interface BusinessSettingsProps {
  settings: BusinessSettings | null
  userId: string
}

export function BusinessSettings({ settings, userId }: BusinessSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    business_name: settings?.business_name || "My Business",
    currency: settings?.currency || "TND",
    tax_rate: settings?.tax_rate || 0,
    invoice_prefix: settings?.invoice_prefix || "INV-",
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (settings) {
        const { error } = await supabase.from("business_settings").update(formData).eq("id", settings.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("business_settings").insert({
          organization_id: userId,
          ...formData,
        })

        if (error) throw error
      }

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

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

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)} className="w-full">
                Edit Settings
              </Button>
            ) : (
              <>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
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
