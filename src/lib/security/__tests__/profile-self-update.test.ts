import { describe, expect, it } from "vitest";
import {
  canAdminChangeUserRole,
  isPrivilegedProfileRole,
  sanitizeProfileSelfUpdate,
} from "@/lib/security/profile-self-update";

describe("sanitizeProfileSelfUpdate", () => {
  it("allows name/phone only", () => {
    const r = sanitizeProfileSelfUpdate({ full_name: "Ali", phone: "09120000000" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.patch).toEqual({ full_name: "Ali", phone: "09120000000" });
    }
  });

  it("rejects role escalation fields", () => {
    expect(sanitizeProfileSelfUpdate({ role: "admin" }).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate({ full_name: "x", role: "admin" }).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate({ Role: "admin" }).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate({ is_active: true }).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate({ is_admin: true }).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate({ permissions: ["*"] }).ok).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(sanitizeProfileSelfUpdate(null).ok).toBe(false);
    expect(sanitizeProfileSelfUpdate("admin").ok).toBe(false);
  });
});

describe("isPrivilegedProfileRole", () => {
  it("detects admin/staff/superadmin", () => {
    expect(isPrivilegedProfileRole("admin")).toBe(true);
    expect(isPrivilegedProfileRole("superadmin")).toBe(true);
    expect(isPrivilegedProfileRole("staff")).toBe(true);
    expect(isPrivilegedProfileRole("customer")).toBe(false);
  });
});

describe("canAdminChangeUserRole", () => {
  it("forbids changing own role", () => {
    expect(canAdminChangeUserRole("u1", "u1")).toBe(false);
    expect(canAdminChangeUserRole("", "u2")).toBe(false);
  });
  it("allows changing another user", () => {
    expect(canAdminChangeUserRole("admin1", "user2")).toBe(true);
  });
});
