import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BusinessSettings } from "@/components/settings/business-settings"
import { UserProfile } from "@/components/settings/user-profile"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [profileRes, settingsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("business_settings").select("*").eq("organization_id", user.id).single(),
  ])

  const profile = profileRes.data
  const businessSettings = settingsRes.data

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <UserProfile profile={profile} userId={user.id} />
        <BusinessSettings settings={businessSettings} userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
