import type { FailoverConfig } from "./config";

function arvanAuth(apiKey: string): string {
  const k = apiKey.trim();
  if (/^apikey\s+/i.test(k)) return k.replace(/^apikey\s+/i, "Apikey ");
  return `Apikey ${k}`;
}

type ArvanRecord = {
  id: string;
  type: string;
  name: string;
  cloud?: boolean;
  value?: unknown;
};

export async function listArvanDnsRecords(cfg: FailoverConfig): Promise<ArvanRecord[]> {
  if (!cfg.arvanApiKey) throw new Error("ARVAN_API_KEY missing");
  const url = `https://napi.arvancloud.ir/cdn/4.0/domains/${encodeURIComponent(cfg.arvanDomain)}/dns-records?per_page=100`;
  const res = await fetch(url, {
    headers: { Authorization: arvanAuth(cfg.arvanApiKey), Accept: "application/json" },
    cache: "no-store",
  });
  const json = (await res.json()) as { data?: ArvanRecord[] };
  if (!res.ok) throw new Error(`Arvan list DNS failed: ${res.status}`);
  return json.data || [];
}

/** Ensure selected records are proxied through Arvan CDN (hot standby ready). */
export async function ensureArvanCloudOn(cfg: FailoverConfig): Promise<{ enabled: string[] }> {
  const records = await listArvanDnsRecords(cfg);
  const wanted = new Set(cfg.arvanCloudRecordNames.map((n) => (n === "@" ? "@" : n)));
  const enabled: string[] = [];

  for (const rec of records) {
    const label = rec.name === cfg.arvanDomain || rec.name === "" ? "@" : rec.name;
    if (!wanted.has(label) && !wanted.has(rec.name)) continue;
    if (rec.cloud === true) continue;
    const res = await fetch(
      `https://napi.arvancloud.ir/cdn/4.0/domains/${encodeURIComponent(cfg.arvanDomain)}/dns-records/${rec.id}/cloud`,
      {
        method: "PUT",
        headers: {
          Authorization: arvanAuth(cfg.arvanApiKey),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cloud: true }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Arvan cloud toggle failed for ${rec.id}: ${res.status} ${text}`);
    }
    enabled.push(rec.id);
  }
  return { enabled };
}

export async function callNsHook(
  cfg: FailoverConfig,
  action: "activate_arvan_ns" | "restore_cloudflare_ns",
): Promise<{ called: boolean; status?: number }> {
  if (!cfg.nsHookUrl) return { called: false };
  const res = await fetch(cfg.nsHookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.nsHookToken ? { Authorization: `Bearer ${cfg.nsHookToken}` } : {}),
    },
    body: JSON.stringify({
      action,
      domain: cfg.domain,
      arvanDomain: cfg.arvanDomain,
      ts: new Date().toISOString(),
    }),
    cache: "no-store",
  });
  return { called: true, status: res.status };
}
