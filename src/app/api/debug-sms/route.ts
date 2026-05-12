/** TEMPORARY debug endpoint — remove after SMS is working. */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.APPHIVE_CLIENT_ID ?? "";
  const clientSecret = process.env.APPHIVE_CLIENT_SECRET ?? "";
  const token = process.env.APPHIVE_TOKEN ?? "";

  // Show env var status (masked)
  const envStatus = {
    APPHIVE_CLIENT_ID: clientId ? `set (${clientId.length} chars, starts: ${clientId.slice(0, 4)}...)` : "MISSING",
    APPHIVE_CLIENT_SECRET: clientSecret ? `set (${clientSecret.length} chars, starts: ${clientSecret.slice(0, 4)}...)` : "MISSING",
    APPHIVE_TOKEN: token ? `set (${token.length} chars, starts: ${token.slice(0, 4)}...)` : "MISSING",
  };

  if (!clientId || !clientSecret || !token) {
    return NextResponse.json({ error: "Missing env vars", envStatus });
  }

  // Make a test SMS request
  const params = new URLSearchParams({
    clientId,
    clientSecret,
    token,
    from: "Tesmaraneh",
    to: "23275696192",
    content: "Test SMS from debug endpoint",
  });

  const url = `https://api.sierrahive.com/v1/messages/sms?${params.toString()}`;

  try {
    const res = await fetch(url, { method: "GET" });
    const responseText = await res.text();

    return NextResponse.json({
      envStatus,
      request: {
        method: "GET",
        url: url.replace(clientSecret, "***SECRET***").replace(token, "***TOKEN***"),
      },
      response: {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: responseText,
      },
    });
  } catch (err) {
    return NextResponse.json({
      envStatus,
      error: String(err),
    });
  }
}
