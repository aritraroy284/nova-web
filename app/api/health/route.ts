import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    if (!key || typeof key !== "string" || !key.startsWith("AIzaSy")) {
      return NextResponse.json({ status: "INVALID_KEY", message: "Key format invalid. Gemini keys start with 'AIzaSy'." }, { status: 400 });
    }
    const startTime = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] }),
    });
    const elapsed = Date.now() - startTime;
    if (response.ok) {
      return NextResponse.json({ status: "OK", latency: `${elapsed}ms`, message: "Connection verified successfully." });
    }
    if (response.status === 429) {
      return NextResponse.json({ status: "RATE_LIMITED", latency: `${elapsed}ms`, message: "Key valid, but quota exceeded (HTTP 429)." });
    }
    return NextResponse.json({ status: "REJECTED", latency: `${elapsed}ms`, message: `Google rejected request (HTTP ${response.status}).` });
  } catch (error: any) {
    return NextResponse.json({ status: "NETWORK_ERROR", message: error.message || "Failed to reach Google endpoint." }, { status: 500 });
  }
}
