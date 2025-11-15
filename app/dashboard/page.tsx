import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopProductsChart } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch dashboard data
  const [invoicesRes, productsRes, customersRes, paymentsRes] = await Promise.all([
    supabase.from("invoices").select("*").eq("organization_id", user.id),
    supabase.from("products").select("*").eq("organization_id", user.id),
    supabase.from("customers").select("*").eq("organization_id", user.id),
    supabase.from("payments").select("*").eq("organization_id", user.id),
  ])

  const invoices = invoicesRes.data || []
  const products = productsRes.data || []
  const customers = customersRes.data || []
  const payments = paymentsRes.data || []

  // Calculate metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0)
  const unpaidInvoices = invoices.filter((inv) => inv.payment_status === "unpaid" || inv.payment_status === "partial")
  const outstandingBalance = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0)
  const lowStockProducts = products.filter((p) => p.stock_quantity < 50)

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* KPI Cards */}
        <DashboardCards
          totalRevenue={totalRevenue}
          unpaidInvoices={unpaidInvoices.length}
          outstandingBalance={outstandingBalance}
          lowStockProducts={lowStockProducts.length}
          totalProducts={products.length}
          totalCustomers={customers.length}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart invoices={invoices} />
          <TopProductsChart invoices={invoices} />
        </div>

        {/* Recent Orders */}
        <RecentOrders invoices={invoices.slice(0, 10)} />
      </div>
    </DashboardLayout>
  )
}
