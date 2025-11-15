"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RecordPaymentModal } from "./record-payment-modal"

interface Invoice {
  id: string
  invoice_number: string
  payment_status: string
  total_amount: number
  paid_amount: number
}

interface PaymentActionsProps {
  invoices: Invoice[]
  userId: string
}

export function PaymentActions({ invoices, userId }: PaymentActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter unpaid and partially paid invoices
  const unpaidInvoices = invoices.filter((inv) => inv.payment_status !== "paid")

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" disabled={unpaidInvoices.length === 0}>
          <span>+</span> Record Payment
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>📊</span> Payment Report
        </Button>
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invoices={unpaidInvoices}
        userId={userId}
      />
    </>
  )
}
