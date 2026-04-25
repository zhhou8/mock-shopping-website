import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatEur } from "@/lib/format";
import { MOCK_USER, MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();
  if (!order) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Link href={`/orders/${order.id}`} className="text-sm text-neutral-500 hover:text-ah-blue">
          ← Back to order
        </Link>
        <Link
          href={`/invoice/${order.id}/pdf`}
          className="btn-primary"
          prefetch={false}
        >
          Download PDF
        </Link>
      </div>

      <div className="card p-10 bg-white" data-bunqpal="invoice" data-bunqpal-order-id={order.id}>
        <header className="flex justify-between items-start border-b border-ah-border pb-6">
          <div>
            <div className="bg-ah-blue text-white rounded-md px-3 py-1 text-sm font-bold inline-block">
              AH
            </div>
            <div className="text-2xl font-bold mt-3">Invoice</div>
            <div className="text-sm text-neutral-500 mt-1 font-mono">
              {order.invoice_number}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-semibold">AH Mock B.V.</div>
            <div className="text-neutral-600">Provincialeweg 11</div>
            <div className="text-neutral-600">1506 MA Zaandam</div>
            <div className="text-neutral-600">Netherlands</div>
            <div className="text-neutral-600 mt-2">VAT: NL000000000B00</div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 mt-6 text-sm">
          <div>
            <div className="font-semibold mb-1">Billed to</div>
            <div>{MOCK_USER.name}</div>
            <div>{MOCK_USER.address.line1}</div>
            <div>{MOCK_USER.address.postal} {MOCK_USER.address.city}</div>
            <div>{MOCK_USER.address.country}</div>
          </div>
          <div className="text-right">
            <div>
              <span className="text-neutral-500">Invoice date: </span>
              {formatDate(order.created_at)}
            </div>
            <div>
              <span className="text-neutral-500">Status: </span>
              <span className="font-semibold capitalize">
                {order.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </section>

        <table className="w-full mt-8 text-sm">
          <thead>
            <tr className="border-b border-ah-border text-left">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items.map((item: any) => (
              <tr key={item.id} className="border-b border-ah-border">
                <td className="py-2">{item.product_name}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatEur(item.unit_price)}</td>
                <td className="py-2 text-right">{formatEur(item.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-6 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-600">Subtotal</dt>
            <dd>{formatEur(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-600">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : formatEur(order.shipping)}</dd>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-ah-border">
            <dt>Total</dt>
            <dd>{formatEur(order.total)}</dd>
          </div>
        </dl>

        <footer className="mt-10 pt-6 border-t border-ah-border text-xs text-neutral-500 space-y-1">
          <div>
            Paid via{" "}
            {order.payment_method === "card"
              ? "card"
              : order.payment_method === "bunq"
              ? `Bunq${order.bunq_account_label ? ` (${order.bunq_account_label})` : ""}`
              : "bank transfer"}
            {order.payment_reference && <> · {order.payment_reference}</>}
            {order.bunq_payment_id && <> · payment ID {order.bunq_payment_id}</>}
          </div>
          <div>Refundable until {formatDate(order.refund_window_ends_at)}.</div>
        </footer>
      </div>
    </div>
  );
}
