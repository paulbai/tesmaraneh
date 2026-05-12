/** TEMPORARY debug endpoint — remove after SMS is working. */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const clientId = process.env.APPHIVE_CLIENT_ID ?? "";
  const clientSecret = process.env.APPHIVE_CLIENT_SECRET ?? "";
  const token = process.env.APPHIVE_TOKEN ?? "";

  const envStatus = {
    APPHIVE_CLIENT_ID: clientId
      ? `set (${clientId.length} chars, starts: ${clientId.slice(0, 4)}...)`
      : "MISSING",
    APPHIVE_CLIENT_SECRET: clientSecret
      ? `set (${clientSecret.length} chars, starts: ${clientSecret.slice(0, 4)}...)`
      : "MISSING",
    APPHIVE_TOKEN: token
      ? `set (${token.length} chars, starts: ${token.slice(0, 4)}...)`
      : "MISSING",
  };

  if (!clientId || !clientSecret || !token) {
    return NextResponse.json({ error: "Missing env vars", envStatus });
  }

  // Try multiple sender IDs to find one that works
  const senderIds = ["AppHiveSL", "AppHive", "SMS", "Info"];
  const results: Record<string, unknown>[] = [];

  for (const senderId of senderIds) {
    const params = new URLSearchParams({
      clientId,
      clientSecret,
      token,
      from: senderId,
      to: "23275696192",
      content: `Test from sender: ${senderId}`,
    });

    const url = `https://api.sierrahive.com/v1/messages/sms?${params.toString()}`;

    try {
      const res = await fetch(url, { method: "GET" });
      const responseText = await res.text();
      results.push({
        senderId,
        status: res.status,
        body: responseText.slice(0, 500),
      });
      if (res.ok) break;
    } catch (err) {
      results.push({ senderId, error: String(err) });
    }
  }

  // Also try without 'from' param at all
  const paramsNoFrom = new URLSearchParams({
    clientId,
    clientSecret,
    token,
    to: "23275696192",
    content: "Test without from param",
  });

  try {
    const res = await fetch(
      `https://api.sierrahive.com/v1/messages/sms?${paramsNoFrom.toString()}`,
      { method: "GET" }
    );
    const responseText = await res.text();
    results.push({
      senderId: "(none - no from param)",
      status: res.status,
      body: responseText.slice(0, 500),
    });
  } catch (err) {
    results.push({ senderId: "(none)", error: String(err) });
  }

  return NextResponse.json({ envStatus, results });
}
