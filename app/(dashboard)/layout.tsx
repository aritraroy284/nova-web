"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  LayoutDashboard,
  KeyRound,
  Puzzle,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  LogOut,
  Menu,
  X,
  Cpu,
  ChevronRight,
  Terminal,
  UserCheck,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Developer Clearance State
  const [isDev, setIsDev] = useState<boolean>(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [devPasswordInput, setDevPasswordInput] = useState<string>("");
  const [devAuthLoading, setDevAuthLoading] = useState<boolean>(false);
  const [devErrorMsg, setDevErrorMsg] = useState<string>("");

  // Close mobile drawer automatically on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu or modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isDevModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isDevModalOpen]);

  // Initial Auth & Cloud Dev Status Sync
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        // Check local cache first for 0ms UI response
        const cachedDev = localStorage.getItem("nova_dev_active");
        if (cachedDev === "true" && isMounted) {
          setIsDev(true);
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        const activeEmail =
          user?.email || localStorage.getItem("nova_user_email") || "";
        const activeUid = user?.id || "";

        if (isMounted) {
          setUserEmail(activeEmail);
          setUserId(activeUid);
          if (activeEmail) {
            localStorage.setItem("nova_user_email", activeEmail);
          }
        }

        if (activeEmail || activeUid) {
          const res = await fetch("/api/vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "GET_DEV_STATUS",
              email: activeEmail,
              userId: activeUid,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const authorized = Boolean(data.developer || data.authorized);
            if (isMounted) {
              setIsDev(authorized);
              localStorage.setItem(
                "nova_dev_active",
                authorized ? "true" : "false"
              );
            }
          }
        }
      } catch (err) {
        console.error("Session sync error:", err);
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email);
        setUserId(session.user.id);
        localStorage.setItem("nova_user_email", session.user.email);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleVerifyDev = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devPasswordInput.trim()) {
      setDevErrorMsg("Security key cannot be empty.");
      return;
    }

    setDevAuthLoading(true);
    setDevErrorMsg("");

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_DEV",
          email: userEmail,
          userId: userId,
          devPassword: devPasswordInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && (data.authorized || data.developer)) {
        setIsDev(true);
        localStorage.setItem("nova_dev_active", "true");
        setDevPasswordInput("");
        setIsDevModalOpen(false);
      } else {
        setDevErrorMsg(
          data.error || "Access Denied: Invalid Architect Security Key."
        );
      }
    } catch (err: any) {
      setDevErrorMsg("Network error while verifying credentials.");
    } finally {
      setDevAuthLoading(false);
    }
  };

  const handleLockDev = async () => {
    setDevAuthLoading(true);
    try {
      await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOCK_DEV",
          email: userEmail,
          userId: userId,
        }),
      });
    } catch (err) {
      console.error("Failed to lock dev access:", err);
    } finally {
      setIsDev(false);
      localStorage.setItem("nova_dev_active", "false");
      setDevAuthLoading(false);
      setIsDevModalOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    localStorage.removeItem("nova_user_email");
    localStorage.removeItem("nova_dev_active");
    setIsDev(false);
    setUserEmail("");
    router.push("/");
  };

  const maskEmail = (email: string) => {
    if (!email) return "Guest Session";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    if (name.length <= 3) return `${name}***@${domain}`;
    return `${name.slice(0, 3)}•••${name.slice(-1)}@${domain}`;
  };

  const navItems = [
    {
      name: "Overview",
      href: "/overview",
      icon: LayoutDashboard,
      desc: "System telemetry & status",
    },
    {
      name: "API & Models",
      href: "/api-models",
      icon: KeyRound,
      desc: "Cloud vault & routing",
    },
    {
      name: "Plugins",
      href: "/plugins",
      icon: Puzzle,
      desc: "Workspace extensions",
    },
    {
      name: "Nova Guide",
      href: "/guide",
      icon: BookOpen,
      desc: "Architecture & setup docs",
    },
  ];

  const isActiveRoute = (href: string) => {
    if (href === "/overview" && (pathname === "/overview" || pathname === "/")) {
      return true;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#040B14] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF] overflow-x-hidden">
      {/* =========================================================
          MOBILE STICKY TOP BAR (< 768px)
      ========================================================= */}
      <header className="md:hidden sticky top-0 z-40 h-16 w-full bg-[#040B14]/95 backdrop-blur-md border-b border-[#17344D] px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-[#00E5FF] hover:bg-[#091726] border border-transparent hover:border-[#17344D] transition-all active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/overview" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#091726] border border-[#00E5FF]/50 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <Cpu className="w-4 h-4 text-[#00E5FF]" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold tracking-[0.18em] text-sm text-white">
                NOVA CORTEX
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CONTROL PLANE
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile Right Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDevErrorMsg("");
              setIsDevModalOpen(true);
            }}
            className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1.5 border transition-all ${
              isDev
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "bg-[#091726] border-[#17344D] text-slate-400 hover:text-[#00E5FF]"
            }`}
          >
            {isDev ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>DEV</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>STD</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE SLIDE-OVER NAVIGATION DRAWER (< 768px)
      ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative w-[82%] max-w-[300px] bg-[#06101E] border-r border-[#17344D] h-full flex flex-col justify-between z-10 shadow-2xl">
            {/* Drawer Header */}
            <div>
              <div className="h-16 px-5 border-b border-[#17344D] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#091726] border border-[#00E5FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    <Cpu className="w-4 h-4 text-[#00E5FF]" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm tracking-[0.16em] text-white">
                      NOVA CORTEX
                    </div>
                    <div className="text-[10px] font-mono text-[#00E5FF]">
                      v1.0 PRODUCTION
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close Menu"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#091726]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1.5">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Core Navigation
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                        active
                          ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.08)]"
                          : "text-slate-300 hover:bg-[#091726] hover:text-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            active ? "text-[#00E5FF]" : "text-slate-400"
                          }`}
                        />
                        <div>
                          <div className="leading-none">{item.name}</div>
                          <div className="text-[11px] text-slate-500 mt-1 font-normal">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 ${
                          active ? "text-[#00E5FF]" : "text-slate-600"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer: Dev Access & User Profile */}
            <div className="p-4 border-t border-[#17344D] bg-[#040B14]/80 space-y-3">
              {/* Dev Clearance Trigger */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setDevErrorMsg("");
                  setIsDevModalOpen(true);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between border transition-all ${
                  isDev
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-[#091726] border-[#17344D] text-slate-300 hover:border-[#00E5FF]/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  {isDev ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Terminal className="w-4 h-4 text-[#00E5FF]" />
                  )}
                  {isDev ? "DEV CLEARANCE: ACTIVE" : "ARCHITECT ACCESS"}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40">
                  {isDev ? "LOCK" : "UNLOCK"}
                </span>
              </button>

              {/* Session Info */}
              <div className="p-3 rounded-xl bg-[#091726] border border-[#17344D] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] font-mono text-xs font-bold shrink-0">
                    {userEmail ? userEmail[0].toUpperCase() : "G"}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white truncate">
                      {maskEmail(userEmail)}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Vault Synced
                    </div>
                  </div>
                </div>
                {userEmail && (
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          DESKTOP PERSISTENT LEFT SIDEBAR (md: >= 768px)
      ========================================================= */}
      <aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col md:fixed md:inset-y-0 bg-[#06101E] border-r border-[#17344D] z-30 select-none">
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#17344D] flex items-center justify-between">
          <Link href="/overview" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#091726] border border-[#00E5FF]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)] group-hover:shadow-[0_0_22px_rgba(0,229,255,0.4)] transition-all">
              <Cpu className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="font-mono font-bold text-base tracking-[0.2em] text-white group-hover:text-[#00E5FF] transition-colors">
                NOVA CORTEX
              </div>
              <div className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CLOUD CONTROL v1.0
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Control Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.08)]"
                    : "text-slate-300 hover:bg-[#091726] hover:text-white border border-transparent hover:border-[#17344D]"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active
                        ? "text-[#00E5FF]"
                        : "text-slate-400 group-hover:text-[#00E5FF]"
                    }`}
                  />
                  <div>
                    <div className="leading-none">{item.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 font-normal">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    active
                      ? "text-[#00E5FF] translate-x-0.5"
                      : "text-slate-600 group-hover:text-slate-400"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Dev Access & User Session */}
        <div className="p-4 border-t border-[#17344D] bg-[#040B14]/60 space-y-3">
          <button
            onClick={() => {
              setDevErrorMsg("");
              setIsDevModalOpen(true);
            }}
            className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between border transition-all ${
              isDev
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                : "bg-[#091726] border-[#17344D] text-slate-300 hover:border-[#00E5FF]/40 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              {isDev ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
              )}
              <span className="tracking-wider font-semibold">
                {isDev ? "DEV ACTIVE (LOCK)" : "DEV CLEARANCE"}
              </span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isDev
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {isDev ? "CLOUD" : "LOCKED"}
            </span>
          </button>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-[#091726] border border-[#17344D] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] font-mono text-xs font-bold shrink-0">
                {userEmail ? userEmail[0].toUpperCase() : "G"}
              </div>
              <div className="min-w-0">
                <div
                  className="text-xs font-medium text-slate-200 truncate"
                  title={userEmail || "Guest Session"}
                >
                  {isLoadingAuth ? "Syncing..." : maskEmail(userEmail)}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3 h-3 text-[#00E5FF]" />
                  <span>{userEmail ? "Authenticated" : "Local Session"}</span>
                </div>
              </div>
            </div>
            {userEmail && (
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT AREA (Responsive Offset & Full-Width Mobile)
      ========================================================= */}
      <div className="flex-1 flex flex-col md:pl-64 lg:pl-72 min-w-0 w-full">
        {/* Desktop Top Status Header */}
        <header className="hidden md:flex h-20 px-8 border-b border-[#17344D] bg-[#040B14]/85 backdrop-blur-md sticky top-0 z-20 items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#00E5FF]">
              AUTONOMOUS OS CONTROL PLANE
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              Synchronized with Nova Android Ghost Protocol & Supabase Vault
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Environment Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-[#091726] border border-[#17344D] flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>RELEASE: v1.0</span>
            </div>

            {/* Dev Status Badge */}
            <button
              onClick={() => {
                setDevErrorMsg("");
                setIsDevModalOpen(true);
              }}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-semibold tracking-wider flex items-center gap-2 border transition-all ${
                isDev
                  ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "bg-[#091726] border-[#17344D] text-slate-400 hover:border-[#00E5FF]/50 hover:text-white"
              }`}
            >
              {isDev ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>DEV ACTIVE: CLOUD</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>STANDARD MODE</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {children}
        </main>

        {/* Subtle Responsive Footer */}
        <footer className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 border-t border-[#17344D]/60 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>NOVA AI CONTROL PLANE • ENCRYPTED CLOUD VAULT</div>
          <div>ENGINEERED BY A-R ART STUDIO</div>
        </footer>
      </div>

      {/* =========================================================
          DEVELOPER SECURITY GATE MODAL
      ========================================================= */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#091726] border border-[#00E5FF]/50 shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#06101E] border-b border-[#17344D] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isDev ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#00E5FF]" />
                )}
                <h3 className="font-mono font-bold text-sm tracking-wider uppercase text-white">
                  {isDev
                    ? "Developer Clearance Active"
                    : "Developer Security Gate"}
                </h3>
              </div>
              <button
                onClick={() => setIsDevModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#091726]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isDev ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed">
                    Master Architect Protocol is currently engaged and synced
                    with your cloud profile ({maskEmail(userEmail)}). Your
                    Android device will automatically inherit Creator Clearance.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDevModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white border border-[#17344D] hover:bg-[#06101E]"
                    >
                      KEEP ACTIVE
                    </button>
                    <button
                      type="button"
                      onClick={handleLockDev}
                      disabled={devAuthLoading}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {devAuthLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                      REVOKE & LOCK ACCESS
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyDev} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the Master Architect Security Key to unlock Creator
                    Protocol across the Web Control Plane and synced Android
                    devices.
                  </p>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Master Security Passcode
                    </label>
                    <input
                      type="password"
                      value={devPasswordInput}
                      onChange={(e) => setDevPasswordInput(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-[#040B14] border border-[#17344D] focus:border-[#00E5FF] focus:outline-none text-sm text-white font-mono tracking-wider"
                    />
                  </div>

                  {devErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{devErrorMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsDevModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-white border border-[#17344D]"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={devAuthLoading}
                      className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-[#040B14] flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all disabled:opacity-50"
                    >
                      {devAuthLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unlock className="w-4 h-4" />
                      )}
                      AUTHORIZE PROTOCOL
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
