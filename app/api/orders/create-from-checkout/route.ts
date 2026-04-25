import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { MOCK_USER_ID } from "@/lib/user";
import { generateInvoiceNumber } from "@/lib/payment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Endpoint called by the BunqPal backend AFTER it has executed a real Bunq sandbox
 * payment. The backend tells us what was bought, who the buyer is, and the
 * resulting Bunq payment ID + account. We persist it as an order with
 * created_by="bunqpal" so the order history shows the badge.
 *
 * Body:
 * {
 *   user_id?: string,            // defaults to mock user
 *   items?: [{ product_id, quantity }],   // optional — if omitted, drains the user's current cart
 *   merchant?: string,           // defaults to "AH Mock"
 *   payment: {
 *     bunq_payment_id: string,
 *     bunq_payment_status?: string,
 *     bunq_account_label?: string  // e.g. "Pet Essentials"
 *   },
 *   clear_cart?: boolean         // defaults true
 * }
 *
 * Returns: { ok, order_id, invoice_number, total, currency }
 */

interface CreateBody {
  user_id?: string;
  items?: { product_id: string; quantity: number }[];
  merchant?: string;
  payment: {
    bunq_payment_id: string;
    bunq_payment_status?: string;
    bunq_account_label?: string;
  };
  clear_cart?: boolean;
}

export async function POST(req: Request) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.payment?.bunq_payment_id) {
    return NextResponse.json(
      { ok: false, error: "payment.bunq_payment_id is required" },
      { status: 400 }
    );
  }

  const userId = body.user_id || MOCK_USER_ID;
  const supabase = supabaseServer();

  // Resolve items: explicit list, or fall back to the user's current cart.
  let lines: { product: any; quantity: number; line_total: number }[];

  if (body.items && body.items.length > 0) {
    const ids = body.items.map((i) => i.product_id);
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    const byId = new Map((products || []).map((p) => [p.id, p]));
    const missing = ids.filter((id) => !byId.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Unknown product_id: ${missing.join(", ")}` },
        { status: 400 }
      );
    }
    lines = body.items.map((i) => {
      const product = byId.get(i.product_id)!;
      return {
        product,
        quantity: i.quantity,
        line_total: Number(product.price) * i.quantity
      };
    });
  } else {
    const { data: cartRows, error } = await supabase
      .from("cart_items")
      .select("quantity, products(*)")
      .eq("user_id", userId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    if (!cartRows || cartRows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No items provided and user cart is empty" },
        { status: 400 }
      );
    }
    lines = cartRows.map((r: any) => ({
      product: r.products,
      quantity: r.quantity,
      line_total: Number(r.products.price) * r.quantity
    }));
  }

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);

  const { data: membership } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  const isPremium = membership?.status === "active";
  const shipping = isPremium ? 0 : 4.95;
  const discount = isPremium ? subtotal * 0.1 : 0;
  const total = Number((subtotal - discount + shipping).toFixed(2));

  const now = new Date();
  const maxRefundDays = Math.max(
    14,
    ...lines.map((l) => l.product.refund_window_days ?? 14)
  );
  const refundWindowEnds = new Date(now.getTime() + maxRefundDays * 86400_000);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      merchant: body.merchant || "AH Mock",
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      total,
      currency: "EUR",
      status: "paid",
      payment_method: "bunq",
      payment_reference: body.payment.bunq_account_label || null,
      bunq_payment_id: body.payment.bunq_payment_id,
      bunq_payment_status: body.payment.bunq_payment_status || "COMPLETED",
      bunq_account_label: body.payment.bunq_account_label || null,
      invoice_number: generateInvoiceNumber(),
      created_by: "bunqpal",
      refund_window_ends_at: refundWindowEnds.toISOString(),
      metadata: { kind: "cart", source: "bunqpal_backend", premium_discount: discount }
    })
    .select()
    .single();
  if (orderErr) {
    return NextResponse.json({ ok: false, error: orderErr.message }, { status: 500 });
  }

  await supabase.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id,
      product_id: l.product.id,
      product_name: l.product.name,
      unit_price: l.product.price,
      quantity: l.quantity,
      line_total: l.line_total
    }))
  );

  if (body.clear_cart !== false && (!body.items || body.items.length === 0)) {
    await supabase.from("cart_items").delete().eq("user_id", userId);
  }

  return NextResponse.json({
    ok: true,
    order_id: order.id,
    invoice_number: order.invoice_number,
    total,
    currency: "EUR"
  });
}
