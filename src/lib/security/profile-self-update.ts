/** Privileged profile columns — never accept from self-service clients. */
export const PROFILE_PRIVILEGED_KEYS = [
  "role",
  "is_active",
  "id",
  "created_at",
  "updated_at",
  "permissions",
  "is_admin",
  "isAdmin",
  "admin",
  "superadmin",
] as const;

const PRIVILEGED = new Set<string>(
  PROFILE_PRIVILEGED_KEYS.map((k) => k.toLowerCase()),
);

export type ProfileSelfPatch = {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

/**
 * Strip/reject privileged fields on profile self-update payloads.
 * Server Actions can receive extra keys at runtime even if TS types omit them.
 */
export function sanitizeProfileSelfUpdate(input: unknown):
  | { ok: true; patch: ProfileSelfPatch }
  | { ok: false; error: "forbidden_field" | "invalid_input" } {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, error: "invalid_input" };
  }
  const raw = input as Record<string, unknown>;
  for (const key of Object.keys(raw)) {
    if (PRIVILEGED.has(key.toLowerCase())) {
      return { ok: false, error: "forbidden_field" };
    }
  }

  const patch: ProfileSelfPatch = {};
  if ("full_name" in raw) {
    if (raw.full_name != null && typeof raw.full_name !== "string") {
      return { ok: false, error: "invalid_input" };
    }
    patch.full_name = raw.full_name == null ? null : String(raw.full_name);
  }
  if ("phone" in raw) {
    if (raw.phone != null && typeof raw.phone !== "string") {
      return { ok: false, error: "invalid_input" };
    }
    patch.phone = raw.phone == null ? null : String(raw.phone);
  }
  if ("avatar_url" in raw) {
    if (raw.avatar_url != null && typeof raw.avatar_url !== "string") {
      return { ok: false, error: "invalid_input" };
    }
    patch.avatar_url = raw.avatar_url == null ? null : String(raw.avatar_url);
  }

  return { ok: true, patch };
}

export function isPrivilegedProfileRole(role: string | null | undefined): boolean {
  const r = String(role || "").trim().toLowerCase();
  return r === "admin" || r === "superadmin" || r === "staff";
}

/** Admin may change others' roles only — never their own. */
export function canAdminChangeUserRole(actorUserId: string, targetUserId: string): boolean {
  const actor = String(actorUserId || "").trim();
  const target = String(targetUserId || "").trim();
  if (!actor || !target) return false;
  return actor !== target;
}
