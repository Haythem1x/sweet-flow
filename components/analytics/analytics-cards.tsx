import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Invoice {
  total_amount: number
  paid_amount: number
  payment_status: string
}

interface AnalyticsCardsProps {
  invoices: Invoice[]
}

export function AnalyticsCards({ invoices }: AnalyticsCardsProps) {
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paid_amount, 0)
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0)
  const paidInvoices = invoices.filter((inv) => inv.payment_status === "paid").length
  const unpaidInvoices = invoices.filter((inv) => inv.payment_status === "unpaid").length
  const collectionRate = invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0

  const cards = [
    {
      title: "Total Invoiced",
      value: `${totalInvoiced.toFixed(3)} TND`,
      subtitle: `${invoices.length} invoices`,
    },
    {
      title: "Total Collected",
      value: `${totalRevenue.toFixed(3)} TND`,
      subtitle: `${paidInvoices} paid`,
    },
    {
      title: "Collection Rate",
      value: `${collectionRate.toFixed(1)}%`,
      subtitle: `${unpaidInvoices} unpaid`,
    },
    {
      title: "Avg Invoice Value",
      value: invoices.length > 0 ? `${(totalInvoiced / invoices.length).toFixed(3)} TND` : "0 TND",
      subtitle: "Per transaction",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
