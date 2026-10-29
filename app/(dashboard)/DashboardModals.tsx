"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

interface ModalsProps {
  showDevModal: boolean;
  setShowDevModal: (v: boolean) => void;
  isDevMode: boolean;
  setIsDevMode: (v: boolean) => void;
  userEmail: string | null;
  setUserEmail: (v: string | null) => void;
  setUserName: (v: string | null) => void;
  setIsGuest: (v: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  syncDevStatusFromCloud: (email: string | null) => void;
}

export default function DashboardModals({
  showDevModal,
  setShowDevModal,
  isDevMode,
  setIsDevMode,
  userEmail,
  setUserEmail,
  setUserName,
  setIsGuest,
  showAuthModal,
  setShowAuthModal,
  syncDevStatusFromCloud
}: ModalsProps) {
  const [authMode, setAuthMode] = useState<"SIGNIN" | "SIGNUP">("SIGNIN");
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [authStatusMsg, setAuthStatusMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [devPassInput, setDevPassInput] = useState("");
  const [devStatusMsg, setDevStatusMsg] = useState<string | null>(null);
  const [devLoading, setDevLoading] = useState(false);

  const handleVerifyDevKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devPassInput.trim()) return;
    setDevLoading(true);
    setDevStatusMsg(null);
    const activeMail = userEmail || "guest@nova.internal";

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "VERIFY_DEV",
          email: activeMail,
          devPassword: devPassInput.trim(),
          passcode: devPassInput.trim()
        })
      });
      const data = await res.json();
      if (data.authorized || data.developer) {
        setIsDevMode(true);
        setDevStatusMsg("Master Architect Protocol Engaged!");
        setTimeout(() => {
          setShowDevModal(false);
          setDevPassInput("");
          setDevStatusMsg(null);
        }, 800);
      } else {
        setDevStatusMsg(data.error || "Access Denied: Invalid Security Key");
      }
    } catch (err: any) {
      setDevStatusMsg("Server connection error: " + err.message);
    } finally {
      setDevLoading(false);
    }
  };

  const handleLockDevAccess = async () => {
    setDevLoading(true);
    const activeMail = userEmail || "guest@nova.internal";
    try {
      await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "LOCK_DEV", email: activeMail })
      });
      setIsDevMode(false);
      setDevStatusMsg("Dev clearance removed. Public protocol restored.");
      setTimeout(() => {
        setShowDevModal(false);
        setDevStatusMsg(null);
      }, 700);
    } catch (err) {
      setIsDevMode(false);
      setShowDevModal(false);
    } finally {
      setDevLoading(false);
    }
  };

  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthStatusMsg(null);
    const cleanEmail = formEmail.trim().toLowerCase();
    if (!cleanEmail || !formPass) {
      setAuthStatusMsg("Please fill in all credentials.");
      setAuthLoading(false);
      return;
    }
    const displayName = formName.trim() || cleanEmail.split("@")[0];
    setUserEmail(cleanEmail);
    setUserName(displayName);
    setIsGuest(false);
    localStorage.setItem("nova_session_email", cleanEmail);
    localStorage.setItem("nova_session_name", displayName);
    localStorage.removeItem("nova_session_guest");
    setAuthLoading(false);
    setShowAuthModal(false);
    setFormPass("");
    syncDevStatusFromCloud(cleanEmail);
  };

  const handleGoogleSignIn = async () => {
    try {
      const isRealSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                            !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");
      if (isRealSupabase && supabase?.auth) {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/overview` }
        });
      } else {
        const emailPrompt = window.prompt("Enter your Google Account Email for Nova sync:", "royaritra284@gmail.com");
        if (emailPrompt && emailPrompt.includes("@")) {
          const clean = emailPrompt.trim().toLowerCase();
          setUserEmail(clean);
          setUserName(clean.split("@")[0]);
          setIsGuest(false);
          localStorage.setItem("nova_session_email", clean);
          localStorage.setItem("nova_session_name", clean.split("@")[0]);
          localStorage.removeItem("nova_session_guest");
          setShowAuthModal(false);
          syncDevStatusFromCloud(clean);
        }
      }
    } catch (e) {}
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    setUserEmail(null);
    setUserName("Guest User");
    setIsDevMode(false);
    localStorage.setItem("nova_session_guest", "true");
    localStorage.removeItem("nova_session_email");
    localStorage.removeItem("nova_session_name");
    setShowAuthModal(false);
  };

  return (
    <>
      {showDevModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#09131F] border border-[#00E5FF]/40 shadow-[0_0_30px_rgba(0,229,255,0.25)] text-left select-none animate-drawer-slide">
            <button onClick={() => setShowDevModal(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            {isDevMode ? (
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#00E5FF]" />
                  <h3 className="text-base font-bold font-mono tracking-wider text-[#00E5FF] uppercase">DEV CLEARANCE: ACTIVE</h3>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed mb-6">
                  Master Architect Protocol is currently engaged for this active session across Web and Mobile App.
                </p>
                {devStatusMsg && (
                  <p className="text-xs font-mono text-cyan-400 mb-4 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-800/50">{devStatusMsg}</p>
                )}
                <button
                  type="button"
                  onClick={handleLockDevAccess}
                  disabled={devLoading}
                  className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider text-white bg-[#B71C1C] hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_15px_rgba(183,28,28,0.4)] cursor-pointer"
                >
                  {devLoading ? "DISENGAGING PROTOCOL..." : "REMOVE / LOCK DEV ACCESS"}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold font-mono tracking-wider text-white uppercase">DEVELOPER CLEARANCE</h3>
                </div>
                <p className="text-xs font-mono text-slate-400 leading-relaxed mb-4">
                  Enter master security key to engage Creator Protocol & unlock system control:
                </p>
                <form onSubmit={handleVerifyDevKey} className="space-y-4">
                  <input
                    type="password"
                    value={devPassInput}
                    onChange={(e) => setDevPassInput(e.target.value)}
                    placeholder="Master Security Key"
                    className="w-full px-4 py-3 rounded-xl bg-[#060B11] border border-[#16273A] text-white font-mono text-xs focus:outline-none focus:border-[#00E5FF] transition-colors"
                    autoFocus
                  />
                  {devStatusMsg && (
                    <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/30 p-2.5 rounded-lg border border-amber-800/40">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{devStatusMsg}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={devLoading || !devPassInput.trim()}
                      className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider text-[#04080E] bg-[#00E5FF] hover:bg-[#33ECFF] disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer"
                    >
                      {devLoading ? "VERIFYING..." : "ENGAGE PROTOCOL"}
                    </button>
                    <button type="button" onClick={() => setShowDevModal(false)} className="py-3 px-4 rounded-xl font-mono text-xs text-slate-400 hover:text-white bg-[#0D1A29]">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl bg-[#09131F] border border-[#16273A] shadow-2xl text-left select-none animate-drawer-slide">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-lg font-bold font-mono tracking-tight text-white mb-1">Account & Authentication</h3>
              <p className="text-xs font-mono text-slate-400">Sync API keys, custom plugins & memory across Web and Mobile app.</p>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider text-white bg-[#101F30] hover:bg-[#162B42] border border-[#1E3A5A] transition-all flex items-center justify-center gap-3 mb-4 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>SIGN IN WITH GOOGLE</span>
            </button>
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-[#16273A] w-full" />
              <span className="bg-[#09131F] px-3 text-[10px] font-mono text-slate-500 uppercase">OR EMAIL ACCOUNT</span>
            </div>
            <div className="flex border-b border-[#16273A] mb-4">
              <button
                type="button"
                onClick={() => setAuthMode("SIGNIN")}
                className={`flex-1 pb-2 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${authMode === "SIGNIN" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-500"}`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("SIGNUP")}
                className={`flex-1 pb-2 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${authMode === "SIGNUP" ? "border-cyan-400 text-cyan-400" : "border-transparent text-slate-500"}`}
              >
                SIGN UP (NEW)
              </button>
            </div>
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              {authMode === "SIGNUP" && (
                <>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B11] border border-[#16273A] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="@username (Unique)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B11] border border-[#16273A] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    required
                  />
                </>
              )}
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B11] border border-[#16273A] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                required
              />
              <input
                type="password"
                value={formPass}
                onChange={(e) => setFormPass(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#060B11] border border-[#16273A] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                required
              />
              {authStatusMsg && (
                <p className="text-xs font-mono text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-800/40">{authStatusMsg}</p>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl font-mono text-xs font-bold tracking-wider text-[#04080E] bg-cyan-400 hover:bg-cyan-300 transition-all cursor-pointer"
              >
                {authLoading ? "AUTHENTICATING..." : (authMode === "SIGNIN" ? "LOG IN WITH EMAIL" : "CREATE & SIGN IN")}
              </button>
            </form>
            <div className="pt-4 mt-4 border-t border-[#16273A] text-center">
              <button type="button" onClick={handleContinueAsGuest} className="text-xs font-mono text-slate-400 hover:text-white transition-colors">
                Continue as Guest (No Cloud Identity)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
