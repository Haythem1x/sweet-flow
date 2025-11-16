"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { BarcodeScanner } from "./barcode-scanner"

interface Product {
  id: string
  name: string
  category: string
  brand: string
  cost_price: number
  selling_price: number
  stock_quantity: number
  barcode: string
  expiry_date: string
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  userId: string
}

const categories = ["Chocolates", "Candies", "Biscuits", "Snacks", "Grocery Items"]

export function ProductModal({ isOpen, onClose, product, userId }: ProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0],
    brand: "",
    cost_price: 0,
    selling_price: 0,
    stock_quantity: 0,
    barcode: "",
    expiry_date: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        brand: product.brand,
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        stock_quantity: product.stock_quantity,
        barcode: product.barcode,
        expiry_date: product.expiry_date,
      })
    } else {
      setFormData({
        name: "",
        category: categories[0],
        brand: "",
        cost_price: 0,
        selling_price: 0,
        stock_quantity: 0,
        barcode: "",
        expiry_date: "",
      })
    }
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (product) {
        // Update existing product
        const { error } = await supabase.from("products").update(formData).eq("id", product.id)
        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert({
          ...formData,
          user_id: userId,
        })
        if (error) throw error
      }
      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBarcodeScan = (barcode: string) => {
    setFormData({ ...formData, barcode })
    setShowScanner(false)
  }

  if (!isOpen) return null

  return (
    <>
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">{product ? "Edit Product" : "Add Product"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 border border-input rounded-md bg-background"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Cost Price *</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.001"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value === '' ? 0 : Number.parseFloat(e.target.value) })}
                  required
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor="selling">Selling Price *</Label>
                <Input
                  id="selling"
                  type="number"
                  step="0.001"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: e.target.value === '' ? 0 : Number.parseFloat(e.target.value) })}
                  required
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value === '' ? 0 : Number.parseInt(e.target.value) })}
                required
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  className="h-9"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowScanner(true)}
                  className="shrink-0"
                  title="Scan Barcode"
                >
                  📷
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : product ? "Update" : "Add"} Product
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
