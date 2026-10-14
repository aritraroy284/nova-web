"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Smartphone, Radio, ArrowRight, Download, Lock } from "lucide-react";

export default function LandingPage() {
  const [apkTooltip, setApkTooltip] = useState(false);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nova-cyan/10 border border-nova-cyan/30 flex items-center justify-center font-mono font-bold text-nova-cyan">N</div>
          <span className="font-mono font-bold tracking-widest text-lg">NOVA AI</span>
        </div>
        <Link href="/overview" className="px-4 py-2 text-sm font-mono font-medium rounded-lg bg-nova-cyan text-black hover:opacity-90 transition">
          Launch Console
        </Link>
      </header>

      <section className="px-6 py-20 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-nova-cyan/30 bg-nova-cyan/5 text-xs font-mono text-nova-cyan mb-8">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>AUTONOMOUS ON-DEVICE CO-PILOT PLATFORM</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          AI that fits your workflow. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-nova-cyan">Control that stays yours.</span>
        </h1>
        <p className="max-w-2xl text-base text-atelier-muted dark:text-nova-muted mb-10">
          Connect multi-tier LLM models, manage on-device Ghost Protocol automations, and sync offline Gmail summaries from one secure control plane.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/overview" className="px-6 py-3.5 rounded-xl bg-nova-cyan text-black font-mono font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition">
            Open Control Plane <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="relative">
            <button onClick={() => { setApkTooltip(true); setTimeout(() => setApkTooltip(false), 3000); }} className="px-6 py-3.5 rounded-xl border border-atelier-border dark:border-nova-border font-mono text-sm flex items-center gap-2 text-atelier-muted dark:text-nova-muted opacity-80">
              <Download className="w-4 h-4" /> Download Nova APK
            </button>
            {apkTooltip && <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-nova-card border border-nova-border rounded text-xs font-mono text-nova-cyan whitespace-nowrap shadow-xl">Release testing • Coming Soon</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
