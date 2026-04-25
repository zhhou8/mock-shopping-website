"use client";

import { useState, useTransition } from "react";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({ productId, label = "Add to cart" }: { productId: string; label?: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      className="btn-primary"
      data-bunqpal="add-to-cart-button"
      data-bunqpal-product-id={productId}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await addToCart(productId, 1);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        })
      }
    >
      {pending ? "Adding…" : done ? "Added ✓" : label}
    </button>
  );
}
