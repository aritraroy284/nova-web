"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Radio, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

export default function PluginsPage() {
  const [gmailConnected, setGmailConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const emailRef = useRef<string | null>(null);
  const isUpdatingRef = useRef<boolean>(false);

  // 1. Fetch exact cloud status for strictly this user's email
  const fetchCloudStatus = async (email: string) => {
    if (!email || isUpdatingRef.current) return;
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "GET_PLUGINS", email: email.trim().toLowerCase() })
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
    // Detect active authenticated session strictly
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const activeEmail = session?.user?.email || (typeof window !== "undefined" ? localStorage.getItem("nova_user_email") : null);
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

      // Background cloud sync every 3 seconds (bi-directional mirror)
      const interval = setInterval(() => {
        if (emailRef.current && !isUpdatingRef.current) {
          fetchCloudStatus(emailRef.current);
        }
      }, 3000);

      const onFocus = () => {
        if (emailRef.current && !isUpdatingRef.current) {
          fetchCloudStatus(emailRef.current);
        }
      };
      window.addEventListener("focus", onFocus);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
        window.removeEventListener("focus", onFocus);
      };
    }
  }, []);

  // 2. Toggle plugin status with instant cloud save
  const togglePlugin = async (targetState: boolean) => {
    if (!userEmail) {
      setErrorMsg("Please sign in to Nova before managing plugins.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    isUpdatingRef.current = true;
    setGmailConnected(targetState); // Instant optimistic update

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PLUGIN",
          email: userEmail.trim().toLowerCase(),
          plugin: "gmail",
          connected: targetState
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update cloud vault");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Sync failed");
      setGmailConnected(!targetState); // Revert on failure
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17344D]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">Plugins & Integrations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Plugins are strictly bound to your active account:{" "}
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
                    {gmailConnected ? "ACTIVE • SYNCED" : "DISCONNECTED"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Scans unread emails and generates AI audio briefings. Isolated strictly to{" "}
                  <span className="text-[#00E5FF] font-mono">{userEmail || "your signed-in account"}</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => togglePlugin(!gmailConnected)}
              disabled={loading || !userEmail}
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
