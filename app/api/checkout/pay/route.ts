import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { MOCK_USER_ID } from "@/lib/user";
import {
  generateInvoiceNumber,
  isPlausibleCard,
  isValidIban,
  maskCard,
  maskIban
} from "@/lib/payment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface IbanPayload {
  payment_method: "iban";
  iban: string;
  holder_name: string;
}

interface CardPayload {
  payment_method: "card";
  card_number: string;
  expiry: string;
  cvc: string;
  holder_name: string;
}

type Payload = (IbanPayload | CardPayload) & {
  mode: "cart" | "membership";
  productId?: string;
};

function validate(p: Payload): { ok: true; reference: string } | { ok: false; error: string } {
  if (p.payment_method === "iban") {
    if (!isValidIban(p.iban)) return { ok: false, error: "Please enter a valid IBAN" };
    if (!p.holder_name || p.holder_name.length < 2)
      return { ok: false, error: "Account holder name is required" };
    return { ok: true, reference: maskIban(p.iban) };
  }
  if (p.payment_method === "card") {
    if (!isPlausibleCard(p.card_number))
      return { ok: false, error: "Please enter a valid card number" };
    if (!/^\d{2}\/\d{2}$/.test(p.expiry))
      return { ok: false, error: "Expiry must be MM/YY" };
    if (!/^\d{3,4}$/.test(p.cvc)) return { ok: false, error: "CVC must be 3 or 4 digits" };
    if (!p.holder_name || p.holder_name.length < 2)
      return { ok: false, error: "Cardholder name is required" };
    return { ok: true, reference: maskCard(p.card_number) };
  }
  return { ok: false, error: "Unknown payment method" };
}

export async function POST(req: Request) {
  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const validation = validate(payload);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }
  const reference = validation.reference;

  const supabase = supabaseServer();

  if (payload.mode === "membership") {
    const productId = payload.productId || "membership_ahplus";
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    if (productErr || !product) {
      return NextResponse.json({ ok: false, error: "Membership product not found" }, { status: 404 });
    }

    const now = new Date();
    const cycleDays = product.cycle_days ?? 30;
    const periodEnd = new Date(now.getTime() + cycleDays * 86400_000);

    const { data: membership, error: msErr } = await supabase
      .from("memberships")
      .upsert(
        {
          user_id: MOCK_USER_ID,
          product_id: product.id,
          status: "active",
          started_at: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancelled_at: null,
          refunded_at: null,
          created_by: "user",
          updated_at: now.toISOString()
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();
    if (msErr) {
      return NextResponse.json({ ok: false, error: msErr.message }, { status: 500 });
    }

    const refundWindowEnds = new Date(now.getTime() + (product.refund_window_days ?? 14) * 86400_000);
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: MOCK_USER_ID,
        merchant: "AH Mock",
        subtotal: product.price,
        shipping: 0,
        total: product.price,
        currency: "EUR",
        status: "paid",
        payment_method: payload.payment_method,
        payment_reference: reference,
        invoice_number: generateInvoiceNumber(),
        created_by: "user",
        refund_window_ends_at: refundWindowEnds.toISOString(),
        metadata: { kind: "membership", membership_id: membership.id }
      })
      .select()
      .single();
    if (orderErr) {
      return NextResponse.json({ ok: false, error: orderErr.message }, { status: 500 });
    }
    await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: 1,
      line_total: product.price
    });

    return NextResponse.json({
      ok: true,
      kind: "membership",
      orderId: order.id,
      membershipId: membership.id
    });
  }

  // mode === "cart"
  const { data: cartRows, error: cartErr } = await supabase
    .from("cart_items")
    .select("quantity, products(*)")
    .eq("user_id", MOCK_USER_ID);
  if (cartErr) {
    return NextResponse.json({ ok: false, error: cartErr.message }, { status: 500 });
  }
  if (!cartRows || cartRows.length === 0) {
    return NextResponse.json({ ok: false, error: "Cart is empty" }, { status: 400 });
  }

  const lines = cartRows.map((row: any) => ({
    product: row.products,
    quantity: row.quantity,
    line_total: Number(row.products.price) * row.quantity
  }));
  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);

  const { data: membership } = await supabase
    .from("memberships")
    .select("status")
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();
  const isPremium = membership?.status === "active";
  const shipping = isPremium ? 0 : 0.99;
  const discount = isPremium ? subtotal * 0.1 : 0;
  const total = Number((subtotal - discount + shipping).toFixed(2));

  const now = new Date();
  const maxRefundDays = Math.max(...lines.map((l) => l.product.refund_window_days ?? 14));
  const refundWindowEnds = new Date(now.getTime() + maxRefundDays * 86400_000);

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: MOCK_USER_ID,
      merchant: "AH Mock",
      subtotal: Number(subtotal.toFixed(2)),
      shipping,
      total,
      currency: "EUR",
      status: "paid",
      payment_method: payload.payment_method,
      payment_reference: reference,
      invoice_number: generateInvoiceNumber(),
      created_by: "user",
      refund_window_ends_at: refundWindowEnds.toISOString(),
      metadata: { kind: "cart", premium_discount: discount }
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

  await supabase.from("cart_items").delete().eq("user_id", MOCK_USER_ID);

  return NextResponse.json({ ok: true, kind: "cart", orderId: order.id });
}
