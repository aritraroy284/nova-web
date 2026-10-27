"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Radio, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

export default function PluginsPage() {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const emailRef = useRef<string | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  const fetchCloudStatus = async (email: string) => {
    if (isUpdatingRef.current) return;
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GET_PLUGINS", email })
      });
      if (res.ok) {
        const data = await res.json();
        if (!isUpdatingRef.current) {
          setGmailConnected(Boolean(data.gmail_connected));
        }
      }
    } catch {}
  };

  useEffect(() => {
    const cachedEmail = typeof window !== "undefined" ? localStorage.getItem("nova_user_email") : null;
    if (cachedEmail) {
      setUserEmail(cachedEmail);
      emailRef.current = cachedEmail;
      fetchCloudStatus(cachedEmail);
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const activeEmail = session?.user?.email || cachedEmail;
        if (activeEmail) {
          setUserEmail(activeEmail);
          emailRef.current = activeEmail;
          fetchCloudStatus(activeEmail);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          emailRef.current = session.user.email;
          fetchCloudStatus(session.user.email);
        }
      });

      // 4-second Polling with lock protection
      const syncInterval = setInterval(() => {
        if (emailRef.current && !isUpdatingRef.current) {
          fetchCloudStatus(emailRef.current);
        }
      }, 4000);

      const handleFocus = () => {
        if (emailRef.current && !isUpdatingRef.current) {
          fetchCloudStatus(emailRef.current);
        }
      };
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleFocus);

      return () => {
        subscription.unsubscribe();
        clearInterval(syncInterval);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
      };
    }
  }, []);

  const savePluginConnection = async (email: string, state: boolean) => {
    isUpdatingRef.current = true;
    setGmailConnected(state); // Instant UI feedback

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PLUGIN",
          email,
          plugin: "gmail",
          connected: state
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update cloud vault");
      }
    } finally {
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 3500);
    }
  };

  const handleConnectGmail = async () => {
    if (!userEmail) {
      setErrorMsg("No active session found. Please authenticate first.");
      return;
    }
    if (!supabase) {
      setErrorMsg("Supabase client unavailable.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setStatusMsg(`Connecting Gmail strictly for ${userEmail}...`);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/gmail.readonly",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            login_hint: userEmail,
          },
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/plugins` : undefined,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to launch Google authentication.");
      setLoading(false);
      setStatusMsg("");
    }
  };

  const handleDisconnectGmail = async () => {
    if (!userEmail) return;
    setLoading(true);
    setErrorMsg("");
    try {
      await savePluginConnection(userEmail, false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to disconnect.");
      setGmailConnected(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17344D]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">Plugins & Integrations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Plugins are strictly bound to your active Google Account:{" "}
            <span className="text-[#00E5FF] font-mono font-semibold">
              {userEmail || "Detecting Cloud Session..."}
            </span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Realtime Cloud Sync Active</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl border bg-[#06101E] border-[#17344D] space-y-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base text-white">Gmail Assistant Plugin</h3>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                    gmailConnected
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                      : "bg-[#091726] text-slate-400 border-[#17344D]"
                  }`}>
                    {gmailConnected ? "ACTIVE • APP SYNCED" : "DISCONNECTED"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Scans unread emails and generates AI audio briefings. Isolated strictly to{" "}
                  <span className="text-[#00E5FF] font-mono">{userEmail || "your signed-in account"}</span>.
                </p>
              </div>
            </div>

            <button
              onClick={gmailConnected ? handleDisconnectGmail : handleConnectGmail}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 ${
                gmailConnected
                  ? "border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  : "bg-[#00E5FF] text-[#040B14] hover:bg-[#00E5FF]/90 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
              }`}
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {gmailConnected ? "DISCONNECT" : "CONNECT GMAIL"}
            </button>
          </div>

          <div className="pt-4 border-t border-[#17344D] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scope: https://www.googleapis.com/auth/gmail.readonly</span>
            </div>
            <div className="text-[11px] text-[#00E5FF] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bound Account: {userEmail || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
