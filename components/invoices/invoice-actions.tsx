"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InvoiceModal } from "./invoice-modal"

interface Customer {
  id: string
  shop_name: string
}

interface Product {
  id: string
  name: string
  selling_price: number
}

interface InvoiceActionsProps {
  userId: string
  customers: Customer[]
  products: Product[]
}

export function InvoiceActions({ userId, customers, products }: InvoiceActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <span>+</span> Create Invoice
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>📄</span> Export Invoices
        </Button>
      </div>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        customers={customers}
        products={products}
      />
    </>
  )
}
