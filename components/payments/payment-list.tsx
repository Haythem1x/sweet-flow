"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"

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
  const [customers, setCustomers] = useState<Record<string, string>>({})
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchCustomers = async () => {
      const customerIds = [...new Set(invoices.map(inv => inv.customer_id))]
      const { data } = await supabase
        .from('customers')
        .select('id, shop_name')
        .in('id', customerIds)
      
      if (data) {
        const customerMap = data.reduce((acc: Record<string, string>, c) => ({ ...acc, [c.id]: c.shop_name }), {})
        setCustomers(customerMap)
      }
    }
    if (invoices.length > 0) {
      fetchCustomers()
    }
  }, [invoices])

  const getInvoiceNumber = (invoiceId: string) => {
    return invoices.find((inv) => inv.id === invoiceId)?.invoice_number || "Unknown"
  }

  const getCustomerName = (invoiceId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId)
    if (!invoice) return "Unknown"
    return customers[invoice.customer_id] || "Loading..."
  }

  const filteredPayments = payments.filter((p) => {
    const invoiceNum = getInvoiceNumber(p.invoice_id).toLowerCase()
    const customerName = getCustomerName(p.invoice_id).toLowerCase()
    const term = searchTerm.toLowerCase()
    return invoiceNum.includes(term) || customerName.includes(term)
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record? This will update the invoice status.")) return

    const payment = payments.find(p => p.id === id)
    if (!payment) return

    const { error } = await supabase.from("payments").delete().eq("id", id)
    if (!error) {
      const invoice = invoices.find(inv => inv.id === payment.invoice_id)
      if (invoice) {
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount')
          .eq('invoice_id', payment.invoice_id)
          .neq('id', id)
        
        const newPaidAmount = (allPayments || []).reduce((sum, p) => sum + p.amount, 0)
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('id', payment.invoice_id)
          .single()
        
        if (invoiceData) {
          const newStatus = newPaidAmount === 0 ? 'unpaid' : 
                           newPaidAmount >= invoiceData.total_amount ? 'paid' : 'partial'
          
          await supabase
            .from('invoices')
            .update({ paid_amount: newPaidAmount, payment_status: newStatus })
            .eq('id', payment.invoice_id)
        }
      }
      
      setPayments(payments.filter((p) => p.id !== id))
      router.refresh()
    } else {
      alert("Error deleting payment")
    }
  }

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0)

  const getMethodBadge = (method: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      cash: "default",
      bank_transfer: "secondary",
      check: "outline",
      card: "secondary",
      other: "outline"
    }
    return <Badge variant={variants[method] || "outline"}>{method.replace('_', ' ')}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Records
        </CardTitle>
        <CardDescription>
          {payments.length} payments recorded • {totalCollected.toFixed(3)} TND total collected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search by invoice or customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10"
        />

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Invoice</th>
                <th className="text-left p-3 font-semibold">Customer</th>
                <th className="text-left p-3 font-semibold">Date</th>
                <th className="text-right p-3 font-semibold">Amount</th>
                <th className="text-left p-3 font-semibold">Method</th>
                <th className="text-left p-3 font-semibold">Notes</th>
                <th className="text-center p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono font-semibold text-sm">{getInvoiceNumber(payment.invoice_id)}</td>
                    <td className="p-3">{getCustomerName(payment.invoice_id)}</td>
                    <td className="p-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="text-right p-3 font-semibold text-green-600">{payment.amount.toFixed(3)} TND</td>
                    <td className="p-3">{getMethodBadge(payment.payment_method)}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[200px] truncate">{payment.notes || "-"}</td>
                    <td className="p-3 text-center">
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

        <div className="md:hidden space-y-3">
          {filteredPayments.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No payments found
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm">{getInvoiceNumber(payment.invoice_id)}</p>
                      <p className="text-sm text-muted-foreground">{getCustomerName(payment.invoice_id)}</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">{payment.amount.toFixed(3)} TND</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</span>
                    {getMethodBadge(payment.payment_method)}
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-muted-foreground border-t pt-2">{payment.notes}</p>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(payment.id)}
                    className="w-full mt-2"
                  >
                    Delete Payment
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
