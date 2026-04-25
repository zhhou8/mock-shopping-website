import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { supabaseServer } from "@/lib/supabase/server";
import { formatEur } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) notFound();
  const product = data as Product;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-neutral-500">
        <Link href="/" className="hover:text-ah-blue">Shop</Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{product.category}</span>
      </nav>

      <div
        className="grid md:grid-cols-2 gap-8"
        data-bunqpal="product-detail"
        data-bunqpal-product-id={product.id}
      >
        <div className="card aspect-square bg-ah-paper relative overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-contain p-8"
            unoptimized
          />
        </div>

        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-wider text-neutral-500">{product.brand}</div>
          <h1 className="text-3xl font-bold mt-1" data-bunqpal="product-name">
            {product.name}
          </h1>
          <div className="text-sm text-neutral-600 mt-1">{product.unit_label}</div>

          <div className="mt-6 text-3xl font-bold text-ah-ink" data-bunqpal="product-price">
            {formatEur(product.price)}
          </div>

          {product.description && (
            <p className="mt-4 text-neutral-700">{product.description}</p>
          )}

          <div className="mt-8">
            <AddToCartButton productId={product.id} />
          </div>

          <div className="mt-8 card p-4 text-sm text-neutral-600 space-y-1">
            <div>Free delivery on orders over €35.</div>
            <div>Refundable within 14 days of delivery.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
