import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatEur, daysUntil } from "@/lib/format";
import { MOCK_USER_ID, MOCK_USER } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();

  if (!order) notFound();

  const refundDays = daysUntil(order.refund_window_ends_at);
  const refundOpen =
    order.status === "paid" && refundDays !== null && refundDays > 0;

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-8"
      data-bunqpal="order-detail"
      data-bunqpal-order-id={order.id}
      data-bunqpal-status={order.status}
    >
      <Link href="/orders" className="text-sm text-neutral-500 hover:text-ah-blue">
        ← All orders
      </Link>

      <div className="card p-6 mt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Order {order.invoice_number}</h1>
            <div className="text-sm text-neutral-500 mt-1">
              Placed {formatDateTime(order.created_at)}
            </div>
          </div>
          <span
            className={`badge ${
              order.status === "paid"
                ? "bg-green-100 text-green-800"
                : order.status === "refund_requested"
                ? "bg-amber-100 text-amber-800"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            {order.status.replace("_", " ")}
          </span>
        </div>

        <ul className="divide-y divide-ah-border mt-6" data-bunqpal="order-items">
          {order.order_items.map((item: any) => (
            <li
              key={item.id}
              className="flex justify-between py-3"
              data-bunqpal="order-item"
              data-bunqpal-product-id={item.product_id}
            >
              <div>
                <div className="font-medium">{item.product_name}</div>
                <div className="text-xs text-neutral-500">×{item.quantity}</div>
              </div>
              <div className="font-medium">{formatEur(item.line_total)}</div>
            </li>
          ))}
        </ul>

        <dl className="mt-4 pt-4 border-t border-ah-border space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd>{formatEur(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : formatEur(order.shipping)}</dd>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-ah-border">
            <dt>Total paid</dt>
            <dd data-bunqpal="order-total">{formatEur(order.total)}</dd>
          </div>
        </dl>

        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="bg-ah-paper rounded-xl p-4">
            <div className="font-semibold mb-1">Delivery</div>
            <div className="text-neutral-700">
              {MOCK_USER.name}
              <br />
              {MOCK_USER.address.line1}
              <br />
              {MOCK_USER.address.postal} {MOCK_USER.address.city}
            </div>
          </div>
          <div className="bg-ah-paper rounded-xl p-4">
            <div className="font-semibold mb-1">Payment</div>
            <div className="text-neutral-700">
              {order.payment_method === "card"
                ? "Card"
                : order.payment_method === "bunq"
                ? `Bunq${order.bunq_account_label ? ` · ${order.bunq_account_label}` : ""}`
                : "Bank transfer"}
              {" · "}paid in full
              {order.payment_reference && (
                <>
                  <br />
                  <span className="font-mono text-xs" data-bunqpal="order-payment-reference">
                    {order.payment_reference}
                  </span>
                </>
              )}
              {order.bunq_payment_id && (
                <>
                  <br />
                  <span className="font-mono text-xs" data-bunqpal="order-bunq-payment-id">
                    {order.bunq_payment_id}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/invoice/${order.id}`} className="btn-ghost">
            View invoice
          </Link>
          <Link
            href={`/invoice/${order.id}/pdf`}
            className="btn-ghost"
            prefetch={false}
          >
            Download PDF
          </Link>
          {refundOpen && (
            <Link
              href={`/orders/${order.id}/refund`}
              className="btn-ghost"
              data-bunqpal="open-refund"
            >
              Request refund
            </Link>
          )}
        </div>

        {refundOpen && (
          <div
            className="mt-4 text-xs text-neutral-500"
            data-bunqpal="refund-window"
            data-bunqpal-days-remaining={refundDays}
          >
            Refund window ends {formatDate(order.refund_window_ends_at)} ({refundDays} day
            {refundDays === 1 ? "" : "s"} left).
          </div>
        )}
      </div>
    </div>
  );
}
