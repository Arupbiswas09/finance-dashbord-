import { Link } from "react-router-dom";
import { LayoutGrid, Sparkles, Palette, Layers, PenLine, Box } from "lucide-react";

const themes: { to: string; title: string; subtitle: string; icon: typeof LayoutGrid }[] = [
  { to: "/dashboard-modern", title: "Theme 1 — Modern", subtitle: "Command center layout", icon: LayoutGrid },
  { to: "/analytics-modern", title: "Theme 2 — Analytics", subtitle: "Throughput and activity", icon: Sparkles },
  { to: "/dashboard-guidance", title: "Theme 3 — Guidance", subtitle: "Readiness and next steps", icon: Palette },
  { to: "/dashboard-precision", title: "Precision", subtitle: "Dense metrics rail", icon: Layers },
  { to: "/dashboard-editorial", title: "Editorial", subtitle: "Editorial typography", icon: PenLine },
  { to: "/dashboard-canvas", title: "Canvas", subtitle: "Canvas-style shell", icon: Box },
];

export default function ShowcaseHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Demo</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          SmartAccount — UI showcase
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Mock data only. No login and no backend. Open any theme below; use the pill bar on each screen to switch
          between Theme 1–3 where available.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {themes.map(({ to, title, subtitle, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{title}</span>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                  </div>
                </div>
                <span className="mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-600">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
