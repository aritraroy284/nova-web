"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import {
  LayoutDashboard,
  KeyRound,
  Puzzle,
  BookOpen,
  ShieldCheck,
  Lock,
  LogOut,
  Menu,
  X,
  Cpu,
  UserCheck
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Dev Clearance State
  const [isDev, setIsDev] = useState<boolean>(false);
  const [isDevModalOpen, setIsDevModalOpen] = useState<boolean>(false);
  const [devPasswordInput, setDevPasswordInput] = useState<string>("");
  const [devAuthLoading, setDevAuthLoading] = useState<boolean>(false);
  const [devErrorMsg, setDevErrorMsg] = useState<string>("");

  // User Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Session Recovery
  useEffect(() => {
    let isMounted = true;
    async function loadSession() {
      try {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        const email =
          data?.session?.user?.email ||
          (typeof window !== "undefined" ? localStorage.getItem("nova_user_email") : "") ||
          "";
        if (email && isMounted) {
          setUserEmail(email);
          localStorage.setItem("nova_user_email", email);

          const res = await fetch("/api/vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "GET_DEV_STATUS", email }),
          });
          const d = await res.json();
          if (d.developer || d.authorized) {
            setIsDev(true);
            localStorage.setItem("nova_dev_active", "true");
          }
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      }
    }
    loadSession();

    let sub: any = null;
    if (supabase) {
      const listener = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email && isMounted) {
          setUserEmail(session.user.email);
          localStorage.setItem("nova_user_email", session.user.email);
        }
      });
      sub = listener?.data?.subscription;
    }

    return () => {
      isMounted = false;
      if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Email and password are required.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");

    try {
      if (authMode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
        if (data?.user?.email) {
          setUserEmail(data.user.email);
          localStorage.setItem("nova_user_email", data.user.email);
          setIsAuthModalOpen(false);
          setAuthPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword.trim(),
        });
        if (error) throw error;
        if (data?.user?.email) {
          setUserEmail(data.user.email);
          localStorage.setItem("nova_user_email", data.user.email);
          setIsAuthModalOpen(false);
          setAuthPassword("");
        } else {
          setAuthError("Check your email for confirmation link.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (!supabase) return;
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/overview` : undefined,
        },
      });
    } catch (err: any) {
      setAuthError(err.message || "Google sign-in failed.");
    }
  };

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
        setDevErrorMsg(data.error || "Access Denied.");
      }
    } catch {
      setDevErrorMsg("Verification failed.");
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

  const handleSignOut = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem("nova_user_email");
    localStorage.removeItem("nova_dev_active");
    setUserEmail("");
    setIsDev(false);
    router.push("/");
  };

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "API & Models", href: "/api-models", icon: KeyRound },
    { name: "Plugins", href: "/plugins", icon: Puzzle },
    { name: "Nova Guide", href: "/guide", icon: BookOpen },
  ];

  const maskEmail = (mail: string) => {
    if (!mail) return "Authenticated User";
    const parts = mail.split("@");
    return parts[0].slice(0, 3) + "•••@" + parts[1];
  };

  return (
    <div className="min-h-screen bg-[#060B11] text-white flex flex-col md:flex-row font-sans selection:bg-[#00E5FF]/20">
      
<div className="pt-4 border-t border-[#1E3045] space-y-3">
              {userEmail ? (
                <div className="p-3 rounded-xl bg-[#0D1520] border border-[#1E3045] flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-medium text-white truncate">{maskEmail(userEmail)}</div>
                    <div className="text-[10px] font-mono text-[#00F5A0]">Authenticated</div>
                  </div>
                  <button onClick={handleSignOut} title="Sign Out" className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); setAuthError(""); }}
                  className="w-full py-2.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>SIGN IN / REGISTER</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-1" onClick={() => { if (typeof window !== "undefined") window.location.href = "/"; }} style={{ cursor: "pointer" }} title="Return to Launch Page">
                <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse"></span>
                <span className="text-[10px] font-mono tracking-wider text-[#8E9DAE]">CORE ONLINE</span>
              </div>

        {/* Absolute Bottom Theme Toggle Pill Switch */}
        <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-between select-none">
          <span className="text-[10px] font-mono tracking-wider text-cyan-400/80 font-semibold uppercase">LIGHT THEME</span>
          <button
            type="button"
            onClick={() => {
              if (typeof document !== "undefined") {
                const isL = document.documentElement.classList.toggle("light-theme");
                try { localStorage.setItem("nova_theme", isL ? "light" : "dark"); } catch (e) {}
              }
            }}
            className="nova-theme-bar relative w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer touch-manipulation"
            title="Toggle Light / Dark Mode"
          >
            <div className="nova-theme-dot w-3 h-3 rounded-full transition-all duration-200" />
          </button>
        </div>
            </div>
          </aside>
        </div>
      )}

      
<div className="pt-4 border-t border-[#1E3045]/60 space-y-3">
          <button
            onClick={() => { setDevErrorMsg(""); setIsDevModalOpen(true); }}
            className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs border flex items-center justify-between transition ${
              isDev ? "bg-[#00F5A0]/10 border-[#00F5A0]/40 text-[#00F5A0]" : "bg-[#0D1520] border-[#1E3045] text-[#8E9DAE] hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
              <span>{isDev ? "DEV ACTIVE" : "DEV ACCESS"}</span>
            </span>
            <span className="text-[10px]">{isDev ? "CLOUD" : "LOCKED"}</span>
          </button>

          {userEmail ? (
            <div className="p-3 rounded-xl bg-[#0D1520] border border-[#1E3045] flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-white truncate">{maskEmail(userEmail)}</div>
                <div className="text-[10px] font-mono text-[#00F5A0]">Authenticated</div>
              </div>
              <button onClick={handleSignOut} title="Sign Out" className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setIsAuthModalOpen(true); setAuthError(""); }}
              className="w-full py-2.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>SIGN IN / REGISTER</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-1 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#00F5A0] animate-pulse"></span>
            <span className="text-[10px] font-mono tracking-wider text-[#8E9DAE]">CORE ONLINE</span>
          </div>

        {/* Absolute Bottom Theme Toggle Pill Switch */}
        <div className="mt-3 pt-2.5 border-t border-cyan-500/15 flex items-center justify-between select-none">
          <span className="text-[10px] font-mono tracking-wider text-cyan-400/80 font-semibold uppercase">LIGHT THEME</span>
          <button
            type="button"
            onClick={() => {
              if (typeof document !== "undefined") {
                const isL = document.documentElement.classList.toggle("light-theme");
                try { localStorage.setItem("nova_theme", isL ? "light" : "dark"); } catch (e) {}
              }
            }}
            className="nova-theme-bar relative w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer touch-manipulation"
            title="Toggle Light / Dark Mode"
          >
            <div className="nova-theme-dot w-3 h-3 rounded-full transition-all duration-200" />
          </button>
        </div>
        </div>
      </aside>

      
<div className="absolute inset-x-0 top-1/2 border-t border-[#1E3045]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 rounded-xl bg-[#060B11] hover:bg-[#142030] border border-[#1E3045] hover:border-[#00E5FF]/40 text-slate-200 font-mono text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Continue with Google</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DEV SECURITY GATE MODAL */}
      {isDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0D1520] border border-[#00E5FF]/50 p-6 space-y-4 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <div className="flex items-center justify-between border-b border-[#1E3045] pb-3">
              <h3 className="font-mono text-sm font-bold text-white uppercase">Developer Clearance Gate</h3>
              <button onClick={() => setIsDevModalOpen(false)} className="text-[#8E9DAE] hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            {isDev ? (
              <div className="space-y-4">
                <p className="text-xs text-[#00F5A0]">Master Architect Clearance active on this cloud session.</p>
                <button onClick={handleLockDev} className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-semibold transition">
                  REVOKE & LOCK ACCESS
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifyDev} className="space-y-4">
                <input
                  type="password"
                  value={devPasswordInput}
                  onChange={(e) => setDevPasswordInput(e.target.value)}
                  placeholder="Master Security Key"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060B11] border border-[#1E3045] text-sm text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                />
                {devErrorMsg && <div className="text-xs text-rose-400">{devErrorMsg}</div>}
                <button type="submit" disabled={devAuthLoading} className="w-full py-2.5 rounded-xl bg-[#00E5FF] text-[#060B11] font-mono text-xs font-bold transition">
                  {devAuthLoading ? "VERIFYING..." : "AUTHORIZE"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
