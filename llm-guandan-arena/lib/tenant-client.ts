import { normalizeTenant } from "./tenant-id";

const TENANT_KEY = "guandan-tenant";

export function readLockedTenant(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TENANT_KEY);
  if (!raw) return null;
  return normalizeTenant(raw);
}

export function lockTenant(raw: string): string {
  const tenant = normalizeTenant(raw);
  localStorage.setItem(TENANT_KEY, tenant);
  return tenant;
}

export function unlockTenant() {
  localStorage.removeItem(TENANT_KEY);
}

export function tenantHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const tenant = readLockedTenant() || "default";
  return { "x-tenant-id": tenant, ...extra };
}

function readCodes(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string").map((item) => item.toUpperCase());
  } catch {
    return [];
  }
}

export function hostedCodes(tenant: string): string[] {
  return readCodes(`guandan-hosted:${normalizeTenant(tenant)}`);
}

export function rememberHosted(tenant: string, code: string) {
  const key = `guandan-hosted:${normalizeTenant(tenant)}`;
  const next = [code.toUpperCase(), ...hostedCodes(tenant).filter((item) => item !== code.toUpperCase())].slice(0, 24);
  localStorage.setItem(key, JSON.stringify(next));
}
