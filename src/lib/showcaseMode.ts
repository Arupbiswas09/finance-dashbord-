/**
 * Client demo / showcase: no login, mock dashboard data, only `ShowcaseRoutes` in `App`.
 * Local: set `NEXT_PUBLIC_SHOWCASE_MODE=true` in `.env.local`.
 * Vercel: defaults to true via `next.config.ts` when `VERCEL=1` (unless explicitly disabled).
 */
export function isShowcaseMode(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  const v = (process.env.NEXT_PUBLIC_SHOWCASE_MODE || "").trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  return v === "1" || v === "true" || v === "yes";
}
