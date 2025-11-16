"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  stock_quantity: number
  user_id: string
}

interface Customer {
  id: string
  user_id: string
}

interface Invoice {
  id: string
  total_amount: number
  paid_amount: number
  payment_status: "paid" | "partial" | "unpaid"
  user_id: string
}

export function DashboardCards() {
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let productsChannel: any
    let customersChannel: any
    let invoicesChannel: any

    const fetchData = async () => {
      setLoading(true)

      // Get logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error("Error getting user:", userError)
        setLoading(false)
        return
      }
      setUserId(user.id)

      try {
        // Initial fetch
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
        setProducts(productsData || [])

        const { data: customersData } = await supabase
          .from("customers")
          .select("*")
          .eq("user_id", user.id)
        setCustomers(customersData || [])

        const { data: invoicesData } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
        setInvoices(invoicesData || [])

        // Subscribe to products changes
        productsChannel = supabase
          .channel(`realtime-products-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "products", filter: `user_id=eq.${user.id}` },
            (payload) => {
              setProducts((prev) => {
                if (payload.eventType === "INSERT") return [payload.new, ...prev]
                if (payload.eventType === "UPDATE")
                  return prev.map((p) => (p.id === payload.new.id ? payload.new : p))
                if (payload.eventType === "DELETE")
                  return prev.filter((p) => p.id !== payload.old.id)
                return prev
              })
            }
          )
          .subscribe()

        // Subscribe to customers changes
        customersChannel = supabase
          .channel(`realtime-customers-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "customers", filter: `user_id=eq.${user.id}` },
            (payload) => {
              setCustomers((prev) => {
                if (payload.eventType === "INSERT") return [payload.new, ...prev]
                if (payload.eventType === "UPDATE")
                  return prev.map((c) => (c.id === payload.new.id ? payload.new : c))
                if (payload.eventType === "DELETE")
                  return prev.filter((c) => c.id !== payload.old.id)
                return prev
              })
            }
          )
          .subscribe()

        // Subscribe to invoices changes
        invoicesChannel = supabase
          .channel(`realtime-invoices-${user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "invoices", filter: `user_id=eq.${user.id}` },
            (payload) => {
              setInvoices((prev) => {
                if (payload.eventType === "INSERT") return [payload.new, ...prev]
                if (payload.eventType === "UPDATE")
                  return prev.map((i) => (i.id === payload.new.id ? payload.new : i))
                if (payload.eventType === "DELETE")
                  return prev.filter((i) => i.id !== payload.old.id)
                return prev
              })
            }
          )
          .subscribe()
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      // Cleanup subscriptions on unmount
      if (productsChannel) supabase.removeChannel(productsChannel)
      if (customersChannel) supabase.removeChannel(customersChannel)
      if (invoicesChannel) supabase.removeChannel(invoicesChannel)
    }
  }, [])

  if (loading) return <p>Loading dashboard...</p>
  if (!userId) return <p>Please log in to view dashboard.</p>

  // Compute totals
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total_amount, 0)
  const unpaidInvoices = invoices.filter(i => i.payment_status !== "paid").length
  const outstandingBalance = invoices.reduce((sum, i) => sum + (i.total_amount - i.paid_amount), 0)
  const lowStockProducts = products.filter(p => p.stock_quantity < 50).length
  const totalProducts = products.length
  const totalCustomers = customers.length

  const cards = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(3)} TND`,
      icon: "💰",
      trend: "+12% from last month",
    },
    {
      title: "Unpaid Invoices",
      value: unpaidInvoices.toString(),
      icon: "📋",
      trend: `${outstandingBalance.toFixed(3)} TND outstanding`,
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: "📦",
      trend: `${lowStockProducts} low stock`,
    },
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      icon: "👥",
      trend: "Active grocery clients",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
