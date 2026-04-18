"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Mail,
  Sparkles,
  Shield,
  Zap,
  Globe2,
  Users,
  FileText,
  Share2,
  Database,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

/* —— 3-color system: ink · mist · signal (EU minimal / Apple-adjacent) —— */
const ink = "#07080b";
const mist = "#f5f5f7";
const mistMuted = "#86868b";
const signal = "#0077ed";

const springSoft = { type: "spring" as const, stiffness: 120, damping: 22 };
const easeOut = [0.22, 1, 0.36, 1] as const;

function useMouseParallax(intensity = 14) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 64, damping: 18 });
  const springY = useSpring(y, { stiffness: 64, damping: 18 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      x.set(px * intensity);
      y.set(py * intensity);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y, intensity]);

  return { ref, springX, springY };
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 * i, duration: 0.7, ease: easeOut },
  }),
};

const bento = [
  {
    title: "Financial reports",
    desc: "Quarter-close narratives, KPIs, and partner-ready PDFs from Yuki data.",
    icon: BarChart3,
    span: "md:col-span-2",
  },
  {
    title: "Yuki-native",
    desc: "Sync administrations and keep numbers trustworthy.",
    icon: Zap,
    span: "md:col-span-1",
  },
  {
    title: "Newsletters",
    desc: "Editor, themes, lists—client updates without leaving the workspace.",
    icon: Mail,
    span: "md:col-span-1",
  },
  {
    title: "SmartAccount AI",
    desc: "Contextual assistance for drafting, summarising, and iterating.",
    icon: Sparkles,
    span: "md:col-span-1",
  },
  {
    title: "Knowledge base",
    desc: "Documents, ingestion, and answers grounded in your firm’s files.",
    icon: Database,
    span: "md:col-span-2",
  },
  {
    title: "Shared reports",
    desc: "Controlled links, review flows, and clear audit of what was sent.",
    icon: Share2,
    span: "md:col-span-1",
  },
  {
    title: "RBAC & orgs",
    desc: "Roles, tenants, and permissions built for firms, not solo users.",
    icon: Shield,
    span: "md:col-span-1",
  },
  {
    title: "Clients & teams",
    desc: "One place for mandates, contacts, and delivery history.",
    icon: Users,
    span: "md:col-span-1",
  },
  {
    title: "Automation",
    desc: "Scheduled jobs and integrations—less manual chasing.",
    icon: Clock,
    span: "md:col-span-1",
  },
  {
    title: "Compliance-minded",
    desc: "Designed for EU practices: clarity, control, and sober UX.",
    icon: Globe2,
    span: "md:col-span-2",
  },
];

const steps = [
  { n: "01", t: "Connect", d: "Link Yuki and firm settings." },
  { n: "02", t: "Consolidate", d: "Clients, periods, and health in one view." },
  { n: "03", t: "Analyse", d: "AI-assisted insight with human oversight." },
  { n: "04", t: "Deliver", d: "Reports, newsletters, and secure sharing." },
];

