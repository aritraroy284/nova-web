"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Play,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ApiModelsPage() {
  const [showGemini, setShowGemini] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ status: string; latency?: string; message: string } | null>(null);

  const models = [
    { id: "gemini-3.5-flash-lite", role: "Primary Router" },
    { id: "gemini-3.1-flash-lite", role: "Speed Fallback" },
    { id: "gemini-3.7-flash", role: "Deep Cortex" },
    { id: "gemini-3.5-flash", role: "Reasoning Fallback" },
    { id: "qwen/qwen3.8-27b", role: "Groq Secondary" },
    { id: "openrouter/free", role: "OpenRouter Standby" },
  ];

  // Fetch saved keys from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadUserKeys(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
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
        gemini_key: geminiKey.trim(),
        groq_key: groqKey.trim(),
        openrouter_key: openRouterKey.trim(),
        updated_at: new Date().toISOString()
      });

    setSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save keys: " + error.message);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: geminiKey }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ status: "ERROR", message: "Failed to connect to backend test runner." });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Credentials & Model Sequence</h1>
        <p className="text-sm opacity-70 mt-1">
          Store provider credentials in server-side encrypted vault. Priority order strictly matches Nova’s Android execution core.
        </p>
      </div>

      {/* Gemini Required Vault */}
      <div className="p-6 rounded-2xl glass-panel border border-[#00E5FF]/40 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Gemini API Key (Required)</h3>
            <p className="text-xs opacity-70 mt-0.5">Powers speech streaming, vision grounding, and reasoning.</p>
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
            placeholder="AIzaSy..."
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs opacity-70 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Vault Policy: Encrypted at rest. Scoped to your signed-in ID.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing || !geminiKey}
              className="px-4 py-2 rounded-lg border border-[#00E5FF]/50 text-[#00E5FF] font-mono text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Test Gemini Key
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Credentials saved to cloud vault. Ready for Android co-pilot synchronization.</span>
          </div>
        )}

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs font-mono ${
            testResult.status === "OK" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            <div className="font-bold mb-1">Status: {testResult.status}</div>
            <div>{testResult.message}</div>
            {testResult.latency && <div className="mt-1 opacity-70">Round-trip latency: {testResult.latency}</div>}
          </div>
        )}
      </div>

      {/* Universal Save Action Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-[#00E5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold">Encrypted Credentials Vault</div>
            <div className="opacity-70 text-[11px]">Saves Gemini, Groq, and OpenRouter keys simultaneously to your user row.</div>
          </div>
        </div>
        <button
          onClick={handleSaveKeys}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-mono font-bold text-xs hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-[#00E5FF]/20"
        >
          {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          {saveSuccess ? "All Keys Saved Successfully!" : "Save All Provider Keys"}
        </button>
      </div>

      {/* Optional Fallbacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-[#1C2A3D] space-y-3">
          <div className="font-bold text-sm">Groq API Key (Optional Fallback)</div>
          <input
            type="password"
            value={groqKey}
            onChange={(e) => setGroqKey(e.target.value)}
            placeholder="gsk_..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-[#1C2A3D] font-mono text-xs focus:border-[#00E5FF] outline-none"
          />
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-black/10 dark:border-[#1C2A3D] space-y-3">
          <div className="font-bold text-sm">OpenRouter Key (Optional Fallback)</div>
          <input
            type="password"
            value={openRouterKey}
            onChange={(e) => setOpenRouterKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-black/5 dark:bg-black/30 border border-black/10 dark:border-[#1C2A3D] font-mono text-xs focus:border-[#00E5FF] outline-none"
          />
        </div>
      </div>

      {/* Model Sequence Table */}
      <div className="p-6 rounded-2xl glass-panel border border-black/10 dark:border-[#1C2A3D] space-y-4">
        <h3 className="font-bold text-base">Deterministic Core Routing Table</h3>
        <p className="text-xs opacity-70">
          Preserved execution sequence. Models are stepped down only upon rate limits or gateway timeouts.
        </p>
        <div className="divide-y divide-black/5 dark:divide-white/5">
          {models.map((m, idx) => (
            <div key={m.id} className="py-2.5 flex justify-between text-xs font-mono">
              <span className="text-[#00E5FF] font-bold">0{idx + 1} {m.id}</span>
              <span className="opacity-70">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
