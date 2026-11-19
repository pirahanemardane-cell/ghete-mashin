/** Cloudflare ↔ Arvan failover env (empty = disabled). Never invent secrets. */

function env(name: string): string {
  return (process.env[name] || "").trim();
}

function envBool(name: string, fallback = false): boolean {
  const v = env(name).toLowerCase();
  if (!v) return fallback;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

function envInt(name: string, fallback: number): number {
  const n = Number(env(name));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export type FailoverProvider = "cloudflare" | "arvan";

export function getFailoverConfig() {
  const domain = env("FAILOVER_DOMAIN") || "ghetemashin.ir";
  const siteUrl = (env("NEXT_PUBLIC_SITE_URL") || `https://${domain}`).replace(/\/$/, "");

  return {
    enabled: envBool("FAILOVER_ENABLED", false),
    /** When false, probe + decide but do not mutate DNS (safe default). */
    autoApply: envBool("FAILOVER_AUTO_APPLY", false),
    domain,
    siteUrl,
    /** Primary (Cloudflare-fronted) URL checked from Iran-oriented probes. */
    primaryCheckUrl: env("FAILOVER_PRIMARY_CHECK_URL") || siteUrl,
    /** Optional warm Arvan hostname used after switch / for secondary probe. */
    arvanCheckUrl: env("FAILOVER_ARVAN_CHECK_URL"),
    /**
     * Iran-oriented probe (must run inside Iran / on Arvan).
     * Expected JSON: { "cloudflareReachable": boolean } or { "ok": boolean }.
     */
    iranProbeUrl: env("FAILOVER_IRAN_PROBE_URL"),
    /** Consecutive failed Iran checks before activate; consecutive ok before restore. */
    failThreshold: envInt("FAILOVER_FAIL_THRESHOLD", 3),
    recoverThreshold: envInt("FAILOVER_RECOVER_THRESHOLD", 3),
    probeTimeoutMs: envInt("FAILOVER_PROBE_TIMEOUT_MS", 8000),

    // Cloudflare DNS API (zone must already exist)
    cfApiToken: env("CLOUDFLARE_API_TOKEN"),
    cfZoneId: env("CLOUDFLARE_ZONE_ID"),
    /** Comma-separated record names to rewrite on filter-failover (@ and www typical). */
    cfRecordNames: (env("FAILOVER_CF_RECORD_NAMES") || "@,www")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    /**
     * Target when activating Arvan via Cloudflare DNS (filter mode):
     * CNAME/ANAME host — e.g. Arvan CDN endpoint or arvan-origin hostname.
     */
    cfFailoverCname: env("FAILOVER_CF_FAILOVER_CNAME"),
    /** Snapshot restore: Vercel/CF target while on Cloudflare path (e.g. cname.vercel-dns.com). */
    cfPrimaryCname: env("FAILOVER_CF_PRIMARY_CNAME"),

    // Arvan CDN/DNS API
    arvanApiKey: env("ARVAN_API_KEY"),
    arvanDomain: env("ARVAN_DOMAIN") || domain,
    /** Use Arvan Active Health Check reports as Iran-oriented signal when set. */
    useArvanHealthReports: envBool("FAILOVER_USE_ARVAN_HEALTH", true),
    /** Optional: ensure these Arvan record names have cloud=true on activate. */
    arvanCloudRecordNames: (env("FAILOVER_ARVAN_CLOUD_NAMES") || "@,www")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),

    /**
     * Full nationalization: CF NS unreachable from Iran — record flips on CF do not help.
     * Optional webhook (POST JSON) for registrar NS switch Cloudflare → Arvan.
     */
    nsHookUrl: env("FAILOVER_NS_HOOK_URL"),
    nsHookToken: env("FAILOVER_NS_HOOK_TOKEN"),

    /** Media mirror base (Arvan Object Storage public URL) — informational / future dual-read. */
    arvanMediaBaseUrl: env("ARVAN_MEDIA_PUBLIC_BASE_URL"),

    stateKey: env("FAILOVER_STATE_R2_KEY") || "ops/failover-state.json",
  };
}

export type FailoverConfig = ReturnType<typeof getFailoverConfig>;
