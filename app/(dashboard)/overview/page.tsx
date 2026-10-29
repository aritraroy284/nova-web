"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Workspace Overview</h1>
          <p className="text-xs md:text-sm text-[#8E9DAE] mt-1">Your workspace, providers and connected tools at a glance.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F5A0]/10 border border-[#00F5A0]/30 text-[#00F5A0] text-xs font-mono font-semibold tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0] animate-pulse"></span>
          <div className="flex items-center gap-2.5">
        <button id="themeToggleBtn" type="button" onClick={() => { if(typeof document !== "undefined") { const isL = document.documentElement.classList.toggle("light-theme"); localStorage.setItem("nova_theme", isL ? "light" : "dark"); } }} className="px-3 py-1 rounded-full border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 text-xs font-mono font-medium hover:bg-cyan-900/50 hover:border-cyan-400/60 transition-all flex items-center gap-1.5 cursor-pointer select-none z-50 pointer-events-auto shadow-[0_0_10px_rgba(0,229,255,0.15)]" title="Toggle Light / Dark Mode"><span>☀️/🌙</span><span className="hidden sm:inline">THEME</span></button>
        <span>LIVE STATUS</span>
      </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-[#0D1520] border border-[#1E3045] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] shadow-[0_0_8px_#00F5A0]"></span>
                <h2 className="text-base font-semibold text-white tracking-wide">Core Agent Online</h2>
              </div>
              <span className="text-[10px] font-mono text-[#8E9DAE] uppercase bg-[#142030] px-2 py-0.5 rounded border border-[#1E3045]">Shielded Build</span>
            </div>
            <p className="text-xs text-[#8E9DAE] max-w-lg leading-relaxed">
              Autonomous mobile runtime is calibrated. Ready to process multi-tier cognitive queries, voice commands, and Ghost Protocol automations.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-[#1E3045]/60 flex flex-wrap items-center gap-4 text-[11px] font-mono text-[#8E9DAE]">
            <span>Latency: <strong className="text-white">12ms</strong></span>
            <span>Vault: <strong className="text-[#00E5FF]">Synced</strong></span>
            <span>Security: <strong className="text-[#00F5A0]">Zero-Secret</strong></span>
          </div>
        </div>

        <div className="bg-[#0D1520] border border-[#1E3045] rounded-2xl p-5 flex flex-col justify-between hover:border-[#00E5FF]/40 transition-colors">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF]">Action Item</span>
            <h3 className="text-sm font-semibold text-white mt-1">Next Recommended Step</h3>
            <p className="text-xs text-[#8E9DAE] mt-2 leading-relaxed">Manage your Gemini, Groq, and OpenRouter API credentials to guarantee uninterrupted fallback.</p>
          </div>
          <Link href="/api-models" className="mt-4 w-full py-2.5 bg-[#142030] hover:bg-[#00E5FF] hover:text-[#060B11] border border-[#1E3045] hover:border-[#00E5FF] rounded-xl text-xs font-mono font-bold text-white transition-all text-center flex items-center justify-center gap-1.5">
            <span>Configure Keys</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#0D1520] border border-[#1E3045] rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
            <div>
              <div className="text-xs font-semibold text-white">Gemini</div>
              <div className="text-[10px] text-[#8E9DAE]">Primary provider</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#00F5A0] bg-[#00F5A0]/10 px-2 py-0.5 rounded border border-[#00F5A0]/20 font-semibold">PRIMARY</span>
        </div>
        <div className="bg-[#0D1520] border border-[#1E3045] rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8E9DAE]"></span>
            <div>
              <div className="text-xs font-semibold text-white">Groq</div>
              <div className="text-[10px] text-[#8E9DAE]">Fallback provider</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#8E9DAE] bg-[#142030] px-2 py-0.5 rounded border border-[#1E3045]">STANDBY</span>
        </div>
        <div className="bg-[#0D1520] border border-[#1E3045] rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8E9DAE]"></span>
            <div>
              <div className="text-xs font-semibold text-white">OpenRouter</div>
              <div className="text-[10px] text-[#8E9DAE]">Additional models</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#8E9DAE] bg-[#142030] px-2 py-0.5 rounded border border-[#1E3045]">STANDBY</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0D1520] border border-[#1E3045] rounded-2xl p-5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8E9DAE] mb-3">Workspace Activity</h3>
          <ul className="space-y-2.5 text-xs text-[#8E9DAE]">
            <li className="flex items-center gap-2"><span className="text-[#00E5FF]">•</span><span>Ghost Protocol UI automation pipeline verified</span></li>
            <li className="flex items-center gap-2"><span className="text-[#00E5FF]">•</span><span>Cloud Vault cryptographic handshake established</span></li>
            <li className="flex items-center gap-2"><span className="text-[#00E5FF]">•</span><span>APK binary shielded against credential extraction</span></li>
          </ul>
        </div>
        <div className="bg-[#0D1520] border border-[#1E3045] rounded-2xl p-5">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8E9DAE] mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/api-models" className="p-2.5 rounded-xl bg-[#142030] hover:bg-[#1E3045] text-left text-white font-medium border border-[#1E3045]/60 transition-colors flex items-center justify-between">
              <span>API & Models</span><span className="text-[#00E5FF]">→</span>
            </Link>
            <Link href="/plugins" className="p-2.5 rounded-xl bg-[#142030] hover:bg-[#1E3045] text-left text-white font-medium border border-[#1E3045]/60 transition-colors flex items-center justify-between">
              <span>Plugins Hub</span><span className="text-[#00E5FF]">→</span>
            </Link>
            <Link href="/guide" className="col-span-2 p-2.5 rounded-xl bg-[#142030] hover:bg-[#1E3045] text-left text-white font-medium border border-[#1E3045]/60 transition-colors flex items-center justify-between">
              <span>Architecture & System Guide</span><span className="text-[#00E5FF]">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
