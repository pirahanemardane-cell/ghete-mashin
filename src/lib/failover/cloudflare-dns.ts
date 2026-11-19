import type { FailoverConfig } from "./config";

type CfRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied?: boolean;
  ttl?: number;
};

function cfHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function resolveZoneId(cfg: FailoverConfig): Promise<string> {
  if (cfg.cfZoneId) return cfg.cfZoneId;
  const url = `https://api.cloudflare.com/client/v4/zones?name=${encodeURIComponent(cfg.domain)}`;
  const res = await fetch(url, { headers: cfHeaders(cfg.cfApiToken), cache: "no-store" });
  const json = (await res.json()) as { success?: boolean; result?: { id: string }[] };
  const id = json.result?.[0]?.id;
  if (!id) throw new Error("CLOUDFLARE_ZONE_ID missing and zone lookup failed");
  return id;
}

function recordLabel(name: string, domain: string): string {
  const n = name.trim();
  if (n === "@" || n === domain) return domain;
  if (n.endsWith(`.${domain}`)) return n;
  return `${n}.${domain}`;
}

export async function listCfRecords(
  cfg: FailoverConfig,
): Promise<{ zoneId: string; records: CfRecord[] }> {
  if (!cfg.cfApiToken) throw new Error("CLOUDFLARE_API_TOKEN missing");
  const zoneId = await resolveZoneId(cfg);
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?per_page=100`,
    { headers: cfHeaders(cfg.cfApiToken), cache: "no-store" },
  );
  const json = (await res.json()) as { success?: boolean; result?: CfRecord[]; errors?: unknown };
  if (!res.ok || json.success === false) {
    throw new Error(`Cloudflare list DNS failed: ${JSON.stringify(json.errors || json)}`);
  }
  return { zoneId, records: json.result || [] };
}

async function patchCfRecord(
  cfg: FailoverConfig,
  zoneId: string,
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`,
    {
      method: "PATCH",
      headers: cfHeaders(cfg.cfApiToken),
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const json = (await res.json()) as { success?: boolean; errors?: unknown };
  if (!res.ok || json.success === false) {
    throw new Error(`Cloudflare PATCH ${id} failed: ${JSON.stringify(json.errors || json)}`);
  }
}

/** Filter-mode activate: point selected CF records at Arvan CNAME (DNS-only). */
export async function applyCloudflareToArvanCname(
  cfg: FailoverConfig,
): Promise<{ snapshots: Record<string, unknown>; updated: string[] }> {
  if (!cfg.cfFailoverCname) throw new Error("FAILOVER_CF_FAILOVER_CNAME missing");
  const { zoneId, records } = await listCfRecords(cfg);
  const wanted = new Set(cfg.cfRecordNames.map((n) => recordLabel(n, cfg.domain)));
  const snapshots: Record<string, unknown> = {};
  const updated: string[] = [];

  for (const rec of records) {
    if (!wanted.has(rec.name) && !wanted.has(rec.name.replace(/\.$/, ""))) continue;
    if (rec.type !== "CNAME" && rec.type !== "A" && rec.type !== "AAAA") continue;
    snapshots[rec.id] = { ...rec };
    await patchCfRecord(cfg, zoneId, rec.id, {
      type: "CNAME",
      content: cfg.cfFailoverCname.replace(/\.$/, ""),
      proxied: false,
      ttl: 120,
    });
    updated.push(rec.id);
  }
  return { snapshots, updated };
}

/** Restore Cloudflare path from snapshots or FAILOVER_CF_PRIMARY_CNAME. */
export async function restoreCloudflarePrimary(
  cfg: FailoverConfig,
  snapshots: Record<string, unknown>,
): Promise<{ restored: string[] }> {
  const { zoneId, records } = await listCfRecords(cfg);
  const restored: string[] = [];

  for (const rec of records) {
    const snap = snapshots[rec.id] as CfRecord | undefined;
    if (snap) {
      await patchCfRecord(cfg, zoneId, rec.id, {
        type: snap.type,
        content: snap.content,
        proxied: snap.proxied ?? true,
        ttl: snap.ttl ?? 1,
      });
      restored.push(rec.id);
      continue;
    }
  }

  if (restored.length === 0 && cfg.cfPrimaryCname) {
    const wanted = new Set(cfg.cfRecordNames.map((n) => recordLabel(n, cfg.domain)));
    for (const rec of records) {
      if (!wanted.has(rec.name)) continue;
      await patchCfRecord(cfg, zoneId, rec.id, {
        type: "CNAME",
        content: cfg.cfPrimaryCname.replace(/\.$/, ""),
        proxied: true,
        ttl: 1,
      });
      restored.push(rec.id);
    }
  }

  return { restored };
}
