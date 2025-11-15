import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PaymentList } from "@/components/payments/payment-list"
import { PaymentActions } from "@/components/payments/payment-actions"
import { OverdueInvoices } from "@/components/payments/overdue-invoices"

export default async function PaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [paymentsRes, invoicesRes] = await Promise.all([
    supabase.from("payments").select("*").eq("organization_id", user.id),
    supabase.from("invoices").select("*").eq("organization_id", user.id),
  ])

  const payments = paymentsRes.data || []
  const invoices = invoicesRes.data || []

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        <PaymentActions invoices={invoices} userId={user.id} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <OverdueInvoices invoices={invoices} />
        </div>

        <PaymentList payments={payments} invoices={invoices} userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
