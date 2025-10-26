"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import {
  TRANSACTIONS,
  TRANSACTION_STATUS_STYLES,
} from "@/services/admin.service";

export function PaymentsSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-blue-100/30">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Payments & transactions
          </h2>
          <p className="text-sm text-slate-600">
            Monitor gateway health, refunds, and reconciliation.
          </p>
        </div>
        <Button className="bg-[#1e3a8a] text-white hover:bg-[#1e3a8a]/90">
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export financial report
        </Button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-100">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Txn ID</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TRANSACTIONS.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium text-slate-900">
                  {transaction.id}
                </TableCell>
                <TableCell>{transaction.orderId}</TableCell>
                <TableCell>{transaction.customer}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-slate-200 text-xs text-slate-600"
                  >
                    {transaction.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                      TRANSACTION_STATUS_STYLES[transaction.status]
                    )}
                  >
                    {transaction.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium text-slate-900">
                  {transaction.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-5 grid gap-3 text-xs text-slate-600">
        <p>
          Stripe: Operational · PayPal: Settlement clears nightly · Razorpay:
          Awaiting two-factor confirmation.
        </p>
        <p>Refund queue: 3 requests pending finance approval.</p>
      </div>
    </section>
  );
}
