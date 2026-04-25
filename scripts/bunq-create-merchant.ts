/**
 * Bootstrap a bunq sandbox "merchant" user for the AH Mock storefront.
 *
 * Runs the bunq sandbox handshake end-to-end:
 *   1) POST /v1/sandbox-user-person       -> merchant API key
 *   2) POST /v1/installation              -> installation token + server pubkey
 *   3) POST /v1/device-server             -> register this machine
 *   4) POST /v1/session-server            -> session token + user id
 *   5) GET  /v1/user/{id}/monetary-account -> grab the default IBAN
 *
 * Writes everything (including the RSA keypair, tokens, IBAN) to
 * .bunq-merchant.json at repo root, so payment routes can reuse the session
 * without redoing the handshake.
 *
 * Usage:  npm run bunq:create-merchant
 */

import { createSign, generateKeyPairSync, randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const BASE = "https://public-api.sandbox.bunq.com";
const USER_AGENT = "ah-mock-merchant/0.1";
const DEVICE_DESCRIPTION = "AH Mock Merchant (sandbox)";

type BunqEnvelope<T = unknown> = { Response: T[] };

function baseHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-cache",
    "User-Agent": USER_AGENT,
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

async function postJson<T>(
  path: string,
  body: object | null,
  extraHeaders: Record<string, string> = {},
): Promise<BunqEnvelope<T>> {
  const bodyStr = body === null ? "" : JSON.stringify(body);
  const headers: Record<string, string> = { ...baseHeaders(), ...extraHeaders };
  if (bodyStr) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: bodyStr || undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`POST ${path} -> ${res.status}\n${text}`);
  }
  return JSON.parse(text) as BunqEnvelope<T>;
}

async function getJson<T>(
  path: string,
  extraHeaders: Record<string, string>,
): Promise<BunqEnvelope<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: { ...baseHeaders(), ...extraHeaders },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${path} -> ${res.status}\n${text}`);
  }
  return JSON.parse(text) as BunqEnvelope<T>;
}

function pickField<T>(entries: Record<string, unknown>[], key: string): T {
  const hit = entries.find((e) => key in e);
  if (!hit) throw new Error(`bunq response missing "${key}" entry`);
  return hit[key] as T;
}

async function main() {
  console.log("→ creating sandbox user…");
  const userRes = await postJson<{ ApiKey: { api_key: string } }>(
    "/v1/sandbox-user-person",
    null,
  );
  const apiKey = userRes.Response[0].ApiKey.api_key;
  console.log(`  api_key: ${apiKey.slice(0, 16)}…`);

  console.log("→ generating RSA-2048 keypair…");
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  console.log("→ POST /v1/installation…");
  const installRes = await postJson<Record<string, unknown>>(
    "/v1/installation",
    { client_public_key: publicKey },
  );
  const installToken = pickField<{ token: string }>(
    installRes.Response,
    "Token",
  ).token;
  const serverPublicKey = pickField<{ server_public_key: string }>(
    installRes.Response,
    "ServerPublicKey",
  ).server_public_key;
  console.log(`  installation_token: ${installToken.slice(0, 16)}…`);

  console.log("→ POST /v1/device-server…");
  const deviceBody = JSON.stringify({
    description: DEVICE_DESCRIPTION,
    secret: apiKey,
    permitted_ips: ["*"],
  });
  const deviceRes = await fetch(`${BASE}/v1/device-server`, {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
      "X-Bunq-Client-Authentication": installToken,
      "X-Bunq-Client-Signature": sign(deviceBody, privateKey),
    },
    body: deviceBody,
  });
  const deviceText = await deviceRes.text();
  if (!deviceRes.ok) {
    throw new Error(`POST /v1/device-server -> ${deviceRes.status}\n${deviceText}`);
  }
  const deviceJson = JSON.parse(deviceText) as BunqEnvelope<{
    Id: { id: number };
  }>;
  const deviceId = pickField<{ id: number }>(deviceJson.Response, "Id").id;
  console.log(`  device_id: ${deviceId}`);

  console.log("→ POST /v1/session-server…");
  const sessionBody = JSON.stringify({ secret: apiKey });
  const sessionRes = await fetch(`${BASE}/v1/session-server`, {
    method: "POST",
    headers: {
      ...baseHeaders(),
      "Content-Type": "application/json",
      "X-Bunq-Client-Authentication": installToken,
      "X-Bunq-Client-Signature": sign(sessionBody, privateKey),
    },
    body: sessionBody,
  });
  const sessionText = await sessionRes.text();
  if (!sessionRes.ok) {
    throw new Error(`POST /v1/session-server -> ${sessionRes.status}\n${sessionText}`);
  }
  const sessionJson = JSON.parse(sessionText) as BunqEnvelope<
    Record<string, { id?: number; token?: string }>
  >;
  const sessionToken = pickField<{ token: string }>(
    sessionJson.Response,
    "Token",
  ).token;
  const userEntry = sessionJson.Response.find(
    (e) => "UserPerson" in e || "UserCompany" in e || "UserApiKey" in e,
  );
  if (!userEntry) throw new Error("session response had no User* entry");
  const userKey = Object.keys(userEntry)[0];
  const userId = (userEntry[userKey] as { id: number }).id;
  console.log(`  ${userKey}.id: ${userId}`);

  console.log(`→ GET /v1/user/${userId}/monetary-account…`);
  const accountsRes = await getJson<{
    MonetaryAccountBank: {
      id: number;
      status: string;
      currency: string;
      alias: { type: string; value: string; name?: string }[];
    };
  }>(`/v1/user/${userId}/monetary-account`, {
    "X-Bunq-Client-Authentication": sessionToken,
  });
  const accounts = accountsRes.Response.map((e) => e.MonetaryAccountBank).filter(
    Boolean,
  );
  const active = accounts.find((a) => a.status === "ACTIVE") ?? accounts[0];
  if (!active) throw new Error("merchant has no monetary accounts");
  const ibanAlias = active.alias.find((a) => a.type === "IBAN");
  if (!ibanAlias) throw new Error("active account has no IBAN alias");
  console.log(`  monetary_account_id: ${active.id}`);
  console.log(`  iban: ${ibanAlias.value} (${ibanAlias.name ?? "—"})`);

  const credentialsPath = join(process.cwd(), ".bunq-merchant.json");
  const payload = {
    created_at: new Date().toISOString(),
    base_url: BASE,
    api_key: apiKey,
    private_key_pem: privateKey,
    public_key_pem: publicKey,
    server_public_key_pem: serverPublicKey,
    installation_token: installToken,
    device_id: deviceId,
    session_token: sessionToken,
    user_kind: userKey,
    user_id: userId,
    monetary_account_id: active.id,
    iban: ibanAlias.value,
    iban_holder: ibanAlias.name ?? null,
    currency: active.currency,
  };
  await writeFile(credentialsPath, JSON.stringify(payload, null, 2) + "\n");
  console.log(`\n✓ wrote ${credentialsPath}`);
  console.log(
    "  (gitignored — contains the RSA private key and session token)",
  );
}

main().catch((err) => {
  console.error("\n✗ failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
