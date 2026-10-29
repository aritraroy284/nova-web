"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Key, 
  Cpu, 
  BookOpen, 
  Menu, 
  X, 
  LogOut,
  ShieldCheck,
  ShieldAlert,
  LogIn
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
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("nova_theme");
      if (savedTheme === "light" || savedTheme === "dark") setThemeMode(savedTheme);

      const savedDev = localStorage.getItem("nova_dev_mode");
      if (savedDev === "true") {
        setIsDevMode(true);
        setUserEmail("dev.roy@nova.internal");
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      if (supabase?.auth && !isDevMode) {
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
          if (user?.email) {
            setUserEmail(user.email);
          }
        });
      }
    } catch (e) {}
  }, [isDevMode]);

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    try { localStorage.setItem("nova_theme", next); } catch (e) {}
  };

  const toggleDevMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isDevMode;
    setIsDevMode(nextState);
    if (nextState) {
      setUserEmail("dev.roy@nova.internal");
      try { localStorage.setItem("nova_dev_mode", "true"); } catch (e) {}
    } else {
      setUserEmail(null);
      try { localStorage.removeItem("nova_dev_mode"); } catch (e) {}
    }
  };

  const handleLogout = async () => {
    try {
      setIsDevMode(false);
      setUserEmail(null);
      try {
        localStorage.removeItem("nova_dev_mode");
      } catch (e) {}
      if (supabase?.auth) {
        await supabase.auth.signOut();
      }
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch (e) {
      if (typeof window !== "undefined") window.location.href = "/";
    }
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
    <div className="pt-3 mt-1 border-t border-[#142334] flex items-center justify-between px-2 select-none">
      <span className="text-xs font-mono tracking-wider font-semibold uppercase theme-label text-cyan-400">
        {themeMode === "light" ? "LIGHT THEME" : "DARK THEME"}
      </span>
      <button
        type="button"
        onClick={toggleTheme}
        className="nova-switch-bar relative w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer touch-manipulation focus:outline-none"
        title="Toggle Light / Dark Mode"
        aria-label="Toggle Theme"
      >
        <div className="nova-switch-dot w-4 h-4 rounded-full transition-transform duration-200" />
      </button>
    </div>
  );

  const BottomAccountSection = (
    <div className="pt-3.5 border-t border-[#142334] space-y-3">
      {/* Dev Access Interactive Toggle Button */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={toggleDevMode}
          className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider transition-all flex items-center gap-2 cursor-pointer select-none focus:outline-none ${
            isDevMode 
              ? "text-[#00F5A0] bg-[#00F5A0]/15 border border-[#00F5A0]/50 shadow-[0_0_12px_rgba(0,245,160,0.3)]"
              : "text-slate-400 bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/40 hover:text-white"
          }`}
          title="Click to Toggle Local Dev Access Bypass"
        >
          {isDevMode ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F5A0]" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          )}
          {isDevMode ? "DEV ACTIVE" : "DEV INACTIVE"}
        </button>
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-medium">
          {isDevMode ? "LOCAL BYPASS" : "CLOUD"}
        </span>
      </div>

      {/* Dynamic User Account Card */}
      <div className="p-3 rounded-xl user-account-box flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-xs sm:text-sm font-mono font-medium truncate text-white">
            {userEmail ? userEmail : "Guest User"}
          </p>
          <p className={`text-xs font-mono mt-0.5 ${userEmail ? "text-[#00F5A0]" : "text-amber-400"}`}>
            {userEmail ? (isDevMode ? "Dev Authenticated" : "Authenticated") : "Not Signed In"}
          </p>
        </div>
        {userEmail ? (
          <button 
            type="button"
            onClick={handleLogout} 
            className="p-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" 
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <Link 
            href="/" 
            className="p-2 text-slate-400 hover:text-[#00E5FF] transition-colors"
            title="Go to Sign In"
          >
            <LogIn className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Core Online Status Indicator */}
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span className="w-2 h-2 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0]"></span>
        <span className="text-xs font-mono text-slate-300 tracking-wider">CORE ONLINE</span>
      </div>

      {/* Theme Switch Row */}
      {ThemeToggleElement}
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#00E5FF]/20 ${themeMode === "light" ? "dashboard-light" : "dashboard-dark"}`}>
      
      {/* MOBILE STICKY TOP BAR */}
      <header className="md:hidden sticky top-0 z-40 h-14 w-full border-b border-[#142334] px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0D1A29] transition-colors focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          {BrandElement}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleDevMode}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-semibold tracking-wider flex items-center gap-1.5 transition-all ${
              isDevMode 
                ? "text-[#00F5A0] bg-[#00F5A0]/15 border border-[#00F5A0]/40"
                : "text-slate-400 bg-slate-800/40 border border-slate-700/50"
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isDevMode ? "text-[#00F5A0]" : "text-slate-400"}`} />
            {isDevMode ? "DEV ACTIVE" : "DEV OFF"}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="animate-drawer-slide relative w-72 max-w-[82vw] h-[100dvh] bg-[#07101F] border-r border-[#142334] p-4 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#142334] mb-4">
                {BrandElement}
                <button 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#0D1A29]"
                >
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-active={isActive}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-sans font-medium tracking-wide transition-all ${
                        isActive
                          ? "bg-[#0B2538] border border-cyan-500/50 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "text-[#8CA4B5] hover:text-white hover:bg-[#0D1A29]"
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom */}
            {BottomAccountSection}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-[#142334] h-[100dvh] sticky top-0 p-4 z-30 shrink-0 overflow-hidden">
        <div>
          <div className="mb-7 px-1">
            {BrandElement}
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-sans font-medium tracking-wide transition-all ${
                    isActive
                      ? "bg-[#0B2538] border border-cyan-500/50 text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                      : "text-[#8CA4B5] hover:text-white hover:bg-[#0D1A29]"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom */}
        {BottomAccountSection}
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 h-[100dvh] overflow-y-auto">
        <div className="w-full p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
