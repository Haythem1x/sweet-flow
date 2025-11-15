"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CustomerModal } from "./customer-modal"

interface CustomerActionsProps {
  userId: string
}

export function CustomerActions({ userId }: CustomerActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <span>+</span> Add Customer
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>🗺️</span> Map View
        </Button>
      </div>

      <CustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={userId} />
    </>
  )
}
