import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardCardsProps {
  totalRevenue: number
  unpaidInvoices: number
  outstandingBalance: number
  lowStockProducts: number
  totalProducts: number
  totalCustomers: number
}

export function DashboardCards({
  totalRevenue,
  unpaidInvoices,
  outstandingBalance,
  lowStockProducts,
  totalProducts,
  totalCustomers,
}: DashboardCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(3)} TND`,
      icon: "💰",
      trend: "+12% from last month",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Unpaid Invoices",
      value: unpaidInvoices.toString(),
      icon: "📋",
      trend: `${outstandingBalance.toFixed(3)} TND outstanding`,
      color: "from-orange-500 to-orange-600",
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      icon: "📦",
      trend: `${lowStockProducts} low stock`,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      icon: "👥",
      trend: "Active grocery clients",
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.trend}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
