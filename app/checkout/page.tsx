import Link from "next/link";
import { PaymentForm } from "@/components/PaymentForm";
import { supabaseServer } from "@/lib/supabase/server";
import { formatEur } from "@/lib/format";
import { MOCK_USER, MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = supabaseServer();
  const { data: rows } = await supabase
    .from("cart_items")
    .select("quantity, products(*)")
    .eq("user_id", MOCK_USER_ID)
    .order("added_at", { ascending: true });

  const lines = (rows || []).map((r: any) => ({
    product: r.products,
    quantity: r.quantity,
    line_total: Number(r.products.price) * r.quantity
  }));

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-neutral-600">Your cart is empty.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  const { data: membership } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();
  const isPremium = membership?.status === "active";
  const discount = isPremium ? subtotal * 0.1 : 0;
  const shipping = isPremium ? 0 : 4.95;
  const total = subtotal - discount + shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">
        <section className="card p-5" data-bunqpal="order-summary">
          <h2 className="font-bold mb-4">Order summary</h2>
          <ul className="divide-y divide-ah-border">
            {lines.map((l) => (
              <li
                key={l.product.id}
                className="flex justify-between py-3"
                data-bunqpal="summary-line"
                data-bunqpal-product-id={l.product.id}
              >
                <div className="text-sm">
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-neutral-500 text-xs">
                    {l.product.unit_label} · ×{l.quantity}
                  </div>
                </div>
                <div className="font-medium">{formatEur(l.line_total)}</div>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 mt-4 pt-4 border-t border-ah-border text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatEur(subtotal)}</dd>
            </div>
            {isPremium && (
              <div className="flex justify-between text-ah-blue">
                <dt>AH Plus −10%</dt>
                <dd>−{formatEur(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatEur(shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-bold pt-3 border-t border-ah-border">
              <dt>Total</dt>
              <dd data-bunqpal="order-total">{formatEur(total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="font-bold mb-3">Delivery</h2>
            <div className="text-sm text-neutral-700">
              <div className="font-medium">{MOCK_USER.name}</div>
              <div>{MOCK_USER.address.line1}</div>
              <div>
                {MOCK_USER.address.postal} {MOCK_USER.address.city}
              </div>
              <div>{MOCK_USER.address.country}</div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="font-bold mb-3">Payment</h2>
            <PaymentForm mode="cart" totalLabel={formatEur(total)} ctaLabel="Pay" />
          </section>
        </aside>
      </div>
    </div>
  );
}
