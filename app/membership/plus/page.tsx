import Link from "next/link";
import { PaymentForm } from "@/components/PaymentForm";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate, formatEur, daysUntil } from "@/lib/format";
import { MOCK_USER_ID } from "@/lib/user";
import type { Product } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const supabase = supabaseServer();
  const [{ data: product }, { data: membership }] = await Promise.all([
    supabase.from("products").select("*").eq("id", "membership_ahplus").maybeSingle(),
    supabase
      .from("memberships")
      .select("*")
      .eq("user_id", MOCK_USER_ID)
      .maybeSingle()
  ]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p>AH Plus product not seeded.</p>
      </div>
    );
  }
  const p = product as Product;
  const isActive = membership?.status === "active";
  const daysToRenewal = isActive ? daysUntil(membership!.current_period_end) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[1fr_380px] gap-6 items-start">
        <section
          className="card p-8"
          data-bunqpal="membership-info"
          data-bunqpal-product-id={p.id}
        >
          <span className="badge bg-ah-blue/10 text-ah-blue uppercase tracking-wider mb-3">
            Membership
          </span>
          <h1 className="text-3xl font-bold" data-bunqpal="membership-name">
            {p.name}
          </h1>
          <p className="text-neutral-700 mt-2">{p.description}</p>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-3xl font-bold" data-bunqpal="membership-price">
              {formatEur(p.price)}
            </span>
            <span className="text-neutral-500">/ month</span>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-neutral-700">
            <li className="flex gap-2">
              <span className="text-ah-blue">✓</span> 10% off every order
            </li>
            <li className="flex gap-2">
              <span className="text-ah-blue">✓</span> Free delivery, no minimum
            </li>
            <li className="flex gap-2">
              <span className="text-ah-blue">✓</span> Early access to weekly deals
            </li>
            <li className="flex gap-2">
              <span className="text-ah-blue">✓</span> Cancel any time
            </li>
          </ul>
        </section>

        <aside className="card p-5 space-y-4" data-bunqpal="subscribe-panel">
          {isActive ? (
            <>
              <div className="text-sm">
                <div className="font-semibold">You are an AH Plus member</div>
                <div className="text-neutral-500 mt-1">
                  Renews {formatDate(membership!.current_period_end)}
                  {daysToRenewal !== null && (
                    <span> · {daysToRenewal} day{daysToRenewal === 1 ? "" : "s"} left</span>
                  )}
                </div>
              </div>
              <Link
                href="/membership/cancel"
                className="btn-ghost w-full"
                data-bunqpal="open-cancel-membership"
              >
                Cancel membership
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-bold">Subscribe today</h2>
              <PaymentForm
                mode="membership"
                productId={p.id}
                totalLabel={`${formatEur(p.price)} / month`}
                ctaLabel="Subscribe"
                ctaSelector="subscribe-now-button"
              />
              <p className="text-xs text-neutral-500 text-center">
                Renews monthly · refundable within 14 days
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
