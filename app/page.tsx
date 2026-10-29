"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Play } from "lucide-react";

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#040B15] text-[#E6F7FB] selection:bg-[#00E5FF]/20 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#00E5FF]/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-5 pb-2 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 select-none">
          <img 
            src="/logo.png" 
            alt="Nova AI" 
            className="w-8 h-8 rounded-lg object-contain drop-shadow-[0_0_14px_rgba(0,229,255,0.6)]" 
          />
          <span className="font-black tracking-widest text-lg font-mono text-white drop-shadow-[0_0_14px_rgba(0,229,255,0.5)]">
            NOVA AI
          </span>
        </div>
      </header>

      {/* Hero Section - Directly under Header */}
      <section className="px-6 pt-3 pb-16 max-w-5xl mx-auto text-center flex flex-col items-center z-10 w-full">
        {/* Full Form Header */}
        <div className="flex flex-col items-center justify-center mb-4 select-none">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <span className="hidden sm:inline-block h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#00E5FF]/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
            <span className="hidden sm:inline-block h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#00E5FF]/70" />
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-mono font-black tracking-[0.22em] sm:tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-slate-100 to-sky-400 drop-shadow-[0_0_24px_rgba(0,229,255,0.65)] text-center uppercase px-4 leading-relaxed">
            NEURAL OPERATIONS &amp; VIRTUAL AUTOMATION
          </h2>
        </div>

        {/* Kinetic Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 leading-tight">
          AI that fits your workflow. <br />
          <span className="bg-gradient-to-r from-[#00E5FF] via-[#00F5A0] to-[#00E5FF] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,245,160,0.35)]">
            Control that stays yours.
          </span>
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-400 font-sans max-w-2xl mx-auto mb-7 leading-relaxed">
          Connect multi-tier LLM models, manage on-device Ghost Protocol automations, and sync offline Gmail summaries from one secure control plane.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
          <Link
            href="/overview"
            className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl bg-[#00E5FF] hover:bg-[#33ECFF] active:scale-95 text-[#04080E] font-mono text-sm sm:text-base font-extrabold tracking-wider shadow-[0_0_28px_rgba(0,229,255,0.55)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Open Control Plane</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <a
            href="/NovaAI.apk"
            download
            className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl bg-[#0D1726] hover:bg-[#122238] active:scale-95 border border-[#1C3A5A] hover:border-[#00E5FF]/60 text-white font-mono text-sm sm:text-base font-bold tracking-wider shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Download className="w-5 h-5 text-[#00E5FF]" />
            <span>Download Nova APK</span>
          </a>
        </div>

        {/* 16:9 Cinematic Video Frame */}
        <div className="w-full max-w-3xl rounded-2xl bg-[#071220]/80 border border-[#00E5FF]/30 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,229,255,0.15)] backdrop-blur-xl relative flex flex-col justify-between aspect-video">
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-cyan-400">
            <span className="px-2.5 py-1 rounded bg-[#0A1A2E] border border-cyan-500/30">AUDIO: ON</span>
            <span className="px-2.5 py-1 rounded bg-[#0A1A2E] border border-cyan-500/30">REPLAY</span>
            <span className="px-2.5 py-1 rounded bg-[#0A1A2E] border border-cyan-500/30">FULL</span>
          </div>

          <div className="flex flex-col items-center justify-center my-auto cursor-pointer group" onClick={() => setIsPlaying(!isPlaying)}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/60 flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.4)] group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#00E5FF] fill-[#00E5FF] ml-1" />
            </div>
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 mt-4 uppercase">
              INITIALIZE KINETIC FILM // 70S
            </span>
          </div>

          <div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div className="w-0 h-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
            </div>
            <div className="flex items-center justify-end text-[10px] font-mono text-slate-500">
              <span>0.0 / 70.0</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl flex items-center justify-between text-[10px] font-mono text-cyan-500/60 mt-3 px-2">
          <span>INTERACTIVE 60FPS PROCEDURAL ENGINE</span>
          <span>70.0s TIMELINE // 16:9 VIEWPORT</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 mt-auto text-center text-[11px] font-mono text-slate-600">
        NOVA AI OS CORE &bull; CLOUD VAULT SECURED
      </footer>
    </div>
  );
}
