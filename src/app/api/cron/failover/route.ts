import { NextRequest, NextResponse } from "next/server";
import { runFailoverCheck } from "@/lib/failover/controller";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization") || "";
  if (auth === `Bearer ${secret}`) return true;
  const q = req.nextUrl.searchParams.get("secret");
  return q === secret;
}

/**
 * Cloudflare ↔ Arvan failover watcher.
 * Vercel cron every 5m. Safe default: FAILOVER_ENABLED=false / FAILOVER_AUTO_APPLY=false.
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await runFailoverCheck();
    return NextResponse.json({ ...result, ts: new Date().toISOString() });
  } catch (e) {
    console.error("[cron/failover]", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "server" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
