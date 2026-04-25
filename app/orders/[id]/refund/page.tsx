import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatEur, daysUntil } from "@/lib/format";
import { MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

async function submitRefund(formData: FormData) {
  "use server";
  const orderId = formData.get("order_id");
  const reason = (formData.get("reason") || "").toString().slice(0, 500);
  if (typeof orderId !== "string") return;
  const supabase = supabaseServer();
  const { error } = await supabase
    .from("orders")
    .update({
      status: "refund_requested",
      refund_requested_at: new Date().toISOString(),
      metadata: { refund_reason: reason }
    })
    .eq("id", orderId)
    .eq("user_id", MOCK_USER_ID);
  if (!error) {
    redirect(`/orders/${orderId}?refund=submitted`);
  }
}

export default async function RefundPage({ params }: { params: Promise<{ id: string }> }) {
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
  const expired = refundDays === null || refundDays <= 0;
  const alreadyRequested = order.status !== "paid";

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8"
      data-bunqpal="refund-form"
      data-bunqpal-order-id={order.id}
    >
      <Link href={`/orders/${order.id}`} className="text-sm text-neutral-500 hover:text-ah-blue">
        ← Back to order
      </Link>

      <div className="card p-6 mt-3">
        <h1 className="text-2xl font-bold">Request a refund</h1>
        <p className="text-sm text-neutral-600 mt-1">
          Order <span className="font-mono">{order.invoice_number}</span> · {formatEur(order.total)}
        </p>

        {expired && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Refund window closed on {formatDate(order.refund_window_ends_at)}.
          </div>
        )}
        {alreadyRequested && !expired && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            A refund has already been {order.status.replace("_", " ")}.
          </div>
        )}

        <ul className="divide-y divide-ah-border mt-6 text-sm">
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

        <form action={submitRefund} className="mt-6 space-y-4">
          <input type="hidden" name="order_id" value={order.id} />
          <label className="block text-sm">
            <span className="font-semibold block mb-1">Reason for refund</span>
            <textarea
              name="reason"
              rows={4}
              className="input"
              placeholder="Tell us what went wrong (optional)"
              data-bunqpal="refund-reason"
              disabled={expired || alreadyRequested}
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary"
              data-bunqpal="submit-refund-button"
              disabled={expired || alreadyRequested}
            >
              Submit refund request
            </button>
            <Link href={`/orders/${order.id}`} className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
