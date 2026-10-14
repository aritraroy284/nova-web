"use client";
import React from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, Key } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-atelier-border dark:border-nova-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspace Overview</h1>
          <p className="text-sm text-atelier-muted dark:text-nova-muted mt-1">Control plane for Nova AI core routing, provider credentials, and tools.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Core Agent Online</span>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-nova-cyan/30 bg-nova-cyan/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono text-nova-cyan uppercase tracking-wider">Next Step</div>
          <h3 className="text-lg font-bold">Configure Primary Gemini API Key</h3>
          <p className="text-sm text-atelier-muted dark:text-nova-muted max-w-xl">Nova Cortex requires a Gemini API key to power conversational reasoning and tools.</p>
        </div>
        <Link href="/api-models" className="px-5 py-2.5 rounded-xl bg-nova-cyan text-black font-mono font-medium text-sm flex items-center gap-2 shadow-sm hover:opacity-90 transition">
          <Key className="w-4 h-4" /> Manage API Keys
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-panel border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-xs font-bold text-nova-cyan px-2 py-0.5 rounded bg-nova-cyan/10">PRIMARY</span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-mono"><AlertCircle className="w-3.5 h-3.5" /> Needs Setup</span>
          </div>
          <h4 className="font-bold text-base">Gemini Flash Models</h4>
          <p className="text-xs text-atelier-muted dark:text-nova-muted mt-1">3.5 Flash-Lite &rarr; 3.1 Flash-Lite &rarr; 3.7 Flash &rarr; 3.5 Flash</p>
        </div>
        <div className="p-5 rounded-2xl glass-panel border">
          <span className="font-mono text-xs text-atelier-muted dark:text-nova-muted px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">BACKUP 1</span>
          <h4 className="font-bold text-base mt-2">Groq Qwen 27B</h4>
          <p className="text-xs text-atelier-muted dark:text-nova-muted mt-1">High-speed token fallback when primary rates exceed capacity.</p>
        </div>
        <div className="p-5 rounded-2xl glass-panel border">
          <span className="font-mono text-xs text-atelier-muted dark:text-nova-muted px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">BACKUP 2</span>
          <h4 className="font-bold text-base mt-2">OpenRouter Free</h4>
          <p className="text-xs text-atelier-muted dark:text-nova-muted mt-1">Deep general cognitive fallback route.</p>
        </div>
      </div>
    </div>
  );
}
