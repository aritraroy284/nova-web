"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Download, Clock } from "lucide-react";

const triggerFilmPlay = () => {
  try {
    const iframe = document.getElementById("filmIframe") as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage("PLAY", "*");
    }
  } catch (e) {}
};

export default function LandingPage() {
  const [comingSoonToast, setComingSoonToast] = useState(false);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);

  useEffect(() => {
    let lastH = 0;
    const onMsg = (e: MessageEvent) => {
      if (e && e.data && e.data.type === "RESIZE_SLIDES" && typeof e.data.height === "number") {
        const h = Math.ceil(e.data.height);
        if (Math.abs(h - lastH) > 10) {
          lastH = h;
          setIframeHeight(h);
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonToast(true);
    setTimeout(() => setComingSoonToast(false), 3500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060B11] text-[#e6f7fb] overflow-x-hidden">
      <style jsx global>{`
        @keyframes kineticHeroIn {
          0% {
            opacity: 0;
            transform: translateY(22px) scale(0.96);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0px);
          }
        }
        @keyframes chipFade {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-hero-kinetic {
          animation: kineticHeroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-chip {
          animation: chipFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
      <section data-hz="hero" className="relative px-4 sm:px-6 pt-8 sm:pt-14 pb-12 max-w-5xl mx-auto text-center flex flex-col items-center z-10 w-full animate-hero-kinetic">
        
        {/* Desktop Floating Badges */}
        <span className="hidden md:block absolute left-2 top-24 font-mono text-[11px] text-[#00E5FF] border border-[#1C3A5A] bg-[#07101F]/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-[0_0_14px_rgba(0,229,255,0.2)] select-none">
          [ CORE: ACTIVE ]
        </span>
        <span className="hidden md:block absolute right-2 top-40 font-mono text-[11px] text-[#00F5A0] border border-[#1C3A5A] bg-[#07101F]/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-[0_0_14px_rgba(0,245,160,0.2)] select-none">
          LATENCY 12ms
        </span>
        <span className="hidden md:block absolute left-6 top-[18rem] font-mono text-[11px] text-[#FFB300] border border-[#1C3A5A] bg-[#07101F]/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-[0_0_14px_rgba(255,179,0,0.2)] select-none">
          ARCH: 64-BIT
        </span>

        {/* Mobile-Only Telemetry HUD Bar */}
        <div className="flex md:hidden items-center justify-center gap-2 mb-5 animate-chip select-none flex-wrap">
          <span className="font-mono text-[10px] text-[#00E5FF] border border-[#1C3A5A] bg-[#07101F] rounded-md px-2.5 py-1 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
            [ CORE: ACTIVE ]
          </span>
          <span className="font-mono text-[10px] text-[#00F5A0] border border-[#1C3A5A] bg-[#07101F] rounded-md px-2.5 py-1 shadow-[0_0_8px_rgba(0,245,160,0.2)]">
            12ms
          </span>
          <span className="font-mono text-[10px] text-[#FFB300] border border-[#1C3A5A] bg-[#07101F] rounded-md px-2.5 py-1 shadow-[0_0_8px_rgba(255,179,0,0.2)]">
            64-BIT
          </span>
        </div>

        {/* Neural Operations & Virtual Automation Cyber Badge */}
        <div data-hz="badge" className="flex flex-col items-center justify-center mb-6 select-none">
          <div className="flex items-center gap-3 sm:gap-4 mb-2.5">
            <span className="h-[1px] w-8 sm:w-20 bg-gradient-to-r from-transparent to-[#00E5FF]/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-pulse" />
            <span className="h-[1px] w-8 sm:w-20 bg-gradient-to-l from-transparent to-[#00E5FF]/70" />
          </div>
          <h2 className="text-[11px] sm:text-sm md:text-base font-mono font-black tracking-[0.2em] sm:tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-slate-100 to-sky-400 drop-shadow-[0_0_24px_rgba(0,229,255,0.65)] text-center uppercase px-2 leading-relaxed">
            NEURAL OPERATIONS &amp; VIRTUAL AUTOMATION
          </h2>
        </div>

        {/* Main Headline */}
        <div data-hz="title" className="w-full">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            AI that fits your workflow. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-[#00E5FF] to-[#00F5A0] drop-shadow-[0_0_28px_rgba(0,229,255,0.4)]">
              Control that stays yours.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p data-hz="sub" className="max-w-2xl text-xs sm:text-base text-[#7d95a6] mb-8 leading-relaxed font-sans px-2">
          Connect multi-tier LLM models, manage on-device Ghost Protocol automations, and sync offline Gmail summaries from one secure control plane.
        </p>

        {/* Action Buttons */}
        <div data-hz="cta" className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-10 relative">
          <Link
            href="/overview"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00E5FF] hover:bg-[#33ECFF] active:scale-95 text-[#04080E] font-mono text-xs sm:text-sm font-bold tracking-wider shadow-[0_0_22px_rgba(0,229,255,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Open Control Plane</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0D1726] hover:bg-[#122238] active:scale-95 border border-[#1C3A5A] hover:border-[#00E5FF]/60 text-white font-mono text-xs sm:text-sm font-semibold tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00E5FF]" />
            <span>{comingSoonToast ? "Staging // Coming Soon" : "Download Nova APK"}</span>
          </button>

          {comingSoonToast && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#071321] border border-cyan-400/50 shadow-[0_0_16px_rgba(0,229,255,0.4)] text-[11px] font-mono text-cyan-300 flex items-center gap-2 animate-bounce select-none whitespace-nowrap z-30">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public APK v1.0 Coming Soon // Staging Build Active</span>
            </div>
          )}
        </div>

        {/* Procedural Film Viewport */}
        <div className="w-full max-w-4xl mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-[#00F5A0]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700 pointer-events-none" />
            <div 
              className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#00E5FF]/30 bg-[#060B11] shadow-[0_0_50px_rgba(0,229,255,0.15)] cursor-pointer" 
              onClick={triggerFilmPlay}
            >
              <iframe 
                id="filmIframe" 
                src="/film/index.html" 
                allow="autoplay; fullscreen" 
                style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }} 
                className="w-full h-full border-0" 
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#7d95a6] px-2">
            <span className="flex items-center gap-1.5 text-[#00E5FF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
              INTERACTIVE 60FPS PROCEDURAL ENGINE
            </span>
            <span>70.0s TIMELINE // 16:9 VIEWPORT</span>
          </div>
        </div>
      </section>

      {/* 10-Slide Showcase Container */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-12 flex flex-col items-center z-10">
        <div className="flex items-center gap-3 mb-8 select-none">
          <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#00E5FF]/70" />
          <span className="font-mono text-xs sm:text-sm font-bold tracking-[0.25em] text-cyan-300 uppercase">
            ARCHITECTURAL SHOWCASE // 10 SLIDES
          </span>
          <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#00E5FF]/70" />
        </div>

        <div className="w-full">
          <iframe 
            src="/slides.html" 
            style={{ height: iframeHeight ? `${iframeHeight}px` : "2000px" }}
            className="w-full border-0 block bg-transparent" 
            title="Nova AI Product Showcase"
            scrolling="no"
          />
        </div>
      </section>
    </div>
  );
}
