"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  invoices: any[]
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  // Group invoices by month
  const monthlyData = invoices
    .reduce((acc: any, invoice: any) => {
      const date = new Date(invoice.invoice_date)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const existing = acc.find((item: any) => item.month === monthKey)
      if (existing) {
        existing.revenue += invoice.paid_amount || 0
        existing.invoices += 1
      } else {
        acc.push({ month: monthKey, revenue: invoice.paid_amount || 0, invoices: 1 })
      }
      return acc
    }, [])
    .slice(-6) // Last 6 months

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> Monthly Revenue
        </CardTitle>
        <CardDescription>Revenue collected over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              formatter={(value: any) => `${value.toFixed(3)} TND`}
            />
            <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
