"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Invoice {
  customer_id: string
  total_amount: number
}

interface TopCustomersChartProps {
  invoices: Invoice[]
}

export function TopCustomersChart({ invoices }: TopCustomersChartProps) {
  const customerSales = invoices
    .reduce((acc: any, invoice: any) => {
      const existing = acc.find((item: any) => item.customer_id === invoice.customer_id)
      if (existing) {
        existing.total += invoice.total_amount
        existing.count += 1
      } else {
        acc.push({
          customer_id: invoice.customer_id,
          total: invoice.total_amount,
          count: 1,
        })
      }
      return acc
    }, [])
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 10)
    .map((item: any, index: number) => ({
      name: `Customer ${index + 1}`,
      sales: item.total,
      orders: item.count,
    }))

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>👥</span> Top 10 Customers
        </CardTitle>
        <CardDescription>By total sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerSales}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              formatter={(value: any) => `${value.toFixed(3)} TND`}
            />
            <Bar dataKey="sales" fill="var(--color-chart-3)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
