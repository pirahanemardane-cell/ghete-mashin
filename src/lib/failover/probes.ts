import type { FailoverConfig } from "./config";

export type ProbeResult = {
  /** true = primary Cloudflare path looks reachable from Iran-oriented signal */
  cloudflareReachable: boolean;
  sources: string[];
  details: Record<string, unknown>;
};

async function fetchJson(
  url: string,
  timeoutMs: number,
  headers?: Record<string, string>,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", ...(headers || {}) },
      signal: ctrl.signal,
      cache: "no-store",
    });
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { ok: res.ok, status: res.status, json };
  } finally {
    clearTimeout(t);
  }
}

function arvanAuthHeader(apiKey: string): string {
  const k = apiKey.trim();
  if (/^apikey\s+/i.test(k)) return k.replace(/^apikey\s+/i, "Apikey ");
  return `Apikey ${k}`;
}

/**
 * Iran-oriented reachability of the Cloudflare path.
 * Prefer FAILOVER_IRAN_PROBE_URL (host on Arvan/Iran) and/or Arvan health-check reports.
 * A probe from Vercel-fra alone cannot detect Iran nationalization.
 */
export async function probeCloudflareFromIran(cfg: FailoverConfig): Promise<ProbeResult> {
  const sources: string[] = [];
  const details: Record<string, unknown> = {};
  const votes: boolean[] = [];

  if (cfg.iranProbeUrl) {
    sources.push("iran_probe_url");
    try {
      const r = await fetchJson(cfg.iranProbeUrl, cfg.probeTimeoutMs);
      details.iranProbe = { status: r.status, body: r.json };
      const body = r.json as Record<string, unknown> | null;
      if (body && typeof body.cloudflareReachable === "boolean") {
        votes.push(body.cloudflareReachable);
      } else if (body && typeof body.ok === "boolean") {
        // ok=true means CF path healthy from Iran
        votes.push(body.ok);
      } else {
        votes.push(r.ok);
      }
    } catch (e) {
      details.iranProbeError = e instanceof Error ? e.message : "error";
      // Probe infrastructure failure: do not flip (conservative)
    }
  }

  if (cfg.useArvanHealthReports && cfg.arvanApiKey && cfg.arvanDomain) {
    sources.push("arvan_health_reports");
    try {
      const url = `https://napi.arvancloud.ir/cdn/4.0/domains/${encodeURIComponent(cfg.arvanDomain)}/health-checks/reports/summary`;
      const r = await fetchJson(url, cfg.probeTimeoutMs, {
        Authorization: arvanAuthHeader(cfg.arvanApiKey),
      });
      details.arvanHealth = { status: r.status, body: r.json };
      if (r.ok && r.json && typeof r.json === "object") {
        const data = (r.json as { data?: Record<string, unknown> }).data || (r.json as Record<string, unknown>);
        // Heuristic: treat unhealthy / failing counts as CF-unreachable when checks target primary.
        const unhealthy =
          Number(data.unhealthy ?? data.down ?? data.failed ?? 0) ||
          (data.status === "unhealthy" || data.status === "down" ? 1 : 0);
        const healthy = Number(data.healthy ?? data.up ?? 0);
        if (unhealthy > 0 && healthy === 0) votes.push(false);
        else if (healthy > 0) votes.push(true);
        else if (typeof data.healthy === "boolean") votes.push(data.healthy);
      }
    } catch (e) {
      details.arvanHealthError = e instanceof Error ? e.message : "error";
    }
  }

  if (votes.length === 0) {
    return {
      cloudflareReachable: true,
      sources: sources.length ? sources : ["none"],
      details: {
        ...details,
        note: "No Iran-oriented probe configured or probe errored; refusing to failover",
      },
    };
  }

  // Any Iran source saying unreachable → treat as fail (prefer availability in Iran)
  const cloudflareReachable = votes.every((v) => v === true);
  return { cloudflareReachable, sources, details: { ...details, votes } };
}
