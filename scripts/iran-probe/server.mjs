#!/usr/bin/env node
/**
 * Minimal Iran-side probe for Cloudflare reachability.
 * Deploy on Arvan Cloud Server (or any host inside Iran).
 *
 * Env:
 *   PORT=8787
 *   PROBE_TARGET=https://ghetemashin.ir/api/health
 *   PROBE_SECRET=   (optional; require ?secret= or Bearer)
 *
 * Response: { ok, cloudflareReachable, status, ms, target }
 */
import http from "node:http";

const PORT = Number(process.env.PORT || 8787);
const TARGET = (process.env.PROBE_TARGET || "https://ghetemashin.ir/api/health").trim();
const SECRET = (process.env.PROBE_SECRET || "").trim();
const TIMEOUT_MS = Number(process.env.PROBE_TIMEOUT_MS || 7000);

function authorized(req) {
  if (!SECRET) return true;
  const auth = req.headers.authorization || "";
  if (auth === `Bearer ${SECRET}`) return true;
  const url = new URL(req.url || "/", "http://local");
  return url.searchParams.get("secret") === SECRET;
}

async function probe() {
  const started = Date.now();
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(TARGET, {
      method: "GET",
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    const ms = Date.now() - started;
    return {
      ok: res.ok,
      cloudflareReachable: res.ok,
      status: res.status,
      ms,
      target: TARGET,
    };
  } catch (e) {
    return {
      ok: false,
      cloudflareReachable: false,
      status: 0,
      ms: Date.now() - started,
      target: TARGET,
      error: e instanceof Error ? e.message : "error",
    };
  } finally {
    clearTimeout(t);
  }
}

const server = http.createServer(async (req, res) => {
  if (!authorized(req)) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "unauthorized" }));
    return;
  }
  const body = await probe();
  res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
});

server.listen(PORT, "0.0.0.0", () => {
  console.info(`[iran-probe] listening :${PORT} target=${TARGET}`);
});
