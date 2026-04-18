/**
 * Client demo / showcase build: no login, no API, mock dashboard data.
 * Set in `.env.local`: NEXT_PUBLIC_SHOWCASE_MODE=true
 */
export function isShowcaseMode(): boolean {
  if (typeof process === "undefined" || !process.env) return false;
  const v = process.env.NEXT_PUBLIC_SHOWCASE_MODE;
  return v === "1" || v === "true" || v === "yes";
}
