import { getFailoverConfig } from "./config";
import { probeCloudflareFromIran } from "./probes";
import {
  applyCloudflareToArvanCname,
  restoreCloudflarePrimary,
} from "./cloudflare-dns";
import { callNsHook, ensureArvanCloudOn } from "./arvan-dns";
import { defaultFailoverState, loadFailoverState, saveFailoverState } from "./state";

export type FailoverRunResult = {
  ok: boolean;
  enabled: boolean;
  autoApply: boolean;
  dryRun: boolean;
  active: "cloudflare" | "arvan";
  decision: string;
  probe: Awaited<ReturnType<typeof probeCloudflareFromIran>>;
  actions: string[];
  state: ReturnType<typeof defaultFailoverState>;
  error?: string;
};

/**
 * Health-check driven failover:
 * - Default active path: Cloudflare
 * - Iran-oriented probes decide when Cloudflare path is unreachable from Iran
 * - Filter mode: rewrite CF DNS → Arvan CNAME (helps when CF DNS still resolves)
 * - Nationalization: optional NS hook (registrar → Arvan NS); CF record flips alone are not enough
 */
export async function runFailoverCheck(): Promise<FailoverRunResult> {
  const cfg = getFailoverConfig();
  const actions: string[] = [];

  if (!cfg.enabled) {
    return {
      ok: true,
      enabled: false,
      autoApply: false,
      dryRun: true,
      active: "cloudflare",
      decision: "disabled",
      probe: {
        cloudflareReachable: true,
        sources: ["disabled"],
        details: {},
      },
      actions,
      state: defaultFailoverState(),
    };
  }

  let state = await loadFailoverState(cfg.stateKey);
  const probe = await probeCloudflareFromIran(cfg);
  state.lastProbeAt = new Date().toISOString();

  if (probe.cloudflareReachable) {
    state.okStreak += 1;
    state.failStreak = 0;
  } else {
    state.failStreak += 1;
    state.okStreak = 0;
  }

  let decision = "hold";
  const dryRun = !cfg.autoApply;

  try {
    if (!probe.cloudflareReachable && state.active === "cloudflare") {
      if (state.failStreak >= cfg.failThreshold) {
        decision = dryRun ? "would_activate_arvan" : "activate_arvan";
        if (!dryRun) {
          if (cfg.arvanApiKey) {
            const arvan = await ensureArvanCloudOn(cfg);
            actions.push(`arvan_cloud_on:${arvan.enabled.length}`);
          }
          if (cfg.cfApiToken && cfg.cfFailoverCname) {
            const cf = await applyCloudflareToArvanCname(cfg);
            state.cfSnapshots = { ...state.cfSnapshots, ...cf.snapshots };
            actions.push(`cf_dns_to_arvan:${cf.updated.length}`);
          } else {
            actions.push("cf_dns_skipped_missing_token_or_cname");
          }
          const ns = await callNsHook(cfg, "activate_arvan_ns");
          if (ns.called) actions.push(`ns_hook:${ns.status}`);
          else actions.push("ns_hook_not_configured");
          state.active = "arvan";
        }
      } else {
        decision = `fail_streak_${state.failStreak}_of_${cfg.failThreshold}`;
      }
    } else if (probe.cloudflareReachable && state.active === "arvan") {
      if (state.okStreak >= cfg.recoverThreshold) {
        decision = dryRun ? "would_restore_cloudflare" : "restore_cloudflare";
        if (!dryRun) {
          if (cfg.cfApiToken) {
            const r = await restoreCloudflarePrimary(cfg, state.cfSnapshots);
            actions.push(`cf_dns_restored:${r.restored.length}`);
          }
          const ns = await callNsHook(cfg, "restore_cloudflare_ns");
          if (ns.called) actions.push(`ns_hook:${ns.status}`);
          state.active = "cloudflare";
          state.cfSnapshots = {};
        }
      } else {
        decision = `ok_streak_${state.okStreak}_of_${cfg.recoverThreshold}`;
      }
    } else {
      decision = state.active === "cloudflare" ? "cloudflare_healthy" : "arvan_active_hold";
    }

    state.lastDecision = decision;
    state.lastError = null;
    await saveFailoverState(cfg.stateKey, state).catch((e) => {
      actions.push(`state_save_failed:${e instanceof Error ? e.message : "error"}`);
    });

    return {
      ok: true,
      enabled: true,
      autoApply: cfg.autoApply,
      dryRun,
      active: state.active,
      decision,
      probe,
      actions,
      state,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    state.lastError = msg;
    state.lastDecision = "error";
    await saveFailoverState(cfg.stateKey, state).catch(() => undefined);
    return {
      ok: false,
      enabled: true,
      autoApply: cfg.autoApply,
      dryRun,
      active: state.active,
      decision: "error",
      probe,
      actions,
      state,
      error: msg,
    };
  }
}
