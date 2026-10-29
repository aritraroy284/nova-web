"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ExternalLink 
} from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-5">
      {/* HEADER SECTION */}
      <div className="flex flex-row items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
            Workspace Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Your workspace, providers and connected tools at a glance.
          </p>
        </div>

        {/* Clean Single Live Status Capsule */}
        <div className="live-status-pill shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00F5A0]/10 border border-[#00F5A0]/35 shadow-[0_0_12px_rgba(0,245,160,0.25)] select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F5A0] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F5A0] shadow-[0_0_6px_#00F5A0]"></span>
          </span>
          <span className="live-status-text text-[11px] font-mono font-bold tracking-widest text-[#00F5A0] uppercase">
            LIVE STATUS
          </span>
        </div>
      </div>

      {/* TOP ROW: CORE AGENT & ACTION ITEM (Exact Image 2 Font Hierarchy) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core Agent Online Card */}
        <div className="nova-card md:col-span-2 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0]"></span>
                <h2 className="text-sm sm:text-base font-bold font-sans text-white">
                  Core Agent Online
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/40 border border-slate-700/50 uppercase">
                SHIELDED BUILD
              </span>
            </div>
            <p className="text-xs font-sans text-slate-400 leading-relaxed mb-4">
              Autonomous mobile runtime is calibrated. Ready to process multi-tier cognitive queries, voice commands, and Ghost Protocol automations.
            </p>
          </div>

          <div className="pt-3 border-t border-[#16273A] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
            <span className="text-slate-400">Latency: <span className="text-white font-bold">12ms</span></span>
            <span className="text-slate-400">Vault: <span className="stat-cyan text-[#00E5FF] font-bold">Synced</span></span>
            <span className="text-slate-400">Security: <span className="stat-green text-[#00F5A0] font-bold">Zero-Secret</span></span>
          </div>
        </div>

        {/* Action Item Card */}
        <div className="nova-card md:col-span-1 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase block mb-1.5">
              ACTION ITEM
            </span>
            <h3 className="text-sm font-bold font-sans text-white mb-2">
              Next Recommended Step
            </h3>
            <p className="text-xs font-sans text-slate-400 leading-relaxed">
              Manage your Gemini, Groq, and OpenRouter API credentials to guarantee uninterrupted fallback.
            </p>
          </div>

          <Link
            href="/api-models"
            className="btn-dark-action w-full py-2.5 px-4 rounded-xl font-sans text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>Configure Keys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* PROVIDERS STATUS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="nova-card p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]"></span>
            <div>
              <p className="text-xs font-sans font-bold text-white">Gemini</p>
              <p className="text-[10px] font-sans text-slate-400">Primary provider</p>
            </div>
          </div>
          <span className="badge-primary text-[10px] font-mono font-bold text-[#00F5A0] bg-[#00F5A0]/10 border border-[#00F5A0]/30 px-2 py-0.5 rounded">
            PRIMARY
          </span>
        </div>

        <div className="nova-card p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <div>
              <p className="text-xs font-sans font-bold text-white">Groq</p>
              <p className="text-[10px] font-sans text-slate-400">Fallback provider</p>
            </div>
          </div>
          <span className="badge-standby text-[10px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/50 px-2 py-0.5 rounded">
            STANDBY
          </span>
        </div>

        <div className="nova-card p-3.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <div>
              <p className="text-xs font-sans font-bold text-white">OpenRouter</p>
              <p className="text-[10px] font-sans text-slate-400">Additional models</p>
            </div>
          </div>
          <span className="badge-standby text-[10px] font-mono text-slate-400 bg-slate-800/40 border border-slate-700/50 px-2 py-0.5 rounded">
            STANDBY
          </span>
        </div>
      </div>

      {/* BOTTOM ROW: WORKSPACE ACTIVITY & QUICK ACCESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="nova-card p-5 rounded-2xl">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-3">
            WORKSPACE ACTIVITY
          </span>
          <ul className="space-y-2.5 text-xs font-sans text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Ghost Protocol UI automation pipeline verified</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Cloud Vault cryptographic handshake established</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>APK binary shielded against credential extraction</span>
            </li>
          </ul>
        </div>

        <div className="nova-card p-5 rounded-2xl flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block mb-3">
            QUICK ACCESS
          </span>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/api-models"
              className="quick-btn p-3 rounded-xl transition-colors flex items-center justify-between text-xs font-sans"
            >
              <span>API & Models</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
            <Link
              href="/plugins"
              className="quick-btn p-3 rounded-xl transition-colors flex items-center justify-between text-xs font-sans"
            >
              <span>Plugins Hub</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </Link>
          </div>
          <Link
            href="/guide"
            className="quick-btn mt-3 p-3 rounded-xl transition-colors flex items-center justify-between text-xs font-sans"
          >
            <span>Architecture & System Guide</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
