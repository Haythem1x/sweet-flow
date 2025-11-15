"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductModal } from "./product-modal"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  category: string
  brand: string
  cost_price: number
  selling_price: number
  stock_quantity: number
  barcode: string
  expiry_date: string
}

interface ProductListProps {
  products: Product[]
  userId: string
}

export function ProductList({ products: initialProducts, userId }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.includes(searchTerm),
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const { error } = await supabase.from("products").delete().eq("id", id)
    if (!error) {
      setProducts(products.filter((p) => p.id !== id))
      router.refresh()
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    router.refresh()
  }

  const lowStockProducts = products.filter((p) => p.stock_quantity < 50)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>📦</span> Product Inventory
            </div>
          </CardTitle>
          <CardDescription>{products.length} products in system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and alerts */}
          <div className="space-y-4">
            <Input
              placeholder="Search by product name or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10"
            />

            {lowStockProducts.length > 0 && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  ⚠️ {lowStockProducts.length} products with low stock ({`<50 units`})
                </p>
              </div>
            )}
          </div>

          {/* Products table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Product Name</th>
                  <th className="text-left p-3 font-semibold">Category</th>
                  <th className="text-left p-3 font-semibold">Brand</th>
                  <th className="text-right p-3 font-semibold">Cost Price</th>
                  <th className="text-right p-3 font-semibold">Selling Price</th>
                  <th className="text-right p-3 font-semibold">Stock</th>
                  <th className="text-right p-3 font-semibold">Expiry</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-6 text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className={`border-b hover:bg-muted/50 ${
                        product.stock_quantity < 50 ? "bg-orange-50 dark:bg-orange-950" : ""
                      }`}
                    >
                      <td className="p-3 font-semibold">{product.name}</td>
                      <td className="p-3">{product.category}</td>
                      <td className="p-3">{product.brand}</td>
                      <td className="text-right p-3">{product.cost_price.toFixed(3)} TND</td>
                      <td className="text-right p-3">{product.selling_price.toFixed(3)} TND</td>
                      <td className="text-right p-3">
                        <span className={product.stock_quantity < 50 ? "font-bold text-orange-600" : ""}>
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td className="text-right p-3 text-xs">
                        {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="text-xs">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(product.id)}
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal for add/edit */}
      <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={editingProduct} userId={userId} />
    </>
  )
}
