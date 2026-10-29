"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Radio, ArrowRight, Download, Play } from "lucide-react";


  const triggerFilmPlay = () => {
    try {
      const iframe = document.getElementById("filmIframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage("PLAY", "*");
      }
    } catch (e) {}
  };

export default function LandingPage() {
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
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#060B11]/80 px-6 py-4 flex items-center justify-between border-b border-[#1E3045]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 border border-nova-cyan/30 flex items-center justify-center font-mono font-bold text-nova-cyan shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            N
          </div>
          <span className="font-mono font-bold tracking-widest text-lg text-white">NOVA AI</span>
        </div>
        <Link
          href="/overview"
          className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-nova-cyan text-black hover:opacity-90 transition shadow-[0_0_15px_rgba(0,229,255,0.25)] uppercase tracking-wider"
        >
          Launch Console ↗
        </Link>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-24 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Full Form Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-nova-cyan/30 bg-nova-cyan/5 text-xs font-mono text-nova-cyan mb-8 tracking-wider">
          <Radio className="w-3.5 h-3.5 animate-pulse text-nova-cyan" />
          <span>NEURAL OPERATIONS & VIRTUAL AUTOMATION (NOVA)</span>
        </div>

        {/* Kinetic Headline */}
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          <Link
            href="/overview"
            className="px-6 py-3.5 rounded-xl bg-nova-cyan text-black font-mono font-semibold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.3)] hover:scale-105 transition"
          >
            Open Control Plane <ArrowRight className="w-4 h-4" />
          </Link>

          <div className="relative">
            <button
              onClick={() => {
                setApkTooltip(true);
                setTimeout(() => setApkTooltip(false), 3000);
              }}
              className="px-6 py-3.5 rounded-xl border border-[#1E3045] bg-[#0B1620]/60 hover:border-nova-cyan/40 font-mono text-sm flex items-center gap-2 text-[#7d95a6] hover:text-white transition"
            >
              <Download className="w-4 h-4" /> Download Nova APK
            </button>
            {apkTooltip && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0D1520] border border-nova-cyan/40 rounded text-xs font-mono text-nova-cyan whitespace-nowrap shadow-xl">
                Release testing • Coming Soon
              </div>
            )}
          </div>
        </div>

        {/* 16:9 Cinematic Motion Film Frame */}
        <div className="w-full max-w-4xl relative group">
          {/* Ambient Glow Backplate */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-nova-cyan/20 to-[#00F5A0]/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />

          {/* Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-nova-cyan/30 bg-[#060B11] shadow-[0_0_50px_rgba(0,229,255,0.12)]" onClick={triggerFilmPlay} >
            <iframe id="filmIframe" allow="autoplay; fullscreen" style={{ pointerEvents: "auto", position: "relative", zIndex: 30 }} allow="autoplay; fullscreen" style={{ pointerEvents: "auto", position: "relative", zIndex: 30 }} allow="autoplay; fullscreen" style={{ pointerEvents: "auto", position: "relative", zIndex: 20 }} src="/film/index.html"
              className="w-full h-full border-0"
              title="NOVA AI Product Film"
              allow="autoplay; fullscreen"
            />
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
