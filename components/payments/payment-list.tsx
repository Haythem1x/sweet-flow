"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  invoice_id: string
  payment_date: string
  amount: number
  payment_method: string
  notes: string
}

interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
}

interface PaymentListProps {
  payments: Payment[]
  invoices: Invoice[]
  userId: string
}

export function PaymentList({ payments: initialPayments, invoices, userId }: PaymentListProps) {
  const [payments, setPayments] = useState(initialPayments)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()
  const router = useRouter()

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices.find((inv) => inv.id === invoiceId)?.invoice_number || "Unknown"
  }

  const filteredPayments = payments.filter((p) => getInvoiceNumber(p.invoice_id).includes(searchTerm))

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return

    const { error } = await supabase.from("payments").delete().eq("id", id)
    if (!error) {
      setPayments(payments.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💳</span> Payment Records
        </CardTitle>
        <CardDescription>
          {payments.length} payments recorded • {totalCollected.toFixed(3)} TND total collected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by invoice number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Invoice</th>
                <th className="text-left p-3 font-semibold">Payment Date</th>
                <th className="text-right p-3 font-semibold">Amount</th>
                <th className="text-left p-3 font-semibold">Method</th>
                <th className="text-left p-3 font-semibold">Notes</th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono font-semibold">{getInvoiceNumber(payment.invoice_id)}</td>
                    <td className="p-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="text-right p-3 font-semibold text-green-600">{payment.amount.toFixed(3)} TND</td>
                    <td className="p-3">{payment.payment_method || "-"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{payment.notes || "-"}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(payment.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
