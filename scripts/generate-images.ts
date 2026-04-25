/**
 * Generate one product photo per SKU using Pollinations.ai (free, no API key).
 *
 * Usage:  npm run generate-images
 *
 * Outputs JPGs to `public/products/<id>.jpg` and rewrites the image_url
 * column in supabase/seed.sql to point at the local files.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const STYLE = "professional studio product photography, pure white background, soft even diffused lighting, centred composition, photorealistic, sharp focus, no text overlay, no people, no shadows, supermarket catalogue style";

const products: { id: string; prompt: string }[] = [
  // Pantry
  { id: "pantry_bread",         prompt: "an 800g loaf of sliced wholegrain Dutch bread in a transparent plastic bag" },
  { id: "pantry_pasta",         prompt: "a 500g packet of dry penne pasta in a transparent bag" },
  { id: "pantry_rice",          prompt: "a 1kg bag of long grain basmati white rice in a brown paper bag with clear window" },
  { id: "pantry_cereal",        prompt: "a cardboard cereal box of crunchy hazelnut and raisin muesli, 500g" },
  { id: "pantry_peanutbutter",  prompt: "a glass jar of natural smooth peanut butter with red label" },

  // Dairy & Eggs
  { id: "dairy_milk",           prompt: "a 1 litre carton of semi-skimmed dairy milk, blue and white packaging" },
  { id: "dairy_cheese",         prompt: "a 200g vacuum-sealed package of sliced yellow Dutch Gouda cheese" },
  { id: "dairy_eggs",           prompt: "an open cardboard egg carton with 10 brown free-range chicken eggs" },
  { id: "dairy_yogurt",         prompt: "a one litre plastic tub of plain full-fat white yogurt with foil lid" },
  { id: "dairy_butter",         prompt: "a 250g block of salted butter wrapped in foil and paper sleeve" },

  // Produce
  { id: "produce_apples",       prompt: "a 1kg net bag of fresh red Elstar apples" },
  { id: "produce_bananas",      prompt: "a bunch of ripe yellow bananas" },
  { id: "produce_tomatoes",     prompt: "a clear plastic punnet of fresh red on the vine cherry tomatoes" },
  { id: "produce_lettuce",      prompt: "a fresh whole head of green iceberg lettuce" },
  { id: "produce_potatoes",     prompt: "a 2kg net bag of brown floury potatoes" },

  // Drinks
  { id: "drinks_coffee",        prompt: "a 1kg matte brown bag of dark roast espresso whole coffee beans" },
  { id: "drinks_tea",           prompt: "a small cardboard box of 20 English Breakfast black tea bags" },
  { id: "drinks_oj",            prompt: "a 1 litre carton of fresh orange juice" },
  { id: "drinks_sparkling",     prompt: "a 1.5 litre clear plastic bottle of sparkling mineral water with red label" },
  { id: "drinks_beer",          prompt: "a six pack of green pilsner beer bottles in a cardboard carrier" },

  // Pet
  { id: "pet_dogfood_small",    prompt: "a 2.6 kilogram bag of premium adult dog food kibble with happy dog illustration on the bag" },
  { id: "pet_dogfood_large",    prompt: "a large 12 kilogram family bag of dog food kibble with dog illustration" },
  { id: "pet_dogtreats",        prompt: "a small bag of soft meat stick dog treats" },
  { id: "pet_catfood",          prompt: "a 1.5 kilogram bag of dry cat food kibble with cat illustration on purple packaging" },

  // Household
  { id: "home_toiletpaper",     prompt: "a package of 12 rolls of soft 3 ply white toilet paper in transparent plastic" },
  { id: "home_kitchenpaper",    prompt: "a package of 4 rolls of absorbent white kitchen paper towels in plastic wrap" },
  { id: "home_dishsoap",        prompt: "a 650ml plastic squeeze bottle of yellow lemon scented dishwashing liquid" },
  { id: "home_laundry",         prompt: "a 1.7 litre bottle of liquid colour laundry detergent" },

  // Snacks
  { id: "snacks_stroopwafels",  prompt: "an 8 pack of traditional Dutch caramel filled stroopwafels in clear plastic packaging" },
  { id: "snacks_chocolate",     prompt: "a 180g bar of dark 70 percent cocoa chocolate in a red wrapper" },

  // Subscription
  { id: "membership_ahplus",    prompt: "a premium loyalty membership card in blue and white design lying on a clean surface" }
];

const PUBLIC_DIR = join(process.cwd(), "public", "products");
const SEED_PATH = join(process.cwd(), "supabase", "seed.sql");
const POLLINATIONS = "https://image.pollinations.ai/prompt";

async function generateOne(prompt: string, seed: number): Promise<Buffer> {
  const params = new URLSearchParams({
    width: "600",
    height: "600",
    model: "flux",
    nologo: "true",
    seed: String(seed),
    enhance: "true"
  });
  const url = `${POLLINATIONS}/${encodeURIComponent(prompt)}?${params}`;
  // pollinations can take up to ~30s for flux generation
  const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("Suspiciously small image");
  return buf;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 4, baseDelayMs = 8000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const wait = msg.includes("429") ? baseDelayMs * (i + 2) : baseDelayMs;
      if (i < attempts - 1) {
        process.stdout.write(`(retry in ${wait / 1000}s) `);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  const results: { id: string; ok: boolean; err?: string }[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    // Skip if already generated (saves time on partial re-runs).
    try {
      const existing = await readFile(join(PUBLIC_DIR, `${p.id}.jpg`));
      if (existing.length > 5000) {
        console.log(`→ ${p.id} ... skip (already exists)`);
        results.push({ id: p.id, ok: true });
        continue;
      }
    } catch {
      /* not present, generate it */
    }

    const fullPrompt = `${p.prompt}, ${STYLE}`;
    const seed = (i + 1) * 1000 + 42;
    process.stdout.write(`→ ${p.id} ... `);
    try {
      const buf = await withRetry(() => generateOne(fullPrompt, seed));
      await writeFile(join(PUBLIC_DIR, `${p.id}.jpg`), buf);
      process.stdout.write(`ok (${(buf.length / 1024).toFixed(0)}KB)\n`);
      results.push({ id: p.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`FAIL (${msg})\n`);
      results.push({ id: p.id, ok: false, err: msg });
    }
    // Throttle ~6s between generations to stay under Pollinations free-tier rate limit.
    if (i < products.length - 1) await new Promise((r) => setTimeout(r, 6000));
  }

  // Rewrite seed.sql so each product's image_url points at /products/<id>.jpg
  let seed = await readFile(SEED_PATH, "utf-8");
  for (const p of products) {
    const localUrl = `/products/${p.id}.jpg`;
    // Match: '<id>',<anything until>,<single-quoted url>
    // Be robust to either current Unsplash URLs OR previous local paths.
    const re = new RegExp(`('${p.id}',[^\\n]*?)('[^']+')(,\\s*'[^']+',\\s*(?:true|false))`);
    seed = seed.replace(re, (_m, prefix, _oldUrl, suffix) => `${prefix}'${localUrl}'${suffix}`);
  }
  await writeFile(SEED_PATH, seed);

  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n✓ Generated ${okCount}/${products.length} images.`);
  if (okCount < products.length) {
    console.log("Failed:");
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  - ${r.id}: ${r.err}`);
    }
  }
  console.log("\nseed.sql rewritten with local image paths.");
  console.log("Now re-run supabase/seed.sql in the Supabase SQL editor.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
