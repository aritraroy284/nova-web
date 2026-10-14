"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, Key, ShieldCheck, Mail } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-[#1C2A3D]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Overview</h1>
          <p className="text-sm opacity-70 mt-1">Control plane for Nova AI core routing, provider credentials, and tools.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Core Agent Online</span>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-[#00E5FF]/40 bg-[#00E5FF]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono text-[#00E5FF] uppercase tracking-wider font-bold">Next Recommended Step</div>
          <h3 className="text-lg font-bold mt-1">Configure Primary Gemini API Key</h3>
          <p className="text-sm opacity-80 max-w-xl mt-1">Nova Cortex requires a Gemini API key to power conversational reasoning, speech synthesis, and UI automation.</p>
        </div>
        <Link href="/api-models" className="px-5 py-2.5 rounded-xl bg-[#00E5FF] text-black font-mono font-medium text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition shrink-0">
          <Key className="w-4 h-4" /> Manage API Keys
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl border bg-white dark:bg-[#0F1A29] border-black/10 dark:border-[#1C2A3D] shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10">PRIMARY</span>
            <span className="text-xs text-amber-500 flex items-center gap-1 font-mono"><AlertCircle className="w-3.5 h-3.5" /> Needs Setup</span>
          </div>
          <h4 className="font-bold text-base">Gemini Flash Models</h4>
          <p className="text-xs opacity-70 mt-1">3.5 Flash-Lite &rarr; 3.1 Flash-Lite &rarr; 3.7 Flash &rarr; 3.5 Flash</p>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-[#0F1A29] border-black/10 dark:border-[#1C2A3D] shadow-sm">
          <span className="font-mono text-xs opacity-70 px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">BACKUP 1</span>
          <h4 className="font-bold text-base mt-2">Groq Qwen 27B</h4>
          <p className="text-xs opacity-70 mt-1">High-speed token fallback when primary rates exceed capacity.</p>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-[#0F1A29] border-black/10 dark:border-[#1C2A3D] shadow-sm">
          <span className="font-mono text-xs opacity-70 px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">BACKUP 2</span>
          <h4 className="font-bold text-base mt-2">OpenRouter Free</h4>
          <p className="text-xs opacity-70 mt-1">Deep general cognitive fallback route.</p>
        </div>
      </div>
    </div>
  );
}
