import type { NextConfig } from "next";

/**
 * Vercel (`VERCEL=1` during `next build`): default to **showcase** — only the three theme
 * dashboards (see `ShowcaseRoutes.tsx`). No marketing `/` or auth routes in the initial bundle.
 *
 * To deploy the **full** app on Vercel, set project env: `NEXT_PUBLIC_SHOWCASE_MODE=false`
 *
 * Vercel project **Root Directory** must be `frontend-next` (this folder).
 */
function resolvedShowcaseMode(): string {
  const raw = process.env.NEXT_PUBLIC_SHOWCASE_MODE;
  const explicit =
    raw === undefined || raw === null ? "" : String(raw).trim().toLowerCase();

  if (explicit === "false" || explicit === "0" || explicit === "no") {
    return "false";
  }
  if (explicit === "true" || explicit === "1" || explicit === "yes") {
    return "true";
  }

  if (process.env.VERCEL === "1") {
    return "true";
  }

  return "";
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SHOWCASE_MODE: resolvedShowcaseMode(),
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
