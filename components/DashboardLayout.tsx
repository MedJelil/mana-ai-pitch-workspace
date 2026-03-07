"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, BarChart3, Package, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth/auth-client";
import { fetchPitches, pitchesQueryKey } from "@/lib/api/pitches";

function usePitchStats() {
  const { data: pitches = [], isLoading } = useQuery({
    queryKey: pitchesQueryKey,
    queryFn: fetchPitches,
  });
  const total = pitches.length;
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const thisWeek = pitches.filter((p) => new Date(p.createdAt) >= startOfWeek).length;
  return { total, thisWeek, isLoading };
}

const navItems = [
  { label: "Generate Pitch", path: "/", icon: FileText },
  { label: "Products", path: "/products", icon: Package },
  { label: "Pitch History", path: "/history", icon: BarChart3 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { total: pitchCount, thisWeek: pitchCountThisWeek, isLoading: pitchesLoading } = usePitchStats();

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await authClient.signOut();
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 overflow-y-auto bg-sidebar text-sidebar-foreground p-6 gap-8">
        <Link href="/" className="flex flex-col gap-1.5 items-start">
          <Image
            src="/logo.svg"
            alt="Mana AI"
            width={140}
            height={42}
            className="h-9 w-auto object-contain object-left"
            priority
          />
          <p className="text-xs opacity-60 leading-none">Pitch Workspace</p>
        </Link>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="card-light bg-sidebar-accent text-sidebar-foreground border-sidebar-border">
            <p className="text-xs opacity-70 mb-1">Pitches generated</p>
            <p className="font-display text-2xl font-bold">
              {pitchesLoading ? "—" : pitchCount}
            </p>
            <p className="text-xs text-secondary mt-1">
              {pitchesLoading ? "—" : `${pitchCountThisWeek} this week`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <LogOut className="w-4 h-4" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden h-14 shrink-0 flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.svg"
            alt="Mana AI"
            width={120}
            height={36}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {mobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-sidebar text-sidebar-foreground overflow-hidden"
          >
            <nav className="flex flex-col gap-1 px-4 pb-4">
              {navItems.map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              <div className="card-light bg-sidebar-accent text-sidebar-foreground border-sidebar-border px-4 py-3 my-2">
                <p className="text-xs opacity-70 mb-1">Pitches generated</p>
                <p className="font-display text-2xl font-bold">
                  {pitchesLoading ? "—" : pitchCount}
                </p>
                <p className="text-xs text-secondary mt-1">
                  {pitchesLoading ? "—" : `${pitchCountThisWeek} this week`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                disabled={isSigningOut}
                className="justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/50 mt-2"
              >
                <LogOut className="w-4 h-4" />
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
