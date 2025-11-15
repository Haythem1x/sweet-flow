import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductList } from "@/components/products/product-list"
import { ProductActions } from "@/components/products/product-actions"

export default async function ProductsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout title="Products">
      <div className="space-y-6">
        <ProductActions userId={user.id} />
        <ProductList products={products || []} userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
