"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, KeyRound, Blocks, BookOpen, Sun, Moon } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "API & Models", href: "/api-models", icon: KeyRound },
    { name: "Plugins", href: "/plugins", icon: Blocks },
    { name: "Nova Guide", href: "/guide", icon: BookOpen },
  ];

  return (
    <div className={`min-h-screen flex ${darkMode ? "dark" : ""}`}>
      <aside className="hidden md:flex w-64 border-r border-atelier-border dark:border-nova-border bg-atelier-card dark:bg-nova-card flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-3 px-2 py-4 mb-6">
            <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 border border-nova-cyan/30 flex items-center justify-center font-mono font-bold text-nova-cyan">N</div>
            <div>
              <div className="font-mono font-bold text-sm">NOVA CORTEX</div>
              <div className="text-[10px] text-atelier-muted dark:text-nova-muted">CONTROL PLANE</div>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-nova-cyan/10 text-nova-cyan border border-nova-cyan/30" : "text-atelier-muted dark:text-nova-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="pt-4 border-t border-atelier-border dark:border-nova-border flex items-center justify-between">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg border border-atelier-border dark:border-nova-border text-xs flex items-center gap-2">
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="font-mono">{darkMode ? "Light" : "Dark"}</span>
          </button>
          <div className="text-[10px] font-mono text-emerald-400">● Online</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">{children}</main>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t px-3 py-2 flex items-center justify-around z-50">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-mono transition ${active ? "text-nova-cyan font-bold" : "text-atelier-muted dark:text-nova-muted"}`}>
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
