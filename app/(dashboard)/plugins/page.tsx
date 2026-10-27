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

  // Fetch status from cloud vault
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
        if (!isUpdatingRef.current && typeof data.gmail_connected === "boolean") {
          setGmailConnected(data.gmail_connected);
        }
      }
    } catch {}
  };

  // Save plugin state to cloud vault
  const savePluginState = async (email: string, state: boolean) => {
    isUpdatingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SET_PLUGIN",
          email: email.trim().toLowerCase(),
          plugin: "gmail",
          connected: state
        })
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setGmailConnected(state);
      } else {
        throw new Error(data.error || "Failed to update cloud vault");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sync state.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 1500);
    }
  };

  useEffect(() => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const pendingPlugin = typeof window !== "undefined" ? sessionStorage.getItem("nova_pending_plugin") : null;

    // Detect if Google returned a token or an error
    const isOAuthReturn = currentUrl.includes("access_token=") || currentUrl.includes("code=");
    const isOAuthError = currentUrl.includes("error=");

    if (isOAuthError) {
      if (typeof window !== "undefined") sessionStorage.removeItem("nova_pending_plugin");
      setErrorMsg("Google authorization was cancelled or denied.");
      setGmailConnected(false);
    }

    const handleAuthSession = async (email: string) => {
      setUserEmail(email);
      emailRef.current = email;

      // SUCCESSFUL RETURN FROM GOOGLE CONSENT!
      if (pendingPlugin === "gmail" && isOAuthReturn && !isOAuthError) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("nova_pending_plugin");
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        await savePluginState(email, true);
      } else {
        await fetchCloudStatus(email);
      }
    };

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const activeEmail = session?.user?.email || (typeof window !== "undefined" ? localStorage.getItem("nova_user_email") : null);
        if (activeEmail) {
          handleAuthSession(activeEmail);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          handleAuthSession(session.user.email);
        }
      });

      // Bi-directional live polling (mirrors App every 3 seconds)
      const interval = setInterval(() => {
        if (emailRef.current && !isUpdatingRef.current) {
          fetchCloudStatus(emailRef.current);
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
      };
    }
  }, []);

  const handleConnect = async () => {
    if (!userEmail) {
      setErrorMsg("Please sign in to Nova before linking plugins.");
      return;
    }
    if (!supabase) return;

    setLoading(true);
    setErrorMsg("");

    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("nova_pending_plugin", "gmail");
      }

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
      if (typeof window !== "undefined") sessionStorage.removeItem("nova_pending_plugin");
      setErrorMsg(err.message || "Failed to launch Google authentication.");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!userEmail) return;
    await savePluginState(userEmail, false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17344D]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono">Plugins & Integrations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Plugins are dynamically bound to active session:{" "}
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
                  Scans unread emails and generates AI audio briefings. Dynamic access tied to active session.
                </p>
              </div>
            </div>

            <button
              onClick={gmailConnected ? handleDisconnect : handleConnect}
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
              <span>Session: {userEmail || "None"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
