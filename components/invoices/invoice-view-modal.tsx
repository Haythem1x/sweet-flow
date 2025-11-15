"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { X, Share2 } from 'lucide-react'

interface InvoiceItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  line_total: number
  product?: {
    name: string
  }
}

interface Customer {
  id: string
  shop_name: string
  owner_name: string
  phone: string
  address: string
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  payment_status: "paid" | "partial" | "unpaid"
  notes: string
  customer_id: string
}

interface InvoiceViewModalProps {
  invoice: Invoice | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (invoiceId: string, newStatus: "paid" | "partial" | "unpaid") => void
}

export function InvoiceViewModal({ invoice, isOpen, onClose, onStatusChange }: InvoiceViewModalProps) {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (invoice && isOpen) {
      loadInvoiceDetails()
    }
  }, [invoice, isOpen])

  const loadInvoiceDetails = async () => {
    if (!invoice) return
    
    setIsLoading(true)
    try {
      // Load invoice items with product details
      const { data: itemsData } = await supabase
        .from("invoice_items")
        .select(`
          *,
          products:product_id (
            name
          )
        `)
        .eq("invoice_id", invoice.id)

      // Load customer details
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", invoice.customer_id)
        .single()

      if (itemsData) {
        const formattedItems = itemsData.map(item => ({
          ...item,
          product: item.products
        }))
        setItems(formattedItems)
      }
      if (customerData) setCustomer(customerData)
    } catch (error) {
      console.error("[v0] Error loading invoice details:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareWhatsApp = () => {
    if (!invoice || !customer) return

    const outstanding = invoice.total_amount - invoice.paid_amount
    const itemsList = items.map(item => 
      `${item.product?.name || 'Product'} x${item.quantity} @ ${item.unit_price.toFixed(3)} TND`
    ).join('%0A')

    const message = `*Invoice ${invoice.invoice_number}*%0A%0A` +
      `Customer: ${customer.shop_name}%0A` +
      `Date: ${new Date(invoice.invoice_date).toLocaleDateString()}%0A%0A` +
      `*Items:*%0A${itemsList}%0A%0A` +
      `Subtotal: ${invoice.subtotal.toFixed(3)} TND%0A` +
      `Discount: ${invoice.discount_amount.toFixed(3)} TND%0A` +
      `Tax: ${invoice.tax_amount.toFixed(3)} TND%0A` +
      `*Total: ${invoice.total_amount.toFixed(3)} TND*%0A` +
      `Paid: ${invoice.paid_amount.toFixed(3)} TND%0A` +
      `*Outstanding: ${outstanding.toFixed(3)} TND*%0A%0A` +
      `Status: ${invoice.payment_status.toUpperCase()}`

    const phone = customer.phone?.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleStatusChange = async (newStatus: "paid" | "partial" | "unpaid") => {
    if (!invoice) return
    
    const { error } = await supabase
      .from("invoices")
      .update({ payment_status: newStatus })
      .eq("id", invoice.id)

    if (!error) {
      onStatusChange(invoice.id, newStatus)
      onClose()
    }
  }

  if (!isOpen || !invoice) return null

  const outstanding = invoice.total_amount - invoice.paid_amount

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-lg shadow-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {invoice.invoice_number}
            </h2>
            <p className="text-sm text-muted-foreground">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading invoice details...</div>
          ) : (
            <>
              {/* Customer Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Customer Details</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Shop:</strong> {customer?.shop_name}</p>
                  <p><strong>Owner:</strong> {customer?.owner_name}</p>
                  <p><strong>Phone:</strong> {customer?.phone}</p>
                  {customer?.address && <p><strong>Address:</strong> {customer.address}</p>}
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="font-semibold mb-3">Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Product</th>
                        <th className="text-center p-3 font-semibold">Quantity</th>
                        <th className="text-right p-3 font-semibold">Unit Price</th>
                        <th className="text-right p-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">{item.product?.name || 'Unknown Product'}</td>
                          <td className="text-center p-3">{item.quantity}</td>
                          <td className="text-right p-3">{item.unit_price.toFixed(3)} TND</td>
                          <td className="text-right p-3 font-semibold">{item.line_total.toFixed(3)} TND</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2 bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{invoice.subtotal.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span className="text-red-600">-{invoice.discount_amount.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>+{invoice.tax_amount.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{invoice.total_amount.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Paid Amount:</span>
                  <span className="text-green-600 font-semibold">{invoice.paid_amount.toFixed(3)} TND</span>
                </div>
                <div className="flex justify-between font-bold text-base">
                  <span>Outstanding:</span>
                  <span className="text-orange-600">{outstanding.toFixed(3)} TND</span>
                </div>
              </div>

              {/* Status & Notes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
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

                {invoice.notes && (
                  <div>
                    <span className="font-semibold">Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{invoice.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button onClick={handleShareWhatsApp} className="gap-2 flex-1 min-w-[140px]">
                  <Share2 className="h-4 w-4" />
                  Share on WhatsApp
                </Button>
                
                {/* Status Change Buttons */}
                {invoice.payment_status !== "paid" && (
                  <Button
                    onClick={() => handleStatusChange("paid")}
                    variant="outline"
                    className="gap-2 flex-1 min-w-[120px] bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900"
                  >
                    Mark as Paid
                  </Button>
                )}
                {invoice.payment_status !== "partial" && (
                  <Button
                    onClick={() => handleStatusChange("partial")}
                    variant="outline"
                    className="gap-2 flex-1 min-w-[120px] bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900"
                  >
                    Mark as Partial
                  </Button>
                )}
                {invoice.payment_status !== "unpaid" && (
                  <Button
                    onClick={() => handleStatusChange("unpaid")}
                    variant="outline"
                    className="gap-2 flex-1 min-w-[120px] bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
                  >
                    Mark as Unpaid
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
