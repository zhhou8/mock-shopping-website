import { NextResponse } from "next/server";
import { Document, Page, StyleSheet, Text, View, renderToStream } from "@react-pdf/renderer";
import * as React from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { MOCK_USER, MOCK_USER_ID } from "@/lib/user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#0a0a0a" },
  brand: {
    backgroundColor: "#00ADE6",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontWeight: "bold",
    alignSelf: "flex-start",
    fontSize: 11
  },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 12 },
  number: { fontSize: 11, color: "#666", marginTop: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "1pt solid #e6e6e6", paddingBottom: 16 },
  rightCol: { textAlign: "right" },
  section: { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  bold: { fontWeight: "bold" },
  label: { color: "#777" },
  table: { marginTop: 24 },
  thead: { flexDirection: "row", borderBottom: "1pt solid #e6e6e6", paddingBottom: 4 },
  th: { fontWeight: "bold", fontSize: 10 },
  thItem: { flex: 4 },
  thQty: { flex: 1, textAlign: "right" },
  thUnit: { flex: 2, textAlign: "right" },
  thTotal: { flex: 2, textAlign: "right" },
  row: { flexDirection: "row", borderBottom: "1pt solid #f0f0f0", paddingVertical: 6 },
  totals: { marginTop: 18, marginLeft: "auto", width: 200 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 4,
    borderTop: "1pt solid #e6e6e6",
    fontSize: 12,
    fontWeight: "bold"
  },
  footer: { marginTop: 36, paddingTop: 12, borderTop: "1pt solid #e6e6e6", color: "#666", fontSize: 9 }
});

function fmt(value: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const e = React.createElement;

function InvoiceDoc({ order }: { order: any }) {
  return e(
    Document,
    null,
    e(
      Page,
      { size: "A4", style: styles.page },
      e(
        View,
        { style: styles.headerRow },
        e(
          View,
          null,
          e(Text, { style: styles.brand }, "AH"),
          e(Text, { style: styles.title }, "Invoice"),
          e(Text, { style: styles.number }, order.invoice_number)
        ),
        e(
          View,
          { style: styles.rightCol },
          e(Text, { style: styles.bold }, "AH Mock B.V."),
          e(Text, null, "Provincialeweg 11"),
          e(Text, null, "1506 MA Zaandam"),
          e(Text, null, "Netherlands"),
          e(Text, { style: { marginTop: 6 } }, "VAT: NL000000000B00")
        )
      ),

      e(
        View,
        { style: styles.section },
        e(
          View,
          null,
          e(Text, { style: styles.bold }, "Billed to"),
          e(Text, null, MOCK_USER.name),
          e(Text, null, MOCK_USER.address.line1),
          e(Text, null, `${MOCK_USER.address.postal} ${MOCK_USER.address.city}`),
          e(Text, null, MOCK_USER.address.country)
        ),
        e(
          View,
          { style: styles.rightCol },
          e(Text, null, e(Text, { style: styles.label }, "Invoice date: "), formatDate(order.created_at)),
          e(Text, null, e(Text, { style: styles.label }, "Status: "), order.status.replace("_", " "))
        )
      ),

      e(
        View,
        { style: styles.table },
        e(
          View,
          { style: styles.thead },
          e(Text, { style: [styles.th, styles.thItem] }, "Item"),
          e(Text, { style: [styles.th, styles.thQty] }, "Qty"),
          e(Text, { style: [styles.th, styles.thUnit] }, "Unit"),
          e(Text, { style: [styles.th, styles.thTotal] }, "Total")
        ),
        ...order.order_items.map((item: any) =>
          e(
            View,
            { key: item.id, style: styles.row },
            e(Text, { style: styles.thItem }, item.product_name),
            e(Text, { style: styles.thQty }, String(item.quantity)),
            e(Text, { style: styles.thUnit }, fmt(Number(item.unit_price))),
            e(Text, { style: styles.thTotal }, fmt(Number(item.line_total)))
          )
        )
      ),

      e(
        View,
        { style: styles.totals },
        e(
          View,
          { style: styles.totalsRow },
          e(Text, { style: styles.label }, "Subtotal"),
          e(Text, null, fmt(Number(order.subtotal)))
        ),
        e(
          View,
          { style: styles.totalsRow },
          e(Text, { style: styles.label }, "Shipping"),
          e(Text, null, Number(order.shipping) === 0 ? "Free" : fmt(Number(order.shipping)))
        ),
        e(
          View,
          { style: styles.grandTotal },
          e(Text, null, "Total"),
          e(Text, null, fmt(Number(order.total)))
        )
      ),

      e(
        View,
        { style: styles.footer },
        e(
          Text,
          null,
          `Paid via ${
            order.payment_method === "card"
              ? "card"
              : order.payment_method === "bunq"
              ? `Bunq${order.bunq_account_label ? ` (${order.bunq_account_label})` : ""}`
              : "bank transfer"
          }${order.payment_reference ? ` · ${order.payment_reference}` : ""}${
            order.bunq_payment_id ? ` · payment ID ${order.bunq_payment_id}` : ""
          }`
        ),
        e(Text, null, `Refundable until ${formatDate(order.refund_window_ends_at)}.`)
      )
    )
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", MOCK_USER_ID)
    .maybeSingle();
  if (error || !order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  const stream = await renderToStream(e(InvoiceDoc, { order }) as any);

  // Convert Node.js stream to Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
      stream.on("end", () => controller.close());
      stream.on("error", (err: Error) => controller.error(err));
    }
  });

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.invoice_number}.pdf"`
    }
  });
}
