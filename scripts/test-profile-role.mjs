#!/usr/bin/env node
/**
 * Applies the profile-role migration on a disposable database and runs the SQL regression.
 * Usage: node scripts/test-profile-role.mjs
 * Env: PGPORT (default 5433), PGHOST (default /var/run/postgresql)
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PGPORT || "5433";
const host = process.env.PGHOST || "/var/run/postgresql";
const db = process.env.PROFILE_ROLE_TEST_DB || "profile_role_test";
const psql = process.env.PSQL || "psql";
const pgUser = process.env.PGUSER || "postgres";
const base = ["-h", host, "-p", port, "-U", pgUser, "-v", "ON_ERROR_STOP=1", "-q"];

function run(args, database = "postgres") {
  const cmd = process.getuid?.() === 0 || process.env.USER === "postgres"
    ? [psql, [...base, "-d", database, ...args]]
    : ["sudo", ["-u", "postgres", psql, ...base, "-d", database, ...args]];
  const res = spawnSync(cmd[0], cmd[1], {
    encoding: "utf8",
  });
  if (res.status !== 0) {
    process.stderr.write(res.stdout || "");
    process.stderr.write(res.stderr || "");
    process.exit(res.status || 1);
  }
  return res.stdout;
}

run(["-c", `DROP DATABASE IF EXISTS ${db};`]);
run(["-c", `CREATE DATABASE ${db};`]);
run(
  ["-f", path.join(root, "supabase/tests/profile_role_fixture.sql")],
  db,
);
run(
  ["-f", path.join(root, "supabase/migrations/069_protect_profile_role.sql")],
  db,
);
run(
  ["-f", path.join(root, "supabase/tests/profile_role_escalation.sql")],
  db,
);

const version = run(["-c", "SELECT version();"]);
process.stdout.write(`profile role regression passed\n${version}`);
