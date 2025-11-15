"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Invoice {
  invoice_date: string
  total_amount: number
  paid_amount: number
}

interface SalesChartProps {
  invoices: Invoice[]
}

export function SalesChart({ invoices }: SalesChartProps) {
  const monthlyData = invoices
    .reduce((acc: any, invoice: any) => {
      const date = new Date(invoice.invoice_date)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const existing = acc.find((item: any) => item.month === monthKey)
      if (existing) {
        existing.invoiced += invoice.total_amount
        existing.collected += invoice.paid_amount
      } else {
        acc.push({
          month: monthKey,
          invoiced: invoice.total_amount,
          collected: invoice.paid_amount,
        })
      }
      return acc
    }, [])
    .slice(-12)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span> Sales Trend
        </CardTitle>
        <CardDescription>Monthly invoiced vs collected</CardDescription>
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
            <Legend />
            <Bar dataKey="invoiced" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="collected" fill="var(--color-chart-2)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
