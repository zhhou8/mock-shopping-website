import Link from "next/link";
import { getCartCount } from "@/lib/cart";
import { supabaseServer } from "@/lib/supabase/server";
import { MOCK_USER, MOCK_USER_ID } from "@/lib/user";

export async function Header() {
  const supabase = supabaseServer();
  const [count, membership] = await Promise.all([
    getCartCount(),
    supabase
      .from("memberships")
      .select("status")
      .eq("user_id", MOCK_USER_ID)
      .maybeSingle()
  ]);
  const isPremium = membership.data?.status === "active";

  return (
    <header className="bg-white border-b border-ah-border sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-ah-blue text-xl">
          <span className="bg-ah-blue text-white rounded-md px-2 py-0.5 text-sm">AH</span>
          <span>Mock</span>
        </Link>

        <nav className="ml-6 flex items-center gap-5 text-sm text-ah-ink">
          <Link href="/" className="hover:text-ah-blue">Shop</Link>
          <Link href="/membership/plus" className="hover:text-ah-blue" data-bunqpal="nav-membership">
            AH Plus
          </Link>
          <Link href="/orders" className="hover:text-ah-blue" data-bunqpal="nav-orders">
            Orders
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-ah-border bg-white px-4 py-2 hover:bg-ah-paper text-sm"
            data-bunqpal="nav-cart"
          >
            Cart
            {count > 0 && (
              <span className="bg-ah-blue text-white text-xs rounded-full px-2 py-0.5" data-bunqpal="cart-count">
                {count}
              </span>
            )}
          </Link>
          <div
            className="flex items-center gap-2 rounded-full bg-ah-paper px-3 py-1.5"
            data-bunqpal="user-pill"
            data-bunqpal-user-id={MOCK_USER.id}
          >
            <span className="bg-ah-blue text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-semibold">
              {MOCK_USER.initials}
            </span>
            <div className="text-xs leading-tight">
              <div className="font-semibold">{MOCK_USER.name}</div>
              <div className="text-neutral-500">
                {isPremium ? (
                  <span className="text-ah-blue font-medium">AH Plus</span>
                ) : (
                  "Standard"
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
