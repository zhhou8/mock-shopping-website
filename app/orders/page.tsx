import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDateTime, formatEur } from "@/lib/format";
import { MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  refund_requested: "bg-amber-100 text-amber-800",
  refunded: "bg-neutral-200 text-neutral-700",
  cancelled: "bg-neutral-200 text-neutral-700"
};

export default async function OrdersPage() {
  const supabase = supabaseServer();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(product_name, quantity, line_total)")
    .eq("user_id", MOCK_USER_ID)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order history</h1>

      {!orders || orders.length === 0 ? (
        <div className="card p-8 text-center text-neutral-600">
          <p>No orders yet.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4" data-bunqpal="order-list">
          {orders.map((order: any) => (
            <li
              key={order.id}
              className="card p-5"
              data-bunqpal="order-row"
              data-bunqpal-order-id={order.id}
              data-bunqpal-status={order.status}
              data-bunqpal-created-by={order.created_by}
            >
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-bold hover:text-ah-blue"
                  >
                    Order {order.invoice_number}
                  </Link>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {formatDateTime(order.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {order.created_by === "bunqpal" && (
                    <span className="badge bg-ah-blue/10 text-ah-blue" data-bunqpal="bunqpal-badge">
                      Purchased by BunqPal
                    </span>
                  )}
                  <span className={`badge ${STATUS_STYLES[order.status] || "bg-neutral-200"}`}>
                    {order.status.replace("_", " ")}
                  </span>
                  <span className="font-bold">{formatEur(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-neutral-600">
                {order.order_items.map((item: any) => item.product_name).join(" · ")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
