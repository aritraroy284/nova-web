"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Puzzle,
  BookOpen,
  ShieldCheck,
  Lock,
  Unlock,
  LogOut,
  Menu,
  X,
  Cpu,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDev, setIsDev] = useState<boolean>(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [devPasswordInput, setDevPasswordInput] = useState<string>("");
  const [devAuthLoading, setDevAuthLoading] = useState<boolean>(false);
  const [devErrorMsg, setDevErrorMsg] = useState<string>("");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("nova_user_email") || "";
      setUserEmail(email);

      const devCached = localStorage.getItem("nova_dev_active") === "true";
      setIsDev(devCached);

      if (email) {
        fetch("/api/vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "GET_DEV_STATUS", email }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.developer || d.authorized) {
              setIsDev(true);
              localStorage.setItem("nova_dev_active", "true");
            }
          })
          .catch(() => {});
      }
    }
  }, []);

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
        setDevErrorMsg(data.error || "Access Denied: Invalid Security Key.");
      }
    } catch {
      setDevErrorMsg("Network error verifying clearance.");
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
        body: JSON.stringify({ action: "LOCK_DEV", email: userEmail }),
      });
    } catch {}
    setIsDev(false);
    localStorage.setItem("nova_dev_active", "false");
    setDevAuthLoading(false);
    setIsDevModalOpen(false);
  };

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "API & Models", href: "/api-models", icon: KeyRound },
    { name: "Plugins", href: "/plugins", icon: Puzzle },
    { name: "Nova Guide", href: "/guide", icon: BookOpen },
  ];

  const maskEmail = (mail: string) => {
    if (!mail) return "Guest Session";
    const parts = mail.split("@");
    return parts[0].slice(0, 3) + "•••@" + parts[1];
  };

  return (
    <div className="nova-root-shell min-h-screen bg-[#040B14] text-slate-100 flex flex-col font-sans">
      {/* Dynamic CSS: Desktop vs Mobile media query guarantee */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .nova-desktop-sidebar { display: none !important; }
          .nova-mobile-header { display: flex !important; }
          .nova-main-container { margin-left: 0 !important; padding: 16px !important; width: 100% !important; }
        }
        @media (min-width: 769px) {
          .nova-desktop-sidebar { display: flex !important; }
          .nova-mobile-header { display: none !important; }
          .nova-main-container { margin-left: 280px !important; padding: 32px !important; }
        }
      `}} />

      {/* MOBILE STICKY TOP BAR */}
      <header className="nova-mobile-header sticky top-0 z-40 h-16 w-full bg-[#040B14]/95 backdrop-blur-md border-b border-[#17344D] px-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-300 hover:text-[#00E5FF] hover:bg-[#091726]"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00E5FF]" />
            <span className="font-mono font-bold tracking-widest text-sm text-white">NOVA CORTEX</span>
          </div>
        </div>

        <button
          onClick={() => { setDevErrorMsg(""); setIsDevModalOpen(true); }}
          className={`px-2.5 py-1 rounded-full font-mono text-[10px] tracking-wider border flex items-center gap-1.5 ${
            isDev ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300" : "bg-[#091726] border-[#17344D] text-slate-400"
          }`}
        >
          {isDev ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3 h-3" />}
          <span>{isDev ? "DEV ACTIVE" : "DEV LOCK"}</span>
        </button>
      </header>

      {/* MOBILE DRAWER MODAL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative w-[80%] max-w-[300px] bg-[#06101E] border-r border-[#17344D] h-full flex flex-col justify-between z-10 shadow-2xl p-5">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#17344D]">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#00E5FF]" />
                  <span className="font-mono font-bold text-sm text-white">NOVA OS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm ${
                        active ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40" : "text-slate-300 hover:bg-[#091726]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#17344D] space-y-3">
              {userEmail ? (
                <div className="p-3 rounded-xl bg-[#091726] border border-[#17344D] flex items-center justify-between">
                  <span className="text-xs truncate">{maskEmail(userEmail)}</span>
                  <button onClick={() => { localStorage.clear(); setUserEmail(""); router.push("/login"); }} className="text-rose-400">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/login" className="w-full py-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>SIGN IN / REGISTER</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="nova-desktop-sidebar fixed inset-y-0 left-0 w-[280px] bg-[#06101E] border-r border-[#17344D] flex-col justify-between p-5 z-30">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-[#17344D]">
            <Cpu className="w-6 h-6 text-[#00E5FF]" />
            <div>
              <div className="font-mono font-bold text-sm tracking-widest text-white">NOVA CORTEX</div>
              <div className="text-[10px] font-mono text-emerald-400">CORE ONLINE</div>
            </div>
          </div>

          <div className="py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-all ${
                    active ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/40" : "text-slate-400 hover:text-white hover:bg-[#091726]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-[#17344D] space-y-3">
          <button
            onClick={() => { setDevErrorMsg(""); setIsDevModalOpen(true); }}
            className={`w-full py-2 px-3 rounded-xl font-mono text-xs border flex items-center justify-between ${
              isDev ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300" : "bg-[#091726] border-[#17344D] text-slate-400"
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isDev ? "DEV ACTIVE" : "DEV ACCESS"}</span>
            </span>
            <span className="text-[10px]">{isDev ? "LOCK" : "UNLOCK"}</span>
          </button>

          {userEmail ? (
            <div className="p-3 rounded-xl bg-[#091726] border border-[#17344D] flex items-center justify-between">
              <span className="text-xs truncate">{maskEmail(userEmail)}</span>
              <button onClick={() => { localStorage.clear(); setUserEmail(""); router.push("/login"); }} className="text-rose-400">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="w-full py-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold flex items-center justify-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>SIGN IN / REGISTER</span>
            </Link>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="nova-main-container flex-1 min-w-0">
        {children}
      </main>

      {/* DEVELOPER MODAL */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#091726] border border-[#00E5FF]/50 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#17344D] pb-3">
              <h3 className="font-mono text-sm font-bold text-white">DEVELOPER CLEARANCE</h3>
              <button onClick={() => setIsDevModalOpen(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            {isDev ? (
              <div className="space-y-4">
                <p className="text-xs text-emerald-300">Creator Clearance active on this session.</p>
                <button onClick={handleLockDev} className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs">
                  LOCK DEV ACCESS
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyDev} className="space-y-4">
                <input
                  type="password"
                  value={devPasswordInput}
                  onChange={(e) => setDevPasswordInput(e.target.value)}
                  placeholder="Master Security Key"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#040B14] border border-[#17344D] text-sm text-white font-mono"
                />
                {devErrorMsg && <div className="text-xs text-rose-400">{devErrorMsg}</div>}
                <button type="submit" disabled={devAuthLoading} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-[#040B14] font-mono text-xs font-bold">
                  {devAuthLoading ? "VERIFYING..." : "UNLOCK"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
