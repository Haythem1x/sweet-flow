import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentOrdersProps {
  invoices: any[]
}

export function RecentOrders({ invoices }: RecentOrdersProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🧾</span> Recent Orders
        </CardTitle>
        <CardDescription>Latest 10 invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Invoice</th>
                <th className="text-left p-2 font-semibold">Date</th>
                <th className="text-right p-2 font-semibold">Amount</th>
                <th className="text-center p-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-muted-foreground">
                    No invoices yet
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-xs">{invoice.invoice_number}</td>
                    <td className="p-2">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="text-right p-2 font-semibold">{invoice.total_amount.toFixed(3)} TND</td>
                    <td className="text-center p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          invoice.payment_status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : invoice.payment_status === "partial"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
