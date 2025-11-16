"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  selling_price: number
}

interface Customer {
  id: string
  shop_name: string
}

interface InvoiceItem {
  product_id: string
  quantity: number
  unit_price: number
}

interface InvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function InvoiceModal({ isOpen, onClose, userId }: InvoiceModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    customer_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [] as InvoiceItem[],
    discount_amount: 0,
    tax_rate: 0,
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Fetch customers and products when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchData = async () => {
      const { data: customersData } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
      setCustomers(customersData || [])

      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
      setProducts(productsData || [])
    }

    fetchData()
  }, [isOpen, userId, supabase])

  // Initialize first customer after fetch
  useEffect(() => {
    if (customers.length > 0 && !formData.customer_id) {
      setFormData(prev => ({ ...prev, customer_id: customers[0].id }))
    }
  }, [customers])

  // Initialize first item after products fetch
  useEffect(() => {
    if (products.length > 0 && formData.items.length === 0) {
      setFormData(prev => ({
        ...prev,
        items: [{ product_id: products[0].id, quantity: 1, unit_price: products[0].selling_price }],
      }))
    }
  }, [products])

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: products[0]?.id || "", quantity: 1, unit_price: products[0]?.selling_price || 0 }],
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const taxAmount = (subtotal - formData.discount_amount) * (formData.tax_rate / 100)
  const total = subtotal - formData.discount_amount + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.items.length === 0) {
      alert("Please add at least one item")
      return
    }

    setIsLoading(true)
    try {
      const invoiceNumber = `INV-${Date.now()}`
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: userId,
          customer_id: formData.customer_id,
          invoice_number: invoiceNumber,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date,
          subtotal,
          discount_amount: formData.discount_amount,
          tax_amount: taxAmount,
          total_amount: total,
          paid_amount: 0,
          payment_status: "unpaid",
          notes: formData.notes,
        })
        .select()
        .single()
      if (invoiceError) throw invoiceError

      const itemsToInsert = formData.items.map(item => ({
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price,
      }))
      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert)
      if (itemsError) throw itemsError

      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error creating invoice:", error)
      alert("Error creating invoice")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-bold mb-4">Create Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <select
                id="customer"
                value={formData.customer_id}
                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full h-9 px-3 border border-input rounded-md bg-background"
                required
              >
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.shop_name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="invoice_date">Invoice Date *</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={e => setFormData({ ...formData, invoice_date: e.target.value })}
                required
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                required
                className="h-9"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Invoice Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>+ Add Item</Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <select
                    value={item.product_id}
                    onChange={e => {
                      const selectedProduct = products.find(p => p.id === e.target.value)
                      handleItemChange(index, "product_id", e.target.value)
                      if (selectedProduct) handleItemChange(index, "unit_price", selectedProduct.selling_price)
                    }}
                    className="flex-1 h-9 px-2 border border-input rounded-md bg-background text-sm"
                  >
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleItemChange(index, "quantity", Number.parseInt(e.target.value))}
                    className="w-20 h-9"
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    step="0.001"
                    value={item.unit_price}
                    onChange={e => handleItemChange(index, "unit_price", Number.parseFloat(e.target.value))}
                    className="w-24 h-9"
                  />
                  <span className="w-24 text-right text-sm font-semibold">{(item.quantity * item.unit_price).toFixed(3)}</span>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} className="px-2">Remove</Button>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-2 bg-muted p-4 rounded-lg">
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{subtotal.toFixed(3)} TND</span></div>
            <div className="flex justify-between text-sm gap-4">
              <Input type="number" placeholder="Discount" step="0.001" value={formData.discount_amount}
                onChange={e => setFormData({ ...formData, discount_amount: Number.parseFloat(e.target.value) })}
                className="w-32 h-8 text-sm"
              />
              <Input type="number" placeholder="Tax %" step="0.01" value={formData.tax_rate}
                onChange={e => setFormData({ ...formData, tax_rate: Number.parseFloat(e.target.value) })}
                className="w-24 h-8 text-sm"
              />
            </div>
            <div className="flex justify-between font-bold text-base"><span>Total:</span><span>{total.toFixed(3)} TND</span></div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? "Creating..." : "Create Invoice"}</Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
