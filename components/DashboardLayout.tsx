"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, BarChart3, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Generate Pitch", path: "/", icon: FileText },
  { label: "Products", path: "/products", icon: Package },
  { label: "Pitch History", path: "/history", icon: BarChart3 },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar text-sidebar-foreground p-6 gap-8 min-h-screen">
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

        <div className="mt-auto card-light !bg-sidebar-accent !text-sidebar-foreground !border-sidebar-border">
          <p className="text-xs opacity-70 mb-1">Pitches generated</p>
          <p className="font-display text-2xl font-bold">147</p>
          <p className="text-xs text-secondary mt-1">↑ 12% this week</p>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
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
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
