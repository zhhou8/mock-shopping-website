import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";

async function cancelMembership() {
  "use server";
  const supabase = supabaseServer();
  await supabase
    .from("memberships")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("user_id", MOCK_USER_ID);
  redirect("/membership/plus?cancelled=1");
}

export default async function CancelMembershipPage() {
  const supabase = supabaseServer();
  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-8"
      data-bunqpal="cancel-membership-form"
    >
      <Link href="/membership/plus" className="text-sm text-neutral-500 hover:text-ah-blue">
        ← Back to AH Plus
      </Link>

      <div className="card p-6 mt-3">
        <h1 className="text-2xl font-bold">Cancel AH Plus</h1>

        {!membership || membership.status !== "active" ? (
          <p className="mt-3 text-neutral-600">You don&apos;t have an active membership to cancel.</p>
        ) : (
          <>
            <p className="text-neutral-700 mt-3">
              Your benefits will continue until the end of the current billing period
              ({formatDate(membership.current_period_end)}). You won&apos;t be charged again.
            </p>

            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>• You&apos;ll lose 10% off every order.</li>
              <li>• Delivery returns to €4.95 per order.</li>
              <li>• You can re-subscribe at any time.</li>
            </ul>

            <form action={cancelMembership} className="mt-6 flex gap-3">
              <button
                type="submit"
                className="btn-danger"
                data-bunqpal="confirm-cancel-membership"
              >
                Confirm cancellation
              </button>
              <Link href="/membership/plus" className="btn-ghost">
                Keep membership
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
