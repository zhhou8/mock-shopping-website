"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "./supabase/server";
import { MOCK_USER_ID } from "./user";

export async function addToCart(productId: string, quantity: number = 1): Promise<void> {
  const supabase = supabaseServer();
  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", MOCK_USER_ID)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("user_id", MOCK_USER_ID)
      .eq("product_id", productId);
  } else {
    await supabase.from("cart_items").insert({
      user_id: MOCK_USER_ID,
      product_id: productId,
      quantity
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateQuantity(productId: string, quantity: number): Promise<void> {
  const supabase = supabaseServer();
  if (quantity <= 0) {
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", MOCK_USER_ID)
      .eq("product_id", productId);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", MOCK_USER_ID)
      .eq("product_id", productId);
  }
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeFromCart(productId: string): Promise<void> {
  const supabase = supabaseServer();
  await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", MOCK_USER_ID)
    .eq("product_id", productId);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function getCartCount(): Promise<number> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", MOCK_USER_ID);
  return (data || []).reduce((sum, row) => sum + (row.quantity || 0), 0);
}
