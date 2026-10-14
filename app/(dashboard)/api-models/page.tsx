"use client";
import React, { useState } from "react";
import { ShieldCheck, Eye, EyeOff, RefreshCw, Play } from "lucide-react";

export default function ApiModelsPage() {
  const [showGemini, setShowGemini] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; latency?: string; message: string } | null>(null);

  const models = [
    { id: "gemini-3.5-flash-lite", role: "Primary Router" },
    { id: "gemini-3.1-flash-lite", role: "Speed Fallback" },
    { id: "gemini-3.7-flash", role: "Deep Cortex" },
    { id: "gemini-3.5-flash", role: "Reasoning Fallback" },
    { id: "qwen/qwen3.8-27b", role: "Groq Secondary" },
    { id: "openrouter/free", role: "OpenRouter Standby" },
  ];

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
      <h1 className="text-2xl font-bold tracking-tight">API Credentials & Model Sequence</h1>
      <div className="p-6 rounded-2xl glass-panel border border-nova-cyan/40 space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Gemini API Key (Required)</h3>
            <p className="text-xs text-atelier-muted dark:text-nova-muted">Powers speech streaming, vision grounding, and reasoning.</p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-nova-cyan/10 text-nova-cyan">COMPULSORY</span>
        </div>
        <div className="relative">
          <input
            type={showGemini ? "text" : "password"}
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-xl bg-black/5 dark:bg-black/30 border border-atelier-border dark:border-nova-border font-mono text-sm focus:border-nova-cyan pr-20"
          />
          <button type="button" onClick={() => setShowGemini(!showGemini)} className="absolute right-3 top-1/2 -translate-y-1/2 text-atelier-muted dark:text-nova-muted">
            {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2 text-xs text-atelier-muted dark:text-nova-muted font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Vault Policy: Encrypted at rest. Never echoed in full.</span>
          </div>
          <div className="flex gap-3">
            <button onClick={handleTestConnection} disabled={testing || !geminiKey} className="px-4 py-2 rounded-lg border border-nova-cyan/50 text-nova-cyan font-mono text-xs flex items-center gap-1.5 disabled:opacity-50">
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Test Connection
            </button>
            <button className="px-5 py-2 rounded-lg bg-nova-cyan text-black font-mono font-medium text-xs">Save Key</button>
          </div>
        </div>
        {testResult && (
          <div className={`p-4 rounded-xl border text-xs font-mono ${testResult.status === "OK" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-300"}`}>
            <div className="font-bold mb-1">Status: {testResult.status}</div>
            <div>{testResult.message}</div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl glass-panel border space-y-4">
        <h3 className="font-bold text-base">Deterministic Core Routing Table</h3>
        <div className="divide-y divide-atelier-border/50 dark:divide-nova-border/50">
          {models.map((m, idx) => (
            <div key={m.id} className="py-2.5 flex justify-between text-xs font-mono">
              <span className="text-nova-cyan font-bold">0{idx + 1} {m.id}</span>
              <span className="text-atelier-muted dark:text-nova-muted">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
