# Automatic failover: Cloudflare → ArvanCloud (ابرآروان)

Default path remains **Cloudflare**. When **Iran-oriented** checks say the Cloudflare path is unreachable, a Vercel cron can activate a pre-warmed **Arvan** path.

## Why a Vercel-only health check is not enough

A cron in `fra1` still reaches Cloudflare during Iran nationalization. Detection **must** use an Iran-side signal:

1. **`FAILOVER_IRAN_PROBE_URL`** — tiny probe on Arvan Cloud Server (`scripts/iran-probe/server.mjs`) that GETs `https://ghetemashin.ir/api/health` from inside Iran, or
2. **Arvan Active Health Checks** (CDN console) targeting the Cloudflare URL — cron reads `…/health-checks/reports/summary` via `ARVAN_API_KEY`.

## Two failure modes

| Mode | What breaks | What automation can do |
|------|-------------|-------------------------|
| **Filter** | CF edge IPs blocked; CF DNS still resolves | Rewrite Cloudflare DNS (`@`/`www`) → `FAILOVER_CF_FAILOVER_CNAME` (Arvan), DNS-only |
| **Nationalization** | CF **nameservers** unreachable from Iran | Record flips on Cloudflare **do not help**. Need registrar **NS → Arvan** via `FAILOVER_NS_HOOK_URL` (or manual IRNIC/reseller). Arvan zone must already be fully configured (hot standby). |

## Architecture (lean)

```
Iran probe / Arvan health ──► Vercel cron /api/cron/failover
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             ensure Arvan     CF DNS → Arvan   optional NS hook
             cloud=true       CNAME (filter)   (nationalization)
```

- State: R2 `ops/failover-state.json` (streaks + DNS snapshots).
- Safe defaults: `FAILOVER_ENABLED=false`, `FAILOVER_AUTO_APPLY=false` (probe-only dry-run).

## Code

- `src/lib/failover/*` — config, probes, CF/Arvan DNS, controller
- `src/app/api/cron/failover/route.ts` — cron entry (`*/5 * * * *` in `vercel.json`)
- `scripts/iran-probe/server.mjs` — deploy on Arvan IaaS inside Iran

## Media mirror (R2 ↔ Arvan Object Storage)

During Arvan failover, `media.ghetemashin.ir` on Cloudflare R2 may also be unreachable from Iran.

**Human setup (no secrets in git):**

1. Create Arvan Object Storage bucket (e.g. `ghetemashin-media`).
2. Public base → `ARVAN_MEDIA_PUBLIC_BASE_URL` (e.g. `https://media-arvan.ghetemashin.ir`).
3. Mirror uploads: either periodic sync (rclone/S3) R2 → Arvan, or dual-write later.
4. On Arvan CDN, page-rule/rewrite `/` media host to Arvan bucket when on Arvan path.
5. Keep `R2_PUBLIC_BASE_URL` as primary; Arvan media is standby.

App dual-read of media is **not** wired in this PR (lean); mirror + CDN host is enough for go-live resilience.

## Runbook — enable automation

1. Finish base go-live (Cloudflare + Vercel + Supabase + R2) per `docs/GO-LIVE.md`.
2. **Arvan console**: add domain `ghetemashin.ir` (DNS service). Import/create `@` + `www` → Vercel origin; enable CDN cloud; TLS.
3. **Arvan Active Health Check** (optional): target `https://ghetemashin.ir/api/health` (CF path).
4. **Iran probe** (recommended): create Arvan Cloud Server; run `node scripts/iran-probe/server.mjs`; put it behind HTTPS; set `FAILOVER_IRAN_PROBE_URL`.
5. **Cloudflare API token**: Zone.DNS Edit on `ghetemashin.ir`; set `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`.
6. Set `FAILOVER_CF_PRIMARY_CNAME` (current Vercel/CF target) and `FAILOVER_CF_FAILOVER_CNAME` (Arvan CDN hostname / ANAME target).
7. **NS hook** (nationalization): webhook that changes reseller/IRNIC NS to Arvan `ns_keys`; set `FAILOVER_NS_HOOK_URL` + token. Without this, only filter-mode helps.
8. Vercel env: paste Arvan/CF failover vars from `.env.example` (empty placeholders in git).
9. Set `FAILOVER_ENABLED=true`, keep `FAILOVER_AUTO_APPLY=false`; hit `/api/cron/failover` with `CRON_SECRET`; confirm dry-run JSON.
10. After validating streaks/probes: `FAILOVER_AUTO_APPLY=true`.
11. Drill: stop Iran probe target / mark health unhealthy → expect activate; restore → expect Cloudflare.

## Limits

- Propagation: DNS TTL (we use ~120s on failover records) + NS changes (minutes–hours).
- Without Iran probe / Arvan health, controller **refuses** to failover.
- Without NS hook, full nationalization may still leave the apex unresolved inside Iran if CF NS are blocked.
- Secrets never committed; Grok bot pastes from consoles.
