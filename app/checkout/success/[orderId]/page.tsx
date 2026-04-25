import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatEur } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = supabaseServer();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div
        className="card p-8 text-center"
        data-bunqpal="order-success"
        data-bunqpal-order-id={order.id}
      >
        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-3xl mx-auto">
          ✓
        </div>
        <h1 className="text-2xl font-bold mt-4">Order confirmed</h1>
        <p className="text-neutral-600 mt-1">
          Invoice <span className="font-mono">{order.invoice_number}</span>
        </p>

        <div className="mt-6 text-left bg-ah-paper rounded-xl p-4 text-sm">
          <ul className="divide-y divide-ah-border" data-bunqpal="success-items">
            {order.order_items.map((item: any) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.product_name}
                  <span className="text-neutral-500"> ×{item.quantity}</span>
                </span>
                <span>{formatEur(item.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between mt-3 pt-3 border-t border-ah-border font-semibold">
            <span>Total paid</span>
            <span data-bunqpal="success-total">{formatEur(order.total)}</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-neutral-500 space-y-0.5">
          <div>
            Paid via {order.payment_method === "card" ? "card" : order.payment_method === "bunq" ? "Bunq" : "bank transfer"}
            {order.payment_reference && (
              <span>
                {" · "}
                <span className="font-mono" data-bunqpal="payment-reference">
                  {order.payment_reference}
                </span>
              </span>
            )}
          </div>
          {order.bunq_payment_id && (
            <div>
              Bunq payment ID:{" "}
              <span className="font-mono" data-bunqpal="bunq-payment-id">
                {order.bunq_payment_id}
              </span>
            </div>
          )}
          <div>Refund window ends {formatDate(order.refund_window_ends_at)}</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href={`/invoice/${order.id}`} className="btn-ghost">
            View invoice
          </Link>
          <Link href={`/invoice/${order.id}/pdf`} className="btn-ghost" prefetch={false}>
            Download PDF
          </Link>
          <Link href="/orders" className="btn-primary">
            Order history
          </Link>
        </div>
      </div>
    </div>
  );
}
