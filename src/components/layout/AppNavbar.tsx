"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/auth/useLogout";
import { Button } from "@/components/ui/Button";

export function AppNavbar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const logout = useLogout();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Tasks", href: "/tasks" },
    { label: "Vault", href: "/vault" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Workspace Switcher */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 text-white font-bold text-xs">
              WS
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900">
              WorkSphere
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 border-l border-neutral-200 pl-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Personal Workspace
            </span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-100 text-neutral-900 font-semibold"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          <Link href="/workspaces">
            <Button variant="outline" size="sm" className="text-xs text-neutral-600 font-medium">
              Switch
            </Button>
          </Link>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 border-l border-neutral-200 pl-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="hidden lg:inline-block text-xs font-medium text-neutral-700 truncate max-w-[120px]">
              {user?.name || user?.email || "User"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout.mutate()}
              isLoading={logout.isPending}
              className="text-xs text-neutral-500 hover:text-red-600 font-medium ml-1"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
