"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { InvoiceViewModal } from "./invoice-view-modal"

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  total_amount: number
  paid_amount: number
  payment_status: "paid" | "partial" | "unpaid"
  customer_id: string
}

interface InvoiceListProps {
  invoices: Invoice[]
  userId: string
}

export function InvoiceList({ invoices: initialInvoices, userId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoice_number.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || inv.payment_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    const { error } = await supabase.from("invoices").delete().eq("id", id)
    if (!error) {
      setInvoices(invoices.filter((i) => i.id !== id))
      router.refresh()
    }
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const handleStatusChange = (invoiceId: string, newStatus: "paid" | "partial" | "unpaid") => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, payment_status: newStatus } : inv
    ))
    router.refresh()
  }

  const stats = {
    paid: invoices.filter((i) => i.payment_status === "paid").length,
    partial: invoices.filter((i) => i.payment_status === "partial").length,
    unpaid: invoices.filter((i) => i.payment_status === "unpaid").length,
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🧾</span> Invoices
          </CardTitle>
          <CardDescription>
            Total: {invoices.length} • Paid: {stats.paid} • Partial: {stats.partial} • Unpaid: {stats.unpaid}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-col md:flex-row">
            <Input
              placeholder="Search invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 md:flex-1"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 border border-input rounded-md bg-background"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Invoices table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Invoice #</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-right p-3 font-semibold">Paid</th>
                  <th className="text-right p-3 font-semibold">Outstanding</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const outstanding = invoice.total_amount - invoice.paid_amount
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono font-semibold">{invoice.invoice_number}</td>
                        <td className="p-3">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td className="text-right p-3">{invoice.total_amount.toFixed(3)} TND</td>
                        <td className="text-right p-3 font-semibold">{invoice.paid_amount.toFixed(3)} TND</td>
                        <td className="text-right p-3 font-semibold text-orange-600">{outstanding.toFixed(3)} TND</td>
                        <td className="text-center p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              invoice.payment_status === "paid"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : invoice.payment_status === "partial"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}
                          >
                            {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs bg-transparent"
                              onClick={() => handleView(invoice)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(invoice.id)}
                              className="text-xs"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <InvoiceViewModal
        invoice={selectedInvoice}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setSelectedInvoice(null)
        }}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}
