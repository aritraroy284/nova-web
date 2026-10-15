"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity,
  Server
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ModelDiagnostic {
  id: string;
  role: string;
  latency: string;
  speedLabel: string;
  speedColor: string;
  quotaStatus: string;
  status: string;
  details: string;
}

interface ProviderReport {
  configured: boolean;
  valid?: boolean;
  latency?: string;
  speedLabel?: string;
  error?: string;
  models: ModelDiagnostic[];
}

export default function ApiModelsPage() {
  const [showGemini, setShowGemini] = useState(false);
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);

  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [reports, setReports] = useState<{
    gemini?: ProviderReport;
    groq?: ProviderReport;
    openrouter?: ProviderReport;
  } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        loadUserKeys(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        loadUserKeys(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserKeys = async (uid: string) => {
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("gemini_key, groq_key, openrouter_key")
      .eq("user_id", uid)
      .maybeSingle();

    if (data && !error) {
      if (data.gemini_key) setGeminiKey(data.gemini_key);
      if (data.groq_key) setGroqKey(data.groq_key);
      if (data.openrouter_key) setOpenRouterKey(data.openrouter_key);
    }
  };

  const handleSaveKeys = async () => {
    if (!userId) {
      alert("Please Sign In first to save your API keys to the cloud vault.");
      return;
    }
    setSaving(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from("user_api_keys")
      .upsert({
        user_id: userId,
        email: userEmail ? userEmail.trim().toLowerCase() : undefined,
        gemini_key: geminiKey.trim(),
        groq_key: groqKey.trim(),
        openrouter_key: openRouterKey.trim(),
        updated_at: new Date().toISOString()
      }, { onConflict: userEmail ? "email" : "user_id" });

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save keys: " + error.message);
    }
  };

  const handleTestAll = async () => {
    setTesting(true);
    setReports(null);

    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiKey: geminiKey.trim(),
          groqKey: groqKey.trim(),
          openRouterKey: openRouterKey.trim()
        }),
      });
      const data = await res.json();
      setReports(data);
    } catch {
      alert("Failed to reach server test runner.");
    } finally {
      setTesting(false);
    }
  };

  const renderModelList = (report?: ProviderReport) => {
    if (!report || !report.configured) return null;

    if (!report.valid) {
      return (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{report.error || "Authentication failed"}</span>
        </div>
      );
    }

    return (
      <div className="space-y-2.5 pt-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#00E5FF] flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>Active Model Diagnostics</span>
        </div>

        <div className="space-y-2">
          {report.models.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl border border-black/10 dark:border-[#1C2A3D] bg-black/5 dark:bg-black/30 text-xs font-mono space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-white dark:text-[#00E5FF]">{m.id}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  {m.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] opacity-75">
                <span>Role: {m.role}</span>
                <span className="text-emerald-400">{m.quotaStatus}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Latency: {m.latency}
                </span>
                <span className="opacity-80">Server Load: {m.speedLabel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Credentials & Model Diagnostics</h1>
        <p className="text-sm opacity-70 mt-1">
          Real-time latency testing, model availability, and quota diagnostics for Nova core routing.
        </p>
      </div>

      {/* GEMINI CARD */}
      <div className="p-6 rounded-2xl glass-panel border border-[#00E5FF]/40 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Gemini API Key (Required)</h3>
            <p className="text-xs opacity-70 mt-0.5">Powers multi-model failover chain, vision grounding, and reasoning.</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00E5FF]/10 text-[#00E5FF] font-bold">
            COMPULSORY
          </span>
        </div>

        <div className="relative">
          <input
            type={showGemini ? "text" : "password"}
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="Enter Gemini key..."
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-[#1C2A3D] font-mono text-sm focus:border-[#00E5FF] outline-none pr-20"
          />
          <button
            type="button"
            onClick={() => setShowGemini(!showGemini)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
          >
            {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {renderModelList(reports?.gemini)}
      </div>

      {/* GROQ & OPENROUTER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* GROQ CARD */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-[#1C2A3D] space-y-3">
          <div className="flex justify-between items-center">
            <div className="font-bold text-sm">Groq API Key (Optional Fallback)</div>
            <span className="text-[10px] font-mono opacity-60">BACKUP 1</span>
          </div>
          <div className="relative">
            <input
              type={showGroq ? "text" : "password"}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="Enter Groq key..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-[#1C2A3D] font-mono text-xs focus:border-[#00E5FF] outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowGroq(!showGroq)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            >
              {showGroq ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {renderModelList(reports?.groq)}
        </div>

        {/* OPENROUTER CARD */}
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-[#1C2A3D] space-y-3">
          <div className="flex justify-between items-center">
            <div className="font-bold text-sm">OpenRouter Key (Optional Fallback)</div>
            <span className="text-[10px] font-mono opacity-60">BACKUP 2</span>
          </div>
          <div className="relative">
            <input
              type={showOpenRouter ? "text" : "password"}
              value={openRouterKey}
              onChange={(e) => setOpenRouterKey(e.target.value)}
              placeholder="Enter OpenRouter key..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-[#1C2A3D] font-mono text-xs focus:border-[#00E5FF] outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowOpenRouter(!showOpenRouter)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            >
              {showOpenRouter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {renderModelList(reports?.openrouter)}
        </div>
      </div>

      {/* UNIVERSAL DUAL ACTION BAR */}
      <div className="p-5 rounded-2xl glass-panel border border-[#00E5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">Cloud Credential Vault</div>
            <div className="opacity-70 text-[11px]">Test model latency and token availability or save securely to user vault.</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleTestAll}
            disabled={testing || (!geminiKey && !groqKey && !openRouterKey)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#00E5FF]/60 text-[#00E5FF] font-mono font-bold text-xs hover:bg-[#00E5FF]/10 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Test All Keys
          </button>

          <button
            onClick={handleSaveKeys}
            disabled={saving}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm shadow-[#00E5FF]/20"
          >
            {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {saveSuccess ? "All Saved!" : "Save All Keys"}
          </button>
        </div>
      </div>
    </div>
  );
}
