/**
 * Rename the sandbox merchant so payments show "AH Mock" instead of the
 * random sandbox display name.
 *
 * Touches two things:
 *   - PUT /v1/user-person/{id}   -> display_name + public_nick_name
 *   - PUT /v1/user/{id}/monetary-account-bank/{aid} -> description
 *
 * Re-reads the monetary account afterwards so we can refresh iban_holder
 * in .bunq-merchant.json.
 *
 * Usage:  npx tsx scripts/bunq-rename-merchant.ts [newName]
 */

import { createSign, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const NEW_NAME = process.argv[2] ?? "AH Mock";
const CRED_PATH = join(process.cwd(), ".bunq-merchant.json");

type Creds = {
  base_url: string;
  private_key_pem: string;
  session_token: string;
  user_id: number;
  monetary_account_id: number;
  iban: string;
  iban_holder: string | null;
};

function baseHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-cache",
    "User-Agent": "ah-mock-merchant/0.1",
    "X-Bunq-Client-Request-Id": randomUUID(),
    "X-Bunq-Geolocation": "0 0 0 0 000",
    "X-Bunq-Language": "en_US",
    "X-Bunq-Region": "en_US",
  };
}

function sign(body: string, privateKeyPem: string): string {
  const signer = createSign("RSA-SHA256");
  signer.update(body, "utf8");
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

async function call(
  method: "PUT" | "GET",
  path: string,
  body: object | null,
  creds: Creds,
): Promise<unknown> {
  const bodyStr = body === null ? "" : JSON.stringify(body);
  const headers: Record<string, string> = {
    ...baseHeaders(),
    "X-Bunq-Client-Authentication": creds.session_token,
  };
  if (bodyStr) {
    headers["Content-Type"] = "application/json";
    headers["X-Bunq-Client-Signature"] = sign(bodyStr, creds.private_key_pem);
  }
  const res = await fetch(`${creds.base_url}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} -> ${res.status}\n${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function main() {
  const creds = JSON.parse(await readFile(CRED_PATH, "utf8")) as Creds;
  console.log(`→ renaming merchant to "${NEW_NAME}"`);

  console.log(`  PUT /v1/user-person/${creds.user_id}`);
  try {
    await call(
      "PUT",
      `/v1/user-person/${creds.user_id}`,
      { display_name: NEW_NAME, public_nick_name: NEW_NAME },
      creds,
    );
    console.log("    ok");
  } catch (err) {
    console.warn(`    skipped: ${(err as Error).message.split("\n")[0]}`);
  }

  console.log(
    `  PUT /v1/user/${creds.user_id}/monetary-account-bank/${creds.monetary_account_id}`,
  );
  await call(
    "PUT",
    `/v1/user/${creds.user_id}/monetary-account-bank/${creds.monetary_account_id}`,
    { description: NEW_NAME },
    creds,
  );
  console.log("    ok");

  console.log("→ re-reading monetary account…");
  const after = (await call(
    "GET",
    `/v1/user/${creds.user_id}/monetary-account/${creds.monetary_account_id}`,
    null,
    creds,
  )) as {
    Response: {
      MonetaryAccountBank: {
        description: string;
        alias: { type: string; value: string; name?: string }[];
      };
    }[];
  };
  const acct = after.Response[0].MonetaryAccountBank;
  const ibanAlias = acct.alias.find((a) => a.type === "IBAN");
  console.log(`  description: ${acct.description}`);
  console.log(`  iban: ${ibanAlias?.value} (${ibanAlias?.name ?? "—"})`);

  const next = {
    ...creds,
    iban_holder: ibanAlias?.name ?? creds.iban_holder,
    account_description: acct.description,
  };
  await writeFile(CRED_PATH, JSON.stringify(next, null, 2) + "\n");
  console.log(`\n✓ updated ${CRED_PATH}`);
}

main().catch((err) => {
  console.error("\n✗ failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
