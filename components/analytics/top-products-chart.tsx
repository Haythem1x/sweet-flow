"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface InvoiceItem {
  quantity: number
  line_total: number
}

interface TopProductsChartProps {
  invoiceItems: InvoiceItem[]
}

export function TopProductsChart({ invoiceItems }: TopProductsChartProps) {
  const productData = invoiceItems.slice(0, 10).map((item: any, index: number) => ({
    name: `Product ${index + 1}`,
    quantity: item.quantity,
    revenue: item.line_total,
  }))

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span> Top Products
        </CardTitle>
        <CardDescription>By sales volume and revenue</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              formatter={(value: any) => value}
            />
            <Bar dataKey="quantity" fill="var(--color-chart-4)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
