import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar title={title} />
      <main className="md:ml-64 mt-16 p-4 sm:p-6">{children}</main>
    </div>
  )
}
