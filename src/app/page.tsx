import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 sm:top-4 z-50 w-full px-4 pt-2 sm:pt-0">
        <nav className="mx-auto w-full max-w-5xl flex items-center justify-between rounded-full border border-neutral-200/80 bg-white/90 px-5 py-2.5 sm:px-6 sm:py-3 shadow-xs backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs">
              WS
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">
              WorkSphere
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-neutral-500">
            <a href="#features" className="hover:text-neutral-900 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-neutral-900 transition-colors">Solutions</a>
            <a href="#integrations" className="hover:text-neutral-900 transition-colors">Integrations</a>
            <a href="#docs" className="hover:text-neutral-900 transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-neutral-700 hover:text-neutral-900 font-medium text-xs">
                Log in
              </Button>
            </Link>
            <Link href="/signUp">
              <Button size="sm" className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-4 text-xs font-medium">
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="w-full pt-16 pb-16 md:pt-24 md:pb-20 px-4">
        <div className="w-full max-w-4xl mx-auto text-center">
          {/* Subtle Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1 text-xs font-medium text-neutral-600 mb-6 shadow-2xs">
            <span className="flex size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            WorkSphere 2.0 is live
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900 max-w-3xl mx-auto leading-[1.12]">
            Effortless custom project management by WorkSphere
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base md:text-lg text-neutral-500 max-w-xl mx-auto font-normal leading-relaxed">
            Streamline your workspace, projects, tasks, and GitHub repositories with seamless automation, tailored for modern builders.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signUp">
              <Button size="lg" className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3 text-sm font-medium shadow-sm transition-all hover:scale-[1.01]">
                Start for free
              </Button>
            </Link>
            <Link href="/workspaces">
              <Button variant="outline" size="lg" className="rounded-full border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 px-6 py-3 text-sm font-medium">
                View Workspaces
              </Button>
            </Link>
          </div>

          {/* Mockup Preview Window */}
          <div className="mt-12 w-full rounded-2xl border border-neutral-200/80 bg-white p-2.5 sm:p-3 shadow-xl overflow-hidden text-left">
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 sm:p-6 md:p-8">
              {/* Window bar */}
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-neutral-300" />
                  <span className="size-3 rounded-full bg-neutral-300" />
                  <span className="size-3 rounded-full bg-neutral-300" />
                  <span className="ml-2 text-xs font-mono text-neutral-400 hidden sm:inline">worksphere.app / workspace / personal</span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                  Live Sync
                </span>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border border-neutral-200/70 bg-white p-4">
                  <div className="text-[11px] font-medium text-neutral-400 mb-1">Active Projects</div>
                  <div className="text-xl font-semibold text-neutral-900">12 Projects</div>
                  <div className="mt-2 text-xs text-emerald-600 font-medium">↑ 18% this month</div>
                </div>
                <div className="rounded-lg border border-neutral-200/70 bg-white p-4">
                  <div className="text-[11px] font-medium text-neutral-400 mb-1">Tasks Completed</div>
                  <div className="text-xl font-semibold text-neutral-900">148 Tasks</div>
                  <div className="mt-2 text-xs text-neutral-500">94% completion rate</div>
                </div>
                <div className="rounded-lg border border-neutral-200/70 bg-white p-4">
                  <div className="text-[11px] font-medium text-neutral-400 mb-1">GitHub Sync</div>
                  <div className="text-xl font-semibold text-neutral-900">4 Repositories</div>
                  <div className="mt-2 text-xs text-emerald-600 font-medium">Connected</div>
                </div>
              </div>

              {/* Recent Activity List */}
              <div className="mt-3 rounded-lg border border-neutral-200/70 bg-white p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Recent Activity</span>
                  <span className="text-[11px] text-neutral-400">Updated 2m ago</span>
                </div>
                <div className="space-y-2">
                  {[
                    { title: "Implement Auth Flow & OAuth Redirects", tag: "Completed", tagBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { title: "Configure TanStack Query Caching & Axios Interceptors", tag: "In Progress", tagBg: "bg-amber-50 text-amber-700 border-amber-200" },
                    { title: "Personal Workspace Dashboard & Project Metrics", tag: "Planning", tagBg: "bg-neutral-100 text-neutral-600 border-neutral-200" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-md bg-neutral-50/70 border border-neutral-100 text-xs">
                      <span className="font-medium text-neutral-800 truncate pr-2">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-medium shrink-0 ${item.tagBg}`}>{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento Grid Section ──────────────────────────────────────────────── */}
      <section id="features" className="w-full py-20 px-4 border-t border-neutral-200/60">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 mb-3">
              Built for absolute clarity
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Confidence backed by results
            </h2>
            <p className="mt-3 text-neutral-500 text-sm">
              Our tools are simple, powerful, and designed for focused work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-2xs hover:border-neutral-300 transition-all">
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-5 text-neutral-900">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Plan your schedules</h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Streamline project timelines and tasks with automated scheduling and priority tools.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-2xs hover:border-neutral-300 transition-all">
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-5 text-neutral-900">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Analytics & insights</h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Transform your project metrics into actionable insights with real-time dashboard analytics.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-7 shadow-2xs hover:border-neutral-300 transition-all">
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-5 text-neutral-900">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">Collaborate seamlessly</h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Keep your team aligned with shared workspaces, activity feeds, and collaborative vaults.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Integrations Section ────────────────────────────────────────────── */}
      <section id="integrations" className="w-full py-20 px-4 border-t border-neutral-200/60">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 mb-4">
              Effortless Integration
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-4">
              All your favorite tools in one place
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">
              Connect your GitHub repositories, Cloudinary storage, and personal developer vault to work together seamlessly by design.
            </p>
            <div className="space-y-3">
              {[
                "Direct GitHub OAuth & automatic commit sync",
                "Cloudinary asset storage & file attachment vault",
                "Personal developer vault with strict security"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-neutral-700 font-medium">
                  <div className="flex size-4 items-center justify-center rounded-full bg-neutral-900 text-white text-[10px]">✓</div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-8 flex items-center justify-center shadow-2xs">
            <div className="relative size-60 sm:size-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-dashed border-neutral-200 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-8 rounded-full border border-neutral-100" />
              <div className="z-10 size-16 rounded-2xl bg-neutral-900 text-white font-bold text-xl flex items-center justify-center shadow-md">
                WS
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-xs font-bold">
                GH
              </div>
              <div className="absolute top-1/2 -right-3 -translate-y-1/2 size-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-xs font-bold">
                CL
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-xs font-bold">
                VT
              </div>
              <div className="absolute top-1/2 -left-3 -translate-y-1/2 size-9 rounded-full bg-white border border-neutral-200 shadow-2xs flex items-center justify-center text-xs font-bold">
                API
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Section ──────────────────────────────────────────────── */}
      <section className="w-full py-24 px-4 bg-white border-t border-neutral-200/80 mt-auto">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-900 leading-tight">
            Ready to transform your business?
          </h2>
          <p className="mt-4 text-neutral-500 text-base max-w-md mx-auto">
            Join thousands of developers streamlining their operations, managing projects, and growing with data-driven insights.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/signUp">
              <Button size="lg" className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white px-8 py-3.5 text-sm font-medium shadow-sm transition-all hover:scale-[1.01]">
                Start for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer id="docs" className="w-full border-t border-neutral-200/60 bg-[#FAFAFA] py-16 px-4">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-6 items-center justify-center rounded bg-neutral-900 text-white font-bold text-[10px]">
                WS
              </div>
              <span className="font-semibold text-sm text-neutral-900">WorkSphere</span>
            </div>
            <p className="text-neutral-500 mb-4">Coding & workspace management made effortless.</p>
            <div className="flex gap-3 text-neutral-400">
              <span className="hover:text-neutral-900 cursor-pointer">Twitter / X</span>
              <span className="hover:text-neutral-900 cursor-pointer">LinkedIn</span>
              <span className="hover:text-neutral-900 cursor-pointer">GitHub</span>
            </div>
          </div>

          <div>
            <div className="font-medium text-neutral-900 mb-3">Product</div>
            <ul className="space-y-2 text-neutral-500">
              <li className="hover:text-neutral-900 cursor-pointer">Features</li>
              <li className="hover:text-neutral-900 cursor-pointer">Workspaces</li>
              <li className="hover:text-neutral-900 cursor-pointer">GitHub Sync</li>
              <li className="hover:text-neutral-900 cursor-pointer">Personal Vault</li>
            </ul>
          </div>

          <div>
            <div className="font-medium text-neutral-900 mb-3">Company</div>
            <ul className="space-y-2 text-neutral-500">
              <li className="hover:text-neutral-900 cursor-pointer">About us</li>
              <li className="hover:text-neutral-900 cursor-pointer">Our team</li>
              <li className="hover:text-neutral-900 cursor-pointer">Careers</li>
              <li className="hover:text-neutral-900 cursor-pointer">Brand</li>
            </ul>
          </div>

          <div>
            <div className="font-medium text-neutral-900 mb-3">Resources</div>
            <ul className="space-y-2 text-neutral-500">
              <li className="hover:text-neutral-900 cursor-pointer">Terms of use</li>
              <li className="hover:text-neutral-900 cursor-pointer">API Reference</li>
              <li className="hover:text-neutral-900 cursor-pointer">Documentation</li>
              <li className="hover:text-neutral-900 cursor-pointer">Support</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
