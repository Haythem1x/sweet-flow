"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'

interface Customer {
  id: string
  shop_name: string
  owner_name: string
  phone: string
  address: string
  latitude?: number | null
  longitude?: number | null
  outstanding_balance: number
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  customer?: Customer | null
  userId: string
}

export function CustomerModal({ isOpen, onClose, customer, userId }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    shop_name: "",
    owner_name: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (customer) {
      setFormData({
        shop_name: customer.shop_name,
        owner_name: customer.owner_name,
        phone: customer.phone,
        address: customer.address,
        latitude: customer.latitude?.toString() || "",
        longitude: customer.longitude?.toString() || "",
      })
    } else {
      setFormData({
        shop_name: "",
        owner_name: "",
        phone: "",
        address: "",
        latitude: "",
        longitude: "",
      })
    }
  }, [customer, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const dataToSave = {
        shop_name: formData.shop_name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      }

      if (customer) {
        const { error } = await supabase.from("customers").update(dataToSave).eq("id", customer.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("customers").insert({
          ...dataToSave,
          organization_id: userId,
          outstanding_balance: 0,
        })
        if (error) throw error
      }
      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get current location. Please enter coordinates manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{customer ? "Edit Customer" : "Add Customer"}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shop">Shop Name *</Label>
            <Input
              id="shop"
              value={formData.shop_name}
              onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
              required
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="owner">Owner Name *</Label>
            <Input
              id="owner"
              value={formData.owner_name}
              onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
              required
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Location Coordinates (Optional)</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleGetCurrentLocation}
                className="text-xs h-7"
              >
                <MapPin className="w-3 h-3 mr-1" />
                Use Current Location
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="latitude" className="text-xs">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="36.8065"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-xs">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="10.1815"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {formData.latitude && formData.longitude && (
              <a
                href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                View on Google Maps
              </a>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : customer ? "Update" : "Add"} Customer
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
