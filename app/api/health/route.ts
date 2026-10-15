import { NextResponse } from "next/server";

async function testGemini(key: string) {
  if (!key || !key.trim()) return { status: "NOT_CONFIGURED", message: "Key not provided" };
  try {
    const startTime = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key.trim())}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
    });
    const latency = `${Date.now() - startTime}ms`;
    if (res.ok) {
      return { status: "OK", latency, message: "Gemini online & reachable" };
    }
    if (res.status === 429) {
      return { status: "RATE_LIMITED", latency, message: "Valid key, but quota limit exceeded (HTTP 429)" };
    }
    return { status: "REJECTED", latency, message: `Google rejected request (HTTP ${res.status})` };
  } catch (e: any) {
    return { status: "NETWORK_ERROR", message: e.message || "Failed to reach Google" };
  }
}

async function testGroq(key: string) {
  if (!key || !key.trim()) return { status: "NOT_CONFIGURED", message: "Optional fallback not set" };
  try {
    const startTime = Date.now();
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${key.trim()}`,
        "Content-Type": "application/json"
      }
    });
    const latency = `${Date.now() - startTime}ms`;
    if (res.ok) {
      return { status: "OK", latency, message: "Groq endpoints verified" };
    }
    if (res.status === 401) {
      return { status: "INVALID_KEY", latency, message: "Invalid Groq key (HTTP 401)" };
    }
    return { status: "ERROR", latency, message: `Groq error (HTTP ${res.status})` };
  } catch (e: any) {
    return { status: "NETWORK_ERROR", message: e.message || "Failed to reach Groq" };
  }
}

async function testOpenRouter(key: string) {
  if (!key || !key.trim()) return { status: "NOT_CONFIGURED", message: "Optional fallback not set" };
  try {
    const startTime = Date.now();
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${key.trim()}`,
        "Content-Type": "application/json"
      }
    });
    const latency = `${Date.now() - startTime}ms`;
    if (res.ok) {
      return { status: "OK", latency, message: "OpenRouter key active" };
    }
    if (res.status === 401) {
      return { status: "INVALID_KEY", latency, message: "Invalid OpenRouter key (HTTP 401)" };
    }
    return { status: "ERROR", latency, message: `OpenRouter error (HTTP ${res.status})` };
  } catch (e: any) {
    return { status: "NETWORK_ERROR", message: e.message || "Failed to reach OpenRouter" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const geminiKey = body.geminiKey || body.key || "";
    const groqKey = body.groqKey || "";
    const openRouterKey = body.openRouterKey || "";

    const [geminiRes, groqRes, openRouterRes] = await Promise.all([
      testGemini(geminiKey),
      testGroq(groqKey),
      testOpenRouter(openRouterKey)
    ]);

    return NextResponse.json({
      gemini: geminiRes,
      groq: groqRes,
      openrouter: openRouterRes
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
