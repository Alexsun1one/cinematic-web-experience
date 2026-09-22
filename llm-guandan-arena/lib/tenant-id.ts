export const DEFAULT_TENANT = "default";

export function normalizeTenant(raw: string | null | undefined): string {
  const cleaned = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 64);
  return cleaned || DEFAULT_TENANT;
}
