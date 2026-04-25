import { ProductCard } from "@/components/ProductCard";
import { supabaseServer } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  pantry: "Pantry",
  dairy: "Dairy & Eggs",
  produce: "Fresh Produce",
  drinks: "Drinks",
  pet: "Pet",
  household: "Household",
  snacks: "Snacks"
};

const CATEGORY_ORDER = ["pantry", "dairy", "produce", "drinks", "pet", "household", "snacks"];

export default async function HomePage() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .neq("category", "subscription")
    .order("category", { ascending: true });

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <div className="card p-6 border-red-300 text-red-700">
          <h1 className="font-bold mb-2">Database not initialised</h1>
          <p className="text-sm">{error.message}</p>
          <p className="text-sm mt-4">
            Run <code className="bg-ah-paper px-1 rounded">supabase/schema.sql</code> then
            <code className="bg-ah-paper px-1 rounded ml-1">supabase/seed.sql</code> in your Supabase
            project SQL editor.
          </p>
        </div>
      </div>
    );
  }

  const products = (data || []) as Product[];
  const grouped: Record<string, Product[]> = {};
  for (const p of products) {
    (grouped[p.category] ||= []).push(p);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="card p-8 mb-8 bg-gradient-to-br from-ah-blue to-ah-dark text-white">
        <div className="text-sm uppercase tracking-wider opacity-80">Welcome back</div>
        <h1 className="text-3xl font-bold mt-1">Shop your weekly groceries</h1>
        <p className="mt-2 opacity-90 max-w-md">
          Free delivery on orders over €35. Become an AH Plus member to unlock 10% off and free shipping on every order.
        </p>
      </section>

      {CATEGORY_ORDER.filter((c) => grouped[c]?.length).map((cat) => (
        <section key={cat} className="mb-12" data-bunqpal-category={cat}>
          <h2 className="text-xl font-bold mb-4">{CATEGORY_LABELS[cat]}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {grouped[cat].map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
