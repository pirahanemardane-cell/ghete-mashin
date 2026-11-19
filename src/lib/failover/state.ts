import { r2GetObjectText, r2PutObject } from "@/lib/r2";
import type { FailoverProvider } from "./config";

export type FailoverState = {
  version: 1;
  active: FailoverProvider;
  failStreak: number;
  okStreak: number;
  lastProbeAt: string | null;
  lastDecision: string | null;
  lastError: string | null;
  /** Cloudflare DNS record ids → previous JSON snapshot for restore */
  cfSnapshots: Record<string, unknown>;
  updatedAt: string;
};

export function defaultFailoverState(): FailoverState {
  return {
    version: 1,
    active: "cloudflare",
    failStreak: 0,
    okStreak: 0,
    lastProbeAt: null,
    lastDecision: null,
    lastError: null,
    cfSnapshots: {},
    updatedAt: new Date().toISOString(),
  };
}

export async function loadFailoverState(key: string): Promise<FailoverState> {
  try {
    const raw = await r2GetObjectText(key);
    if (!raw) return defaultFailoverState();
    const parsed = JSON.parse(raw) as FailoverState;
    if (parsed?.version !== 1) return defaultFailoverState();
    return { ...defaultFailoverState(), ...parsed };
  } catch {
    // Missing R2 credentials or object → start from defaults (streaks reset each cold start)
    return defaultFailoverState();
  }
}

export async function saveFailoverState(key: string, state: FailoverState): Promise<void> {
  try {
    const body = Buffer.from(
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2),
      "utf-8",
    );
    await r2PutObject({
      key,
      body,
      contentType: "application/json",
      cacheControl: "private, no-store",
    });
  } catch (e) {
    // Persist best-effort; controller still returns decision in the cron response
    throw e;
  }
}
