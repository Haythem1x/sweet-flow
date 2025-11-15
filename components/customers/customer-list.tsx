"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerModal } from "./customer-modal"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Customer {
  id: string
  shop_name: string
  owner_name: string
  phone: string
  address: string
  outstanding_balance: number
}

interface CustomerListProps {
  customers: Customer[]
  userId: string
}

export function CustomerList({ customers: initialCustomers, userId }: CustomerListProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const filteredCustomers = customers.filter(
    (c) =>
      c.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm),
  )

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    const { error } = await supabase.from("customers").delete().eq("id", id)
    if (!error) {
      setCustomers(customers.filter((c) => c.id !== id))
      router.refresh()
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCustomer(null)
    router.refresh()
  }

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding_balance, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>🛒</span> Grocery Clients
            </div>
          </CardTitle>
          <CardDescription>
            {customers.length} customers {totalOutstanding > 0 && `• ${totalOutstanding.toFixed(3)} TND outstanding`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search by shop name, owner, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />

          {/* Customers table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Shop Name</th>
                  <th className="text-left p-3 font-semibold">Owner Name</th>
                  <th className="text-left p-3 font-semibold">Phone</th>
                  <th className="text-left p-3 font-semibold">Address</th>
                  <th className="text-right p-3 font-semibold">Outstanding</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-semibold">{customer.shop_name}</td>
                      <td className="p-3">{customer.owner_name}</td>
                      <td className="p-3">{customer.phone}</td>
                      <td className="p-3 text-xs text-muted-foreground">{customer.address}</td>
                      <td className="text-right p-3 font-semibold">
                        <span className={customer.outstanding_balance > 0 ? "text-orange-600 font-bold" : ""}>
                          {customer.outstanding_balance.toFixed(3)} TND
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(customer)} className="text-xs">
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(customer.id)}
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
      <CustomerModal isOpen={isModalOpen} onClose={handleCloseModal} customer={editingCustomer} userId={userId} />
    </>
  )
}
