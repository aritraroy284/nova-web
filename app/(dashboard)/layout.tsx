"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  KeyRound, 
  Blocks, 
  BookOpen, 
  Sun, 
  Moon, 
  LogIn, 
  LogOut, 
  X,
  AlertCircle
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"menu" | "email">("menu");

  const [user, setUser] = useState<{ name: string; username: string; email: string; avatar?: string } | null>(null);

  // Email state
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("nova_theme");
    const dark = savedTheme !== "light";
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    // Supabase Session Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) syncUserData(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserData(session.user);
      } else {
        const local = localStorage.getItem("nova_guest_session");
        if (local) {
          try { setUser(JSON.parse(local)); } catch (e) { setUser(null); }
        } else {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserData = (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const name = meta.full_name || meta.name || sbUser.email?.split("@")[0] || "Nova User";
    const username = (meta.user_name || sbUser.email?.split("@")[0] || "user").toLowerCase();
    const avatar = meta.avatar_url || meta.picture || "";
    setUser({ name, username, email: sbUser.email || "", avatar });
    localStorage.removeItem("nova_guest_session");
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("nova_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("nova_theme", "light");
    }
  };

  // Google OAuth via Supabase
  const handleGoogleSignIn = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/overview`
      }
    });
    if (error) setAuthError(error.message);
  };

  // Email Sign In / Sign Up
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formEmail,
      password: formPass
    });

    if (error) {
      // If user doesn't exist, try creating account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formEmail,
        password: formPass
      });
      if (signUpError) {
        setAuthError(signUpError.message);
      } else if (signUpData?.user) {
        setAuthModalOpen(false);
      }
    } else if (data?.user) {
      setAuthModalOpen(false);
    }
    setLoading(false);
  };

  const handleGuestLogin = () => {
    const guest = { 
      name: "Guest User", 
      username: "guest_" + Math.floor(Math.random() * 9000 + 1000), 
      email: "guest@nova.local" 
    };
    setUser(guest);
    localStorage.setItem("nova_guest_session", JSON.stringify(guest));
    setAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("nova_guest_session");
    setUser(null);
  };

  const navItems = [
    { name: "Overview", href: "/overview", icon: LayoutDashboard },
    { name: "API & Models", href: "/api-models", icon: KeyRound },
    { name: "Plugins", href: "/plugins", icon: Blocks },
    { name: "Nova Guide", href: "/guide", icon: BookOpen },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${isDark ? "bg-[#080E18] text-white" : "bg-[#FAF9F5] text-[#1F1E1D]"}`}>
      {/* Desktop Sidebar */}
      <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r p-5 flex flex-col justify-between shrink-0 ${isDark ? "bg-[#0F1A29] border-[#1C2A3D]" : "bg-white border-[#E5E2DA]"}`}>
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center font-mono font-bold text-[#00E5FF]">N</div>
            <div>
              <div className="font-mono font-bold text-sm tracking-wider">NOVA CORTEX</div>
              <div className={`text-[10px] ${isDark ? "text-[#8E9DAE]" : "text-[#737069]"}`}>CONTROL PLANE</div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    active 
                      ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-bold" 
                      : isDark ? "text-[#8E9DAE] hover:bg-white/5" : "text-[#737069] hover:bg-black/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`pt-4 border-t space-y-3 ${isDark ? "border-[#1C2A3D]" : "border-[#E5E2DA]"}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition ${isDark ? "border-[#1C2A3D] bg-white/5 text-white hover:border-[#00E5FF]" : "border-[#E5E2DA] bg-black/5 text-[#1F1E1D] hover:border-teal-600"}`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">● Online</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`px-6 py-4 border-b flex items-center justify-between glass-panel sticky top-0 z-40 ${isDark ? "border-[#1C2A3D]" : "border-[#E5E2DA]"}`}>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
            V1.0 LIVE
          </span>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-[#00E5FF]/40" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center font-mono text-xs text-[#00E5FF] font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold">{user.name}</div>
                  <div className={`text-[10px] font-mono ${isDark ? "text-[#8E9DAE]" : "text-[#737069]"}`}>@{user.username}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setAuthMode("menu"); setAuthModalOpen(true); }}
                className="px-4 py-2 rounded-xl bg-[#00E5FF] text-black font-mono font-medium text-xs flex items-center gap-2 shadow-sm hover:opacity-90 transition"
              >
                <LogIn className="w-4 h-4" /> Sign In / Account
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${isDark ? "bg-[#0F1A29] border-[#1C2A3D] text-white" : "bg-white border-[#E5E2DA] text-[#1F1E1D]"}`}>
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-xs font-mono opacity-60 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authMode === "menu" ? (
              <div className="space-y-5">
                <div className="text-center pb-2">
                  <h3 className="text-xl font-bold font-mono tracking-tight">NOVA ACCOUNT ACCESS</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-[#8E9DAE]" : "text-[#737069]"}`}>
                    Sync provider keys, memory vectors, and plugin integrations.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className={`w-full p-3.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-3 transition ${isDark ? "bg-white/5 border-[#1C2A3D] hover:border-[#00E5FF]" : "bg-black/5 border-[#E5E2DA] hover:border-teal-600"}`}
                  >
                    <span className="font-bold text-[#00E5FF]">G</span> Sign in with Google
                  </button>

                  <button
                    onClick={() => setAuthMode("email")}
                    className={`w-full p-3.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-3 transition ${isDark ? "bg-white/5 border-[#1C2A3D] hover:border-[#00E5FF]" : "bg-black/5 border-[#E5E2DA] hover:border-teal-600"}`}
                  >
                    <span>✉️</span> Continue with Email
                  </button>

                  <button
                    onClick={handleGuestLogin}
                    className={`w-full p-3.5 rounded-xl border text-sm font-mono text-xs flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition ${isDark ? "border-[#1C2A3D]" : "border-[#E5E2DA]"}`}
                  >
                    <span>👤</span> Explore as Guest
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-bold text-base">Sign In or Register</h3>
                  <button type="button" onClick={() => setAuthMode("menu")} className="text-xs text-[#00E5FF] font-mono">&larr; Back</button>
                </div>

                <input
                  type="email"
                  placeholder="Email Address"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className={`w-full p-3 rounded-xl border text-xs outline-none focus:border-[#00E5FF] ${isDark ? "bg-black/40 border-[#1C2A3D]" : "bg-black/5 border-[#E5E2DA]"}`}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={formPass}
                  onChange={(e) => setFormPass(e.target.value)}
                  required
                  className={`w-full p-3 rounded-xl border text-xs outline-none focus:border-[#00E5FF] ${isDark ? "bg-black/40 border-[#1C2A3D]" : "bg-black/5 border-[#E5E2DA]"}`}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:opacity-90 transition mt-2 disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "CONTINUE WITH EMAIL"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
