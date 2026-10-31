import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function getSpeedMetrics(ms: number, status: number) {
  if (status === 429) {
    return { label: "Rate Limited / Throttled", color: "text-amber-400" };
  }
  if (status === 503 || status === 500) {
    return { label: "Server Overloaded (503)", color: "text-red-400" };
  }
  if (ms < 450) {
    return { label: "Optimal / Light Load", color: "text-emerald-400" };
  }
  if (ms <= 1100) {
    return { label: "Moderate Server Load", color: "text-cyan-400" };
  }
  if (ms <= 2500) {
    return { label: "Heavy Load / High Latency", color: "text-amber-400" };
  }
  return { label: "Severe Congestion / Slow", color: "text-red-400" };
}

function getQuotaStatus(status: number) {
  if (status === 200) return "Quota Active (Normal)";
  if (status === 429) return "Quota Exhausted (429 Rate Limit)";
  if (status === 403 || status === 401) return "Auth Denied / Key Invalid";
  if (status === 503) return "Service Unavailable";
  return `Error HTTP ${status}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { geminiKey, groqKey, openRouterKey } = body;

    const results: any = {};

    // 1. REAL TEST: GEMINI MULTI-MODEL PING
    if (geminiKey && geminiKey.trim()) {
      const gKey = geminiKey.trim();
      const geminiModels = [
        { id: "gemini-3.5-flash-lite", role: "Primary Router" },
        { id: "gemini-3.1-flash-lite", role: "Speed Fallback" },
        { id: "gemini-3.7-flash", role: "Deep Cortex" },
        { id: "gemini-3.5-flash", role: "Reasoning Fallback" }
      ];

      const modelDiagnostics = await Promise.all(
        geminiModels.map(async (m) => {
          const start = performance.now();
          let status = 0;
          let details = "OK";
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m.id}:generateContent?key=${gKey}`;
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: "ping" }] }]
              }),
              signal: AbortSignal.timeout(8000)
            });
            status = res.status;
            if (!res.ok) {
              const errJson = await res.json().catch(() => ({}));
              details = errJson?.error?.message || `HTTP ${res.status}`;
            }
          } catch (e: any) {
            status = e.name === "TimeoutError" ? 504 : 500;
            details = e.message || "Network Timeout";
          }

          const latencyMs = Math.round(performance.now() - start);
          const speed = getSpeedMetrics(latencyMs, status);
          const quota = getQuotaStatus(status);

          return {
            id: m.id,
            role: m.role,
            latency: `${latencyMs}ms`,
            speedLabel: speed.label,
            speedColor: speed.color,
            quotaStatus: quota,
            status: status === 200 ? "REACHABLE" : "UNREACHABLE",
            details
          };
        })
      );

      const isAnyReachable = modelDiagnostics.some(m => m.status === "REACHABLE");
      results.gemini = {
        configured: true,
        valid: isAnyReachable,
        models: modelDiagnostics
      };
    } else {
      results.gemini = { configured: false, models: [] };
    }

    // 2. REAL TEST: GROQ KEY & REMAINING TOKENS
    if (groqKey && groqKey.trim()) {
      const start = performance.now();
      let status = 0;
      let remTokens = "";
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey.trim()}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "qwen/qwen3.8-27b",
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 1
          }),
          signal: AbortSignal.timeout(7000)
        });
        status = res.status;
        const hTokens = res.headers.get("x-ratelimit-remaining-tokens");
        if (hTokens) remTokens = ` (${hTokens} tokens left)`;
      } catch {
        status = 500;
      }

      const latencyMs = Math.round(performance.now() - start);
      const speed = getSpeedMetrics(latencyMs, status);
      const quota = getQuotaStatus(status) + remTokens;

      results.groq = {
        configured: true,
        valid: status === 200,
        models: [
          {
            id: "qwen/qwen3.8-27b",
            role: "Groq Secondary Fallback",
            latency: `${latencyMs}ms`,
            speedLabel: speed.label,
            speedColor: speed.color,
            quotaStatus: quota,
            status: status === 200 ? "REACHABLE" : "FAILED",
            details: status === 200 ? "Active" : `HTTP ${status}`
          }
        ]
      };
    } else {
      results.groq = { configured: false, models: [] };
    }

    // 3. REAL TEST: OPENROUTER
    if (openRouterKey && openRouterKey.trim()) {
      const start = performance.now();
      let status = 0;
      let limitDetails = "";
      try {
        const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { Authorization: `Bearer ${openRouterKey.trim()}` },
          signal: AbortSignal.timeout(6000)
        });
        status = res.status;
        if (res.ok) {
          const kData = await res.json().catch(() => ({}));
          const usage = kData?.data?.usage ?? 0;
          const limit = kData?.data?.limit ?? "Unlimited";
          limitDetails = ` (Usage: $${usage} / ${limit})`;
        }
      } catch {
        status = 500;
      }

      const latencyMs = Math.round(performance.now() - start);
      const speed = getSpeedMetrics(latencyMs, status);

      results.openrouter = {
        configured: true,
        valid: status === 200,
        models: [
          {
            id: "openrouter/free",
            role: "Standby Cognitive Route",
            latency: `${latencyMs}ms`,
            speedLabel: speed.label,
            speedColor: speed.color,
            quotaStatus: status === 200 ? `Credits Active${limitDetails}` : getQuotaStatus(status),
            status: status === 200 ? "REACHABLE" : "FAILED",
            details: status === 200 ? "Active" : `HTTP ${status}`
          }
        ]
      };
    } else {
      results.openrouter = { configured: false, models: [] };
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
