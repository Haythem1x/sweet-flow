"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Invoice {
  invoice_date: string
  total_amount: number
}

interface InvoiceItem {
  unit_price: number
  line_total: number
}

interface ProfitLossChartProps {
  invoices: Invoice[]
  invoiceItems: InvoiceItem[]
}

export function ProfitLossChart({ invoices, invoiceItems }: ProfitLossChartProps) {
  // Simplified profit/loss calculation based on available data
  const monthlyData = invoices
    .reduce((acc: any, invoice: any) => {
      const date = new Date(invoice.invoice_date)
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const existing = acc.find((item: any) => item.month === monthKey)
      const revenue = invoice.total_amount
      const estimatedCost = revenue * 0.6 // Assume 60% cost ratio
      const profit = revenue - estimatedCost

      if (existing) {
        existing.revenue += revenue
        existing.profit += profit
      } else {
        acc.push({
          month: monthKey,
          revenue,
          profit,
        })
      }
      return acc
    }, [])
    .slice(-12)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💹</span> Profit & Loss
        </CardTitle>
        <CardDescription>Monthly revenue and profit trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              formatter={(value: any) => `${value.toFixed(3)} TND`}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-chart-2)" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="profit" stroke="var(--color-chart-1)" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
