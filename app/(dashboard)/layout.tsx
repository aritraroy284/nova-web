"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Key, 
  Cpu, 
  BookOpen, 
  Menu, 
  X, 
  LogOut,
  ShieldCheck
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

const navItems = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard },
  { name: "API & Models", href: "/api-models", icon: Key },
  { name: "Plugins", href: "/plugins", icon: Cpu },
  { name: "Nova Guide", href: "/guide", icon: BookOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("nova_theme");
      if (saved === "light" || saved === "dark") setThemeMode(saved);
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      if (supabase?.auth) {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
          if (user?.email) setUserEmail(user.email);
        });
      }
    } catch (e) {}
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    try { localStorage.setItem("nova_theme", next); } catch (e) {}
  };

  const handleLogout = async () => {
    try {
      if (supabase?.auth) await supabase.auth.signOut();
      if (typeof window !== "undefined") window.location.href = "/";
    } catch (e) {}
  };

  const BrandElement = (
    <Link href="/" className="flex items-center gap-3 cursor-pointer select-none hover:opacity-90 transition-opacity" title="Return to Launch Page">
      <img src="/logo.png" alt="Nova AI" className="w-8 h-8 rounded-lg object-contain drop-shadow-[0_0_12px_rgba(0,229,255,0.45)]" />
      <div className="flex flex-col text-left">
        <span className="font-bold tracking-wider text-sm font-mono leading-tight">NOVA AI</span>
        <span className="text-[10px] font-mono tracking-widest text-[#00E5FF] font-semibold uppercase leading-tight">CORE ONLINE</span>
      </div>
    </Link>
  );

  const ThemeToggleElement = (
    <div className="pt-2.5 mt-2 border-t border-[#142334] flex items-center justify-between px-2 select-none">
      <span className="text-[10px] font-mono tracking-wider font-semibold uppercase theme-label text-cyan-400">
        {themeMode === "light" ? "LIGHT THEME" : "DARK THEME"}
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        className="nova-switch-bar relative w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer touch-manipulation focus:outline-none"
        title="Toggle Light / Dark Mode"
        aria-label="Toggle Theme"
      >
        <div className="nova-switch-dot w-3.5 h-3.5 rounded-full transition-transform duration-200" />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#00E5FF]/20 ${themeMode === "light" ? "dashboard-light" : "dashboard-dark"}`}>
      
      {/* MOBILE STICKY TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 h-14 w-full border-b border-[#142334] px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0D1A29] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>
          {BrandElement}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider text-[#00F5A0] bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#00F5A0]" />
            DEV ACTIVE
          </span>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#060B11] border-r border-[#142334] p-4 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#142334] mb-4">
                {BrandElement}
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={isActive}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                        isActive
                          ? "bg-[#0B2538] border border-cyan-500/50 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "text-[#8CA4B5] hover:text-white hover:bg-[#0D1A29]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#142334] space-y-3">
              <div className="p-2.5 rounded-xl user-account-box flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-mono font-medium truncate text-white">
                    {userEmail || "roy•••@gmail.com"}
                  </p>
                  <p className="text-[10px] font-mono text-[#00F5A0]">Authenticated</p>
                </div>
                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] shadow-[0_0_6px_#00F5A0]"></span>
                <span className="text-[10px] font-mono text-slate-400 tracking-wider">CORE ONLINE</span>
              </div>

              {ThemeToggleElement}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-[#142334] h-screen sticky top-0 p-4 z-30 shrink-0">
        <div>
          <div className="mb-6 px-1">
            {BrandElement}
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                    isActive
                      ? "bg-[#0B2538] border border-cyan-500/50 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      : "text-[#8CA4B5] hover:text-white hover:bg-[#0D1A29]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#142334] space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider text-[#00F5A0] bg-[#00F5A0]/10 border border-[#00F5A0]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#00F5A0]" />
              DEV ACTIVE
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">CLOUD</span>
          </div>

          <div className="p-2.5 rounded-xl user-account-box flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-mono font-medium truncate text-white">
                {userEmail || "roy•••@gmail.com"}
              </p>
              <p className="text-[10px] font-mono text-[#00F5A0]">Authenticated</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Sign Out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] shadow-[0_0_6px_#00F5A0]"></span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider">CORE ONLINE</span>
          </div>

          {ThemeToggleElement}
        </div>
      </aside>

      {/* MAIN CONTENT WITH PAGE TRANSITION */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div key={pathname} className="page-transition-enter w-full p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
