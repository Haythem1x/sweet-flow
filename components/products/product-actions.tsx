"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductModal } from "./product-modal"

interface ProductActionsProps {
  userId: string
}

export function ProductActions({ userId }: ProductActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <span>+</span> Add Product
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>📥</span> Import CSV
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>📤</span> Export Excel
        </Button>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={userId} />
    </>
  )
}
