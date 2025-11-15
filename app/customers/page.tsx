import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CustomerList } from "@/components/customers/customer-list"
import { CustomerActions } from "@/components/customers/customer-actions"
import { CustomerMapView } from "@/components/customers/customer-map-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function CustomersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("organization_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <DashboardLayout title="Customers">
      <div className="space-y-6">
        <CustomerActions userId={user.id} />
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-6">
            <CustomerList customers={customers || []} userId={user.id} />
          </TabsContent>
          <TabsContent value="map" className="mt-6">
            <CustomerMapView customers={customers || []} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
