"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radio, ArrowRight, Download, Play, Clock } from "lucide-react";


  const triggerFilmPlay = () => {
    try {
      const iframe = (document.getElementById("filmIframe") as HTMLIFrameElement | null);
      if (iframe && (iframe as HTMLIFrameElement).contentWindow) {
        (iframe as HTMLIFrameElement).contentWindow!.postMessage("PLAY", "*");
      }
    } catch (e) {}
  };

export default function LandingPage() {

  const [comingSoonToast, setComingSoonToast] = useState(false);
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonToast(true);
    setTimeout(() => setComingSoonToast(false), 3500);
  };

  const [apkTooltip, setApkTooltip] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#060B11] text-[#e6f7fb]">
      <style jsx global>{`
        @keyframes kineticShrink {
          0% {
            transform: scale(1.18);
            filter: blur(6px);
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            filter: blur(0px);
            opacity: 1;
          }
        }
        .animate-kinetic-shrink {
          animation: kineticShrink 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, filter, opacity;
        }
      `}</style>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between z-20">
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

      {/* Hero Section */}
      <section className="px-6 pt-10 sm:pt-14 pb-16 max-w-5xl mx-auto text-center flex flex-col items-center z-10 w-full">
        {/* Full Form Cyber Title with Accent Lines */}
        <div className="flex flex-col items-center justify-center mb-6 select-none">
          <div className="flex items-center gap-3 sm:gap-4 mb-2.5">
            <span className="hidden sm:inline-block h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#00E5FF]/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
            <span className="hidden sm:inline-block h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#00E5FF]/70" />
          </div>
          <h2 className="text-xs sm:text-sm md:text-base font-mono font-black tracking-[0.24em] sm:tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-slate-100 to-sky-400 drop-shadow-[0_0_24px_rgba(0,229,255,0.65)] text-center uppercase px-4 leading-relaxed">
            NEURAL OPERATIONS &amp; VIRTUAL AUTOMATION
          </h2>
        </div>
<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-kinetic-shrink">
          AI that fits your workflow. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-nova-cyan to-[#00F5A0]">
            Control that stays yours.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base text-[#7d95a6] mb-10 leading-relaxed font-sans">
          Connect multi-tier LLM models, manage on-device Ghost Protocol automations, and sync offline Gmail summaries from one secure control plane.
        </p>

        
        {/* Compact Refined CTA Buttons & Coming Soon Toast */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-12 relative">
          <Link
            href="/overview"
            className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#00E5FF] hover:bg-[#33ECFF] active:scale-95 text-[#04080E] font-mono text-xs sm:text-sm font-bold tracking-wider shadow-[0_0_22px_rgba(0,229,255,0.45)] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <span>Open Control Plane</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-[#0D1726] hover:bg-[#122238] active:scale-95 border border-[#1C3A5A] hover:border-[#00E5FF]/60 text-white font-mono text-xs sm:text-sm font-semibold tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00E5FF]" />
            <span>{comingSoonToast ? "Staging // Coming Soon" : "Download Nova APK"}</span>
          </button>

          {comingSoonToast && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#071321] border border-cyan-400/50 shadow-[0_0_16px_rgba(0,229,255,0.4)] text-[11px] font-mono text-cyan-300 flex items-center gap-2 animate-bounce select-none whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public APK v1.0 Coming Soon // Staging Build Active</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-4xl relative group">
          {/* Ambient Glow Backplate */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-nova-cyan/20 to-[#00F5A0]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />

          {/* Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-nova-cyan/30 bg-[#060B11] shadow-[0_0_50px_rgba(0,229,255,0.12)]" onClick={triggerFilmPlay} >
            <iframe id="filmIframe" src="/film/index.html" allow="autoplay; fullscreen" style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }} className="w-full h-full border-0" />
          </div>

          {/* Telemetry Bar Under Player */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#7d95a6] px-2">
            <span className="flex items-center gap-1.5 text-nova-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-nova-cyan animate-ping" />
              INTERACTIVE 60FPS PROCEDURAL ENGINE
            </span>
            <span>70.0s TIMELINE // 16:9 VIEWPORT</span>
          </div>
        </div>
      </section>
    </div>
  );
}
