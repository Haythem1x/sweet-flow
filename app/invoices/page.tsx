import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InvoiceList } from "@/components/invoices/invoice-list"
import { InvoiceActions } from "@/components/invoices/invoice-actions"

export default async function InvoicesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("organization_id", user.id)
    .order("invoice_date", { ascending: false })

  const { data: customers } = await supabase.from("customers").select("*").eq("organization_id", user.id)

  const { data: products } = await supabase.from("products").select("*").eq("organization_id", user.id)

  return (
    <DashboardLayout title="Invoices">
      <div className="space-y-6">
        <InvoiceActions userId={user.id} customers={customers || []} products={products || []} />
        <InvoiceList invoices={invoices || []} userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
