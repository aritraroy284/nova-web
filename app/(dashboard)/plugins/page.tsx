"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  ExternalLink,
  AlertCircle
} from "lucide-react";

export default function PluginsPage() {
  const [gmailConnected, setGmailConnected] = useState(false);
  const [bridgeActive, setBridgeActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Load local plugin states
    const gmState = localStorage.getItem("nova_gmail_plugin") === "connected";
    const brState = localStorage.getItem("nova_bridge_plugin") === "active";
    setGmailConnected(gmState);
    setBridgeActive(brState);

    const savedUser = localStorage.getItem("nova_user_session");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.email) setUserEmail(u.email);
      } catch (e) {}
    }
  }, []);

  const toggleGmail = () => {
    setLoading(true);
    setTimeout(() => {
      const next = !gmailConnected;
      setGmailConnected(next);
      localStorage.setItem("nova_gmail_plugin", next ? "connected" : "disconnected");
      setLoading(false);
    }, 400);
  };

  const toggleBridge = () => {
    const next = !bridgeActive;
    setBridgeActive(next);
    localStorage.setItem("nova_bridge_plugin", next ? "active" : "inactive");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-[#1C2A3D]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plugins & Integrations</h1>
          <p className="text-sm opacity-70 mt-1">
            Manage external workspace plugins and autonomous on-device hardware bridges.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Local Node: Port 8080</span>
        </div>
      </div>

      {/* Grid of Plugins */}
      <div className="grid grid-cols-1 gap-6">
        {/* PLUGIN 1: GMAIL ASSISTANT */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-[#0F1A29] border-black/10 dark:border-[#1C2A3D] space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base">Gmail Assistant Plugin</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    gmailConnected 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" 
                      : "bg-black/5 dark:bg-white/5 opacity-60 border-black/10 dark:border-white/10"
                  }`}>
                    {gmailConnected ? "ACTIVE" : "DISCONNECTED"}
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1 max-w-xl leading-relaxed">
                  Direct unread primary email scanning and AI audio briefings via secure OAuth 2.0 loopback. 
                  Zero sensitive emails are stored on external cloud databases.
                </p>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={toggleGmail}
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
                gmailConnected
                  ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                  : "bg-[#00E5FF] text-black hover:opacity-90 shadow-sm shadow-[#00E5FF]/20"
              }`}
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {gmailConnected ? "DISCONNECT" : "CONNECT GMAIL"}
            </button>
          </div>

          {/* Details Bar */}
          <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono opacity-80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scope: https://www.googleapis.com/auth/gmail.readonly</span>
            </div>
            {gmailConnected && (
              <div className="text-[11px] text-[#00E5FF]">
                Synced with: {userEmail || "Google Account"}
              </div>
            )}
          </div>
        </div>

        {/* PLUGIN 2: CLOUD BRIDGE MODE */}
        <div className="p-6 rounded-2xl border bg-white dark:bg-[#0F1A29] border-black/10 dark:border-[#1C2A3D] space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-base">Cloud Bridge Mode (Port 8080)</h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    bridgeActive 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" 
                      : "bg-black/5 dark:bg-white/5 opacity-60 border-black/10 dark:border-white/10"
                  }`}>
                    {bridgeActive ? "ONLINE" : "STANDBY"}
                  </span>
                </div>
                <p className="text-xs opacity-70 mt-1 max-w-xl leading-relaxed">
                  Transforms your Android phone into an autonomous execution node. Allows this web console to trigger Ghost Protocol app navigation, query telemetry, and inspect screen status.
                </p>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              onClick={toggleBridge}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 ${
                bridgeActive
                  ? "border border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  : "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-[#00E5FF]"
              }`}
            >
              {bridgeActive ? "DEACTIVATE" : "ACTIVATE NODE"}
            </button>
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono opacity-80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#00E5FF]" />
              <span>MCP Protocol • REST Dispatch via localhost:8080</span>
            </div>
            <div className="text-[11px]">
              Auth Header: <span className="opacity-60">nova_core_2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