export default function PremiumLanding() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.35]);
  const lineProgress = useTransform(scrollYProgress, [0.15, 0.45], [0, 1]);

  const { ref: parallaxRef, springX, springY } = useMouseParallax(18);
  const orb2X = useTransform(springX, (v) => -v * 0.75);
  const orb2Y = useTransform(springY, (v) => -v * 0.55);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="min-h-screen text-[var(--mist)] antialiased selection:bg-[color-mix(in_srgb,var(--signal)_35%,transparent)]"
      style={
        {
          ["--ink" as string]: ink,
          ["--mist" as string]: mist,
          ["--mist-muted" as string]: mistMuted,
          ["--signal" as string]: signal,
          backgroundColor: ink,
        } as React.CSSProperties
    }
    >
      {/* Ambient layers */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-[20%] top-[-10%] h-[70vmin] w-[70vmin] rounded-full opacity-[0.14]"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${signal}, transparent 55%)`,
            x: reduce ? 0 : springX,
            y: reduce ? 0 : springY,
          }}
        />
        <motion.div
          className="absolute -right-[15%] bottom-[5%] h-[55vmin] w-[55vmin] rounded-full opacity-[0.1]"
          style={{
            background: `radial-gradient(circle at 70% 70%, ${mist}, transparent 50%)`,
            x: reduce ? 0 : orb2X,
            y: reduce ? 0 : orb2Y,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[color-mix(in_srgb,var(--ink)_72%,transparent)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
              <FileText className="h-4 w-4 text-[var(--mist)]" />
            </span>
            SmartAccount
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {["Workflow", "Platform", "Yuki", "EU"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="text-[13px] text-[var(--mist-muted)] transition-colors hover:text-[var(--mist)]"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="hidden rounded-full text-[var(--mist-muted)] hover:bg-white/[0.06] hover:text-[var(--mist)] sm:inline-flex"
              asChild
            >
              <Link to="/login">Sign in</Link>
            </Button>
            <Button
              className="rounded-full border-0 bg-[var(--signal)] px-5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)] hover:bg-[color-mix(in_srgb,var(--signal)_88%,white)]"
              asChild
            >
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} id="workflow" className="relative px-5 pb-24 pt-16 md:px-8 md:pt-20">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="mx-auto max-w-6xl">
          <div ref={parallaxRef} className="relative grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--mist-muted)] backdrop-blur-md"
              >
                Practice software · Benelux-ready
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.05, ease: easeOut }}
                className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--mist)]"
              >
                Close the month.
                <br />
                <span className="text-[var(--mist-muted)]">Deliver the story.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--mist-muted)]"
              >
                One calm workspace for Yuki-backed reporting, client comms, and AI-assisted
                drafting—built for firms that care about precision, not noise.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-[var(--signal)] px-7 text-base font-medium text-white hover:bg-[color-mix(in_srgb,var(--signal)_90%,white)]"
                  asChild
                >
                  <Link to="/register">
                    Start free trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/[0.03] text-[var(--mist)] backdrop-blur-sm hover:bg-white/[0.08]"
                  asChild
                >
                  <Link to="/login">Book a demo</Link>
                </Button>
              </motion.div>
            </div>

            {/* Glass product stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: easeOut }}
              className="relative [perspective:1200px]"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-white/[0.12] via-transparent to-[var(--signal)]/20 opacity-50 blur-2xl" />
              <motion.div
                initial={{ rotateX: 6 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
                whileHover={
                  reduce
                    ? {}
                    : {
                        rotateX: -3,
                        rotateY: 4,
                        scale: 1.01,
                        transition: { type: "spring", stiffness: 280, damping: 24 },
                      }
                }
                style={{ transformStyle: "preserve-3d" }}
                className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[color-mix(in_srgb,var(--ink)_45%,transparent)] p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div className="flex gap-2">
                    {["bg-red-400/80", "bg-amber-400/80", "bg-emerald-400/80"].map((c, i) => (
                      <span key={i} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                    ))}
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--mist-muted)]">
                    Live preview
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Reports", val: "Q4 pack", sub: "Ready for review" },
                    { label: "Yuki", val: "Synced", sub: "2m ago" },
                    { label: "Newsletter", val: "Draft", sub: "Client segment A" },
                    { label: "Health", val: "Operational", sub: "All checks green" },
                  ].map((cell, i) => (
                    <motion.div
                      key={cell.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, ...springSoft }}
                      whileHover={reduce ? {} : { scale: 1.02, y: -2 }}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-sm"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--mist-muted)]">
                        {cell.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[var(--mist)]">{cell.val}</p>
                      <p className="text-xs text-[var(--mist-muted)]">{cell.sub}</p>
                    </motion.div>
                  ))}
                </div>
                {/* Animated signal line */}
                <motion.div
                  className="mt-5 h-px w-full origin-left bg-gradient-to-r from-transparent via-[var(--signal)] to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: easeOut }}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll progress ribbon */}
        <motion.div
          className="mx-auto mt-16 h-px max-w-6xl bg-white/[0.06]"
          style={{ scaleX: lineProgress, transformOrigin: "0% 50%" }}
        />
      </section>

      {/* Steps */}
      <section className="relative px-5 py-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="text-center text-sm font-medium uppercase tracking-[0.25em] text-[var(--mist-muted)]"
          >
            Workflow
          </motion.h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
              >
                <span className="text-[11px] font-mono text-[var(--signal)]">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold text-[var(--mist)]">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--mist-muted)]">{s.d}</p>
                <ChevronRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--mist-muted)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento — platform */}
      <section id="platform" className="relative px-5 py-24 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--mist)] md:text-4xl">
              Everything the practice needs.
            </h2>
            <p className="mt-4 text-[var(--mist-muted)]">
              One surface—so you are not stitching Karbon-style workflow, Fathom-style reporting, and
              Mailchimp-style comms by hand.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {bento.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-30px" }}
                variants={fadeUp}
                whileHover={reduce ? {} : { y: -4 }}
                transition={springSoft}
                className={`${item.span} rounded-2xl border border-white/[0.09] bg-[color-mix(in_srgb,var(--ink)_40%,transparent)] p-6 backdrop-blur-xl`}
              >
                <item.icon className="h-5 w-5 text-[var(--signal)]" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold text-[var(--mist)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--mist-muted)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Yuki */}
      <section id="yuki" className="relative px-5 py-24 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: easeOut }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--mist)] md:text-4xl">
              Built around Yuki.
            </h2>
            <p className="mt-4 text-lg text-[var(--mist-muted)]">
              Pull the ledger reality you already trust—then layer reporting, AI, and client
              delivery on top with guardrails your partners can stand behind.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-[var(--mist-muted)]">
              {[
                "SOAP-backed integration patterns used in production paths",
                "Org-scoped data and role-aware surfaces",
                "Exports and narratives suitable for client-facing delivery",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--signal)]" />
                  {t}
                </li>
              ))}
            </ul>
            <Button className="mt-8 rounded-full bg-white/[0.08] text-[var(--mist)] hover:bg-white/[0.12]" asChild>
              <Link to="/integration">
                Integration overview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="relative flex min-h-[320px] items-center justify-center"
          >
            <AnimatePresence>
              {mounted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative h-64 w-64 rounded-full border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent shadow-[0_0_120px_-20px_var(--signal)] backdrop-blur-xl"
                >
                  <motion.div
                    className="absolute inset-8 rounded-full border border-[var(--signal)]/30"
                    animate={reduce ? {} : { rotate: 360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-center text-sm font-semibold text-[var(--mist)]">
                      Yuki
                      <br />
                      <span className="text-xs font-normal text-[var(--mist-muted)]">administration sync</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* EU */}
      <section id="eu" className="relative px-5 py-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl rounded-[1.75rem] border border-white/[0.1] bg-white/[0.04] p-10 backdrop-blur-2xl md:p-14"
        >
          <h2 className="text-2xl font-semibold text-[var(--mist)] md:text-3xl">
            Sober UX for European firms.
          </h2>
          <p className="mt-4 max-w-3xl text-[var(--mist-muted)]">
            Minimal chrome, high legibility, and a product tone that fits Amsterdam, Brussels, or
            Berlin—without cartoon gradients or “AI slop” layouts. Your positioning should match
            your subprocessors and DPA reality; the interface should never oversell compliance.
          </p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-5 py-28 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--mist)] md:text-4xl">
            Ready when you are.
          </h2>
          <p className="mt-4 text-[var(--mist-muted)]">
            Bring your firm onboard—or explore the product with a trial workspace.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-full bg-[var(--signal)] px-8 text-white hover:opacity-95" asChild>
              <Link to="/register">Create account</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-transparent text-[var(--mist)]" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-12 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 text-center text-sm text-[var(--mist-muted)] md:flex-row md:text-left">
          <p>© {new Date().getFullYear()} SmartAccount. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/login" className="hover:text-[var(--mist)]">
              Login
            </Link>
            <a href="#platform" className="hover:text-[var(--mist)]">
              Platform
            </a>
            <Link to="/register" className="hover:text-[var(--mist)]">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
