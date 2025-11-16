"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { InvoiceViewModal } from "./invoice-view-modal"

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  total_amount: number
  paid_amount: number
  payment_status: "paid" | "partial" | "unpaid"
  customer_id: string
  user_id?: string
}

interface InvoiceListProps {
  userId: string
}

export function InvoiceList({ userId }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Fetch invoices for the logged-in user
  const fetchInvoices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("invoice_date", { ascending: false })

    if (error) console.error("Error fetching invoices:", error)
    else setInvoices(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchInvoices()
  }, [userId])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    const { error } = await supabase.from("invoices").delete().eq("id", id)
    if (!error) {
      setInvoices((prev) => prev.filter((i) => i.id !== id))
      router.refresh()
    } else {
      console.error("Delete error:", error)
    }
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const handleStatusChange = (invoiceId: string, newStatus: "paid" | "partial" | "unpaid") => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, payment_status: newStatus } : inv
      )
    )
    router.refresh()
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.invoice_number.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || inv.payment_status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    paid: invoices.filter((i) => i.payment_status === "paid").length,
    partial: invoices.filter((i) => i.payment_status === "partial").length,
    unpaid: invoices.filter((i) => i.payment_status === "unpaid").length,
  }

  if (loading) return <div>Loading invoices...</div>

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span>🧾</span> Invoices
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Total: {invoices.length} • Paid: {stats.paid} • Partial: {stats.partial} • Unpaid: {stats.unpaid}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Input
              placeholder="Search invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 sm:flex-1 text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Mobile view */}
          <div className="block md:hidden space-y-3">
            {filteredInvoices.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-sm">No invoices found</div>
            ) : (
              filteredInvoices.map((invoice) => {
                const outstanding = invoice.total_amount - invoice.paid_amount
                return (
                  <Card key={invoice.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-mono font-semibold text-base">{invoice.invoice_number}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </p>
                        </div>
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
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Total:</span>
                          <p className="font-semibold">{invoice.total_amount.toFixed(3)} TND</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Paid:</span>
                          <p className="font-semibold">{invoice.paid_amount.toFixed(3)} TND</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Outstanding:</span>
                          <p className="font-semibold text-orange-600">{outstanding.toFixed(3)} TND</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs bg-transparent"
                          onClick={() => handleView(invoice)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(invoice.id)}
                          className="flex-1 text-xs touch-manipulation"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
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
