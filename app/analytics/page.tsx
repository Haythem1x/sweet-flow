import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SalesChart } from "@/components/analytics/sales-chart"
import { TopCustomersChart } from "@/components/analytics/top-customers"
import { TopProductsChart } from "@/components/analytics/top-products-chart"
import { ProfitLossChart } from "@/components/analytics/profit-loss"
import { AnalyticsCards } from "@/components/analytics/analytics-cards"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all necessary data
  const [invoicesRes, invoiceItemsRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("organization_id", user.id),
    supabase.from("invoice_items").select("*"),
  ])

  const invoices = invoicesRes.data || []
  const invoiceItems = invoiceItemsRes.data || []

  return (
    <DashboardLayout title="Analytics & Reports">
      <div className="space-y-6">
        <AnalyticsCards invoices={invoices} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart invoices={invoices} />
          <ProfitLossChart invoices={invoices} invoiceItems={invoiceItems} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomersChart invoices={invoices} />
          <TopProductsChart invoiceItems={invoiceItems} />
        </div>
      </div>
    </DashboardLayout>
  )
}
