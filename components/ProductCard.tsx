import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/supabase/types";
import { formatEur } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card overflow-hidden hover:shadow-md transition group"
      data-bunqpal="product-card"
      data-bunqpal-product-id={product.id}
    >
      <div className="aspect-square bg-ah-paper relative">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-[1.02] transition"
          unoptimized
        />
      </div>
      <div className="p-4">
        <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">
          {product.brand}
        </div>
        <div className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]" data-bunqpal="product-name">
          {product.name}
        </div>
        <div className="text-xs text-neutral-500 mt-1">{product.unit_label}</div>
        <div className="mt-3 text-lg font-bold text-ah-ink" data-bunqpal="product-price">
          {formatEur(product.price)}
        </div>
      </div>
    </Link>
  );
}
