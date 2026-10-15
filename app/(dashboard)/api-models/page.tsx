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

interface HealthItem {
  status: string;
  latency?: string;
  message: string;
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

  const [testResults, setTestResults] = useState<{
    gemini?: HealthItem;
    groq?: HealthItem;
    openrouter?: HealthItem;
  } | null>(null);

  const models = [
    { id: "gemini-3.5-flash-lite", role: "Primary Router" },
    { id: "gemini-3.1-flash-lite", role: "Speed Fallback" },
    { id: "gemini-3.7-flash", role: "Deep Cortex" },
    { id: "gemini-3.5-flash", role: "Reasoning Fallback" },
    { id: "qwen/qwen3.8-27b", role: "Groq Secondary" },
    { id: "openrouter/free", role: "OpenRouter Standby" },
  ];

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

  const handleTestAll = async () => {
    setTesting(true);
    setTestResults(null);

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
      setTestResults(data);
    } catch {
      alert("Failed to reach server test runner.");
    } finally {
      setTesting(false);
    }
  };

  const renderBadge = (item?: HealthItem) => {
    if (!item) return null;
    const isOk = item.status === "OK";
    const isNotSet = item.status === "NOT_CONFIGURED";

    return (
      <div className={`p-3 rounded-xl border text-xs font-mono ${
        isOk 
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
          : isNotSet 
            ? "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-60" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
      }`}>
        <div className="flex justify-between items-center font-bold">
          <span>Status: {item.status}</span>
          {item.latency && <span>{item.latency}</span>}
        </div>
        <div className="mt-1 text-[11px] opacity-90">{item.message}</div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">API Credentials & Model Sequence</h1>
        <p className="text-sm opacity-70 mt-1">
          Store provider credentials in server-side encrypted vault. Priority order strictly matches Nova’s Android execution core.
        </p>
      </div>

      {/* GEMINI CARD */}
      <div className="p-6 rounded-2xl glass-panel border border-[#00E5FF]/40 space-y-4">
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

        {testResults?.gemini && renderBadge(testResults.gemini)}
      </div>

      {/* FALLBACKS GRID */}
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
          {testResults?.groq && renderBadge(testResults.groq)}
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
          {testResults?.openrouter && renderBadge(testResults.openrouter)}
        </div>
      </div>

      {/* UNIVERSAL DUAL ACTION BAR */}
      <div className="p-5 rounded-2xl glass-panel border border-[#00E5FF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">Cloud Credential Vault</div>
            <div className="opacity-70 text-[11px]">Test all configured endpoints simultaneously or save to database.</div>
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

      {/* MODEL SEQUENCE TABLE */}
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
