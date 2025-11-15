"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Invoice {
  id: string
  invoice_number: string
  due_date: string
  total_amount: number
  paid_amount: number
  payment_status: string
}

interface OverdueInvoicesProps {
  invoices: Invoice[]
}

export function OverdueInvoices({ invoices }: OverdueInvoicesProps) {
  const today = new Date()
  const overdueInvoices = invoices.filter((inv) => new Date(inv.due_date) < today && inv.payment_status !== "paid")

  const upcomingInvoices = invoices.filter(
    (inv) =>
      new Date(inv.due_date) >= today && new Date(inv.due_date) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
  )

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0)
  const totalUpcoming = upcomingInvoices.reduce((sum, inv) => sum + (inv.total_amount - inv.paid_amount), 0)

  return (
    <>
      <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
            <span>⚠️</span> Overdue Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-700 dark:text-red-200">{overdueInvoices.length}</p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">{totalOverdue.toFixed(3)} TND outstanding</p>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
            <span>📅</span> Due This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">{upcomingInvoices.length}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">{totalUpcoming.toFixed(3)} TND due soon</p>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
            <span>✓</span> Paid Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-700 dark:text-green-200">
            {invoices.filter((inv) => inv.payment_status === "paid").length}
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">Fully collected</p>
        </CardContent>
      </Card>
    </>
  )
}
