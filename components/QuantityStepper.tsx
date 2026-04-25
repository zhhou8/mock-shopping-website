"use client";

import { useTransition } from "react";
import { removeFromCart, updateQuantity } from "@/lib/cart";

export function QuantityStepper({
  productId,
  quantity
}: {
  productId: string;
  quantity: number;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="inline-flex items-center gap-2" data-bunqpal="qty-stepper">
      <button
        type="button"
        className="w-8 h-8 rounded-full border border-ah-border bg-white hover:bg-ah-paper disabled:opacity-50"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await updateQuantity(productId, quantity - 1);
          })
        }
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center font-medium" data-bunqpal="qty-value">
        {quantity}
      </span>
      <button
        type="button"
        className="w-8 h-8 rounded-full border border-ah-border bg-white hover:bg-ah-paper disabled:opacity-50"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await updateQuantity(productId, quantity + 1);
          })
        }
        aria-label="Increase quantity"
      >
        +
      </button>
      <button
        type="button"
        className="ml-2 text-sm text-neutral-500 hover:text-red-600"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await removeFromCart(productId);
          })
        }
      >
        Remove
      </button>
    </div>
  );
}
