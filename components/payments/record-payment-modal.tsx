"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  paid_amount: number
}

interface RecordPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  invoices: Invoice[]
  userId: string
}

export function RecordPaymentModal({ isOpen, onClose, invoices, userId }: RecordPaymentModalProps) {
  const [formData, setFormData] = useState({
    invoice_id: invoices[0]?.id || "",
    payment_date: new Date().toISOString().split("T")[0],
    amount: 0,
    payment_method: "cash",
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const selectedInvoice = invoices.find((inv) => inv.id === formData.invoice_id)
  const remainingBalance = selectedInvoice ? selectedInvoice.total_amount - selectedInvoice.paid_amount : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.amount <= 0) {
      alert("Payment amount must be greater than 0")
      return
    }
    if (formData.amount > remainingBalance) {
      alert(`Payment amount cannot exceed outstanding balance (${remainingBalance.toFixed(3)} TND)`)
      return
    }

    setIsLoading(true)
    try {
      // Record payment
      const { error: paymentError } = await supabase.from("payments").insert({
        organization_id: userId,
        invoice_id: formData.invoice_id,
        payment_date: formData.payment_date,
        amount: formData.amount,
        payment_method: formData.payment_method,
        notes: formData.notes,
      })

      if (paymentError) throw paymentError

      // Update invoice paid_amount and status
      const newPaidAmount = (selectedInvoice?.paid_amount || 0) + formData.amount
      const newStatus = newPaidAmount >= selectedInvoice!.total_amount ? "paid" : "partial"

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          paid_amount: newPaidAmount,
          payment_status: newStatus,
        })
        .eq("id", formData.invoice_id)

      if (updateError) throw updateError

      router.refresh()
      onClose()
    } catch (error) {
      console.error("Error recording payment:", error)
      alert("Error recording payment")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Record Payment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invoice">Invoice *</Label>
            <select
              id="invoice"
              value={formData.invoice_id}
              onChange={(e) => setFormData({ ...formData, invoice_id: e.target.value })}
              className="w-full h-9 px-3 border border-input rounded-md bg-background"
              required
            >
              {invoices.map((invoice) => {
                const balance = invoice.total_amount - invoice.paid_amount
                return (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {balance.toFixed(3)} TND due
                  </option>
                )
              })}
            </select>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold">{remainingBalance.toFixed(3)} TND</p>
          </div>

          <div>
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              required
              className="h-9"
            />
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              max={remainingBalance}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
              required
              className="h-9"
            />
            <p className="text-xs text-muted-foreground mt-1">Max: {remainingBalance.toFixed(3)} TND</p>
          </div>

          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <select
              id="method"
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full h-9 px-3 border border-input rounded-md bg-background"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              placeholder="Optional: Reference number, check number, etc."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Recording..." : "Record Payment"}
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
