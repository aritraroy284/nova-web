"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Clock 
} from "lucide-react";

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(70);
  const [hasVideoSource, setHasVideoSource] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  // Check if a real video file exists in public/
  useEffect(() => {
    fetch("/film.mp4", { method: "HEAD" })
      .then((res) => {
        if (res.ok) setHasVideoSource(true);
      })
      .catch(() => setHasVideoSource(false));
  }, []);

  // 60FPS Procedural Canvas Engine (Active when playing without raw MP4)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      // Dark sci-fi grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 36) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (isPlaying) {
        tick += 0.05;

        // Animated Central Reactor Waves
        for (let r = 20; r < 140; r += 24) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.45 - r / 300})`;
          ctx.lineWidth = 2;
          const offset = Math.sin(tick + r) * 12;
          ctx.arc(cx, cy, r + offset, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Kinetic Frequency Spectrum Bars at bottom
        const bars = 32;
        const barWidth = w / (bars * 1.6);
        for (let i = 0; i < bars; i++) {
          const barH = Math.abs(Math.sin(tick * 1.5 + i * 0.4)) * 55 + 10;
          const bx = cx - (bars * barWidth * 1.2) / 2 + i * barWidth * 1.2;
          const by = h - 60 - barH;

          ctx.fillStyle = i % 2 === 0 ? "rgba(0, 229, 255, 0.65)" : "rgba(0, 245, 160, 0.65)";
          ctx.fillRect(bx, by, barWidth, barH);
        }

        // Glowing center core
        ctx.beginPath();
        ctx.fillStyle = "rgba(0, 229, 255, 0.85)";
        ctx.shadowColor = "#00E5FF";
        ctx.shadowBlur = 18;
        ctx.arc(cx, cy, 14 + Math.sin(tick * 3) * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying]);

  // Procedural Timeline Clock
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.min(duration, +(prev + 0.1).toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    if (hasVideoSource && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentTime(0);
    if (hasVideoSource && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
    setIsPlaying(true);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!frameContainerRef.current) return;
    if (!document.fullscreenElement) {
      frameContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setComingSoonToast(true);
    setTimeout(() => setComingSoonToast(false), 3500);
  };

  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  return (
    <div className="min-h-screen bg-[#040B15] text-[#E6F7FB] selection:bg-[#00E5FF]/20 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#00E5FF]/10 to-transparent blur-[120px] pointer-events-none" />

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
        {/* Full Form Title */}
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

        {/* Kinetic Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.3] sm:leading-[1.22]">
          AI that fits your workflow. <br className="hidden sm:inline" />
          <span className="inline-block mt-2 bg-gradient-to-r from-[#00E5FF] via-[#00F5A0] to-[#00E5FF] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,245,160,0.35)]">
            Control that stays yours.
          </span>
        </h1>

        {/* Description Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-slate-400 font-sans max-w-2xl mx-auto mb-10 leading-relaxed sm:leading-loose">
          Connect multi-tier LLM models, manage on-device Ghost Protocol automations, and sync offline Gmail summaries from one secure control plane.
        </p>

        {/* Refined CTA Buttons & Coming Soon Toast */}
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

          {/* Floating Coming Soon Cyber Badge */}
          {comingSoonToast && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[#071321] border border-cyan-400/50 shadow-[0_0_16px_rgba(0,229,255,0.4)] text-[11px] font-mono text-cyan-300 flex items-center gap-2 animate-bounce select-none whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Public APK v1.0 Coming Soon // Staging Build Active</span>
            </div>
          )}
        </div>

        {/* 16:9 Interactive Cinematic Video Frame */}
        <div 
          ref={frameContainerRef}
          onClick={togglePlay}
          className="w-full max-w-3xl rounded-2xl bg-[#071220]/90 border border-[#00E5FF]/35 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,229,255,0.18)] backdrop-blur-xl relative flex flex-col justify-between aspect-video overflow-hidden cursor-pointer group select-none"
        >
          {/* HTML5 Video Element (If film.mp4 exists in public) */}
          {hasVideoSource && (
            <video
              ref={videoRef}
              src="/film.mp4"
              playsInline
              muted={isMuted}
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(+videoRef.current.currentTime.toFixed(1));
                  if (videoRef.current.duration) setDuration(+videoRef.current.duration.toFixed(1));
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Canvas Procedural 60FPS Engine Layer */}
          <canvas
            ref={canvasRef}
            width={854}
            height={480}
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${
              hasVideoSource && isPlaying ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Top Frame Controls */}
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-cyan-400 z-10">
            <button
              type="button"
              onClick={toggleMute}
              className="px-2.5 py-1 rounded bg-[#0A1A2E]/90 hover:bg-[#0E2540] border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-slate-400" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
              <span>AUDIO: {isMuted ? "MUTED" : "ON"}</span>
            </button>

            <button
              type="button"
              onClick={handleReplay}
              className="px-2.5 py-1 rounded bg-[#0A1A2E]/90 hover:bg-[#0E2540] border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>REPLAY</span>
            </button>

            <button
              type="button"
              onClick={toggleFullScreen}
              className="px-2.5 py-1 rounded bg-[#0A1A2E]/90 hover:bg-[#0E2540] border border-cyan-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Maximize className="w-3 h-3" />
              <span>FULL</span>
            </button>
          </div>

          {/* Center Play / Pause Indicator */}
          <div className="flex flex-col items-center justify-center my-auto z-10">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/70 flex items-center justify-center shadow-[0_0_26px_rgba(0,229,255,0.5)] transition-all duration-300 ${
              isPlaying ? "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100" : "opacity-100 scale-100"
            }`}>
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 text-[#00E5FF] fill-[#00E5FF]" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#00E5FF] fill-[#00E5FF] ml-1" />
              )}
            </div>
            
            <span className={`text-[10px] sm:text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 mt-4 uppercase transition-opacity duration-300 ${
              isPlaying ? "opacity-0 group-hover:opacity-80" : "opacity-100"
            }`}>
              {isPlaying ? "KINETIC FILM STREAMING // TAP TO PAUSE" : "INITIALIZE KINETIC FILM // 70S"}
            </span>
          </div>

          {/* Bottom Progress Bar & Real Time Tracking */}
          <div className="z-10">
            <div className="w-full h-1.5 bg-slate-900/80 border border-slate-800 rounded-full overflow-hidden mb-2 relative">
              <div 
                className="h-full bg-gradient-to-r from-[#00E5FF] to-[#00F5A0] shadow-[0_0_10px_#00E5FF] transition-all duration-100"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
              <span className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-[#00F5A0] animate-pulse" : "bg-slate-500"}`} />
                <span>{isPlaying ? "PLAYING" : "STANDBY"}</span>
              </span>
              <span>{currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Frame Sub-labels */}
        <div className="w-full max-w-3xl flex items-center justify-between text-[10px] font-mono text-cyan-500/60 mt-3 px-2">
          <span>INTERACTIVE 60FPS PROCEDURAL ENGINE</span>
          <span>70.0s TIMELINE // 16:9 VIEWPORT</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] font-mono text-slate-600">
        NOVA AI OS CORE &bull; CLOUD VAULT SECURED
      </footer>
    </div>
  );
}
