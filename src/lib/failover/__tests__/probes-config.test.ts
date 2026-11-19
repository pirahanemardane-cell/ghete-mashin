import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getFailoverConfig } from "@/lib/failover/config";

const KEYS = [
  "FAILOVER_ENABLED",
  "FAILOVER_AUTO_APPLY",
  "FAILOVER_DOMAIN",
  "FAILOVER_FAIL_THRESHOLD",
];

describe("failover config", () => {
  const prev: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of KEYS) prev[k] = process.env[k];
  });

  afterEach(() => {
    for (const k of KEYS) {
      if (prev[k] === undefined) delete process.env[k];
      else process.env[k] = prev[k];
    }
  });

  it("defaults to disabled dry-run-safe values", () => {
    delete process.env.FAILOVER_ENABLED;
    delete process.env.FAILOVER_AUTO_APPLY;
    const cfg = getFailoverConfig();
    expect(cfg.enabled).toBe(false);
    expect(cfg.autoApply).toBe(false);
    expect(cfg.domain).toBe("ghetemashin.ir");
    expect(cfg.failThreshold).toBe(3);
  });

  it("parses enable flags", () => {
    process.env.FAILOVER_ENABLED = "true";
    process.env.FAILOVER_AUTO_APPLY = "1";
    process.env.FAILOVER_FAIL_THRESHOLD = "5";
    const cfg = getFailoverConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.autoApply).toBe(true);
    expect(cfg.failThreshold).toBe(5);
  });
});
