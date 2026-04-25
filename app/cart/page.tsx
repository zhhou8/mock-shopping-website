import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/QuantityStepper";
import { supabaseServer } from "@/lib/supabase/server";
import { formatEur } from "@/lib/format";
import { MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

export default async function CartPage() {
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

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);

  const { data: membership } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();
  const isPremium = membership?.status === "active";
  const discount = isPremium ? subtotal * 0.1 : 0;
  const shipping = lines.length === 0 ? 0 : isPremium ? 0 : 0.99;
  const total = subtotal - discount + shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your cart</h1>

      {lines.length === 0 ? (
        <div className="card p-8 text-center text-neutral-600">
          <p>Your cart is empty.</p>
          <Link href="/" className="btn-primary mt-4 inline-flex">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="card divide-y divide-ah-border" data-bunqpal="cart-list">
            {lines.map((l) => (
              <div
                key={l.product.id}
                className="flex items-center gap-4 p-4"
                data-bunqpal="cart-line"
                data-bunqpal-product-id={l.product.id}
              >
                <div className="w-16 h-16 bg-ah-paper rounded-lg relative flex-shrink-0">
                  <Image
                    src={l.product.image_url}
                    alt={l.product.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${l.product.slug}`}
                    className="font-semibold hover:text-ah-blue"
                  >
                    {l.product.name}
                  </Link>
                  <div className="text-xs text-neutral-500">{l.product.unit_label}</div>
                  <div className="mt-2">
                    <QuantityStepper productId={l.product.id} quantity={l.quantity} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" data-bunqpal="line-total">
                    {formatEur(l.line_total)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {formatEur(l.product.price)} each
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="card p-5 sticky top-20" data-bunqpal="cart-summary">
            <h2 className="font-bold mb-4">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Subtotal</dt>
                <dd data-bunqpal="summary-subtotal">{formatEur(subtotal)}</dd>
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
              <div className="flex justify-between font-bold text-base pt-3 border-t border-ah-border">
                <dt>Total</dt>
                <dd data-bunqpal="summary-total">{formatEur(total)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="btn-primary w-full mt-5"
              data-bunqpal="go-to-checkout"
            >
              Go to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
