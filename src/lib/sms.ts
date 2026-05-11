/** AppHiveSL SMS integration.
 *
 *  Env vars required:
 *    APPHIVE_CLIENT_ID     – your client ID
 *    APPHIVE_CLIENT_SECRET – your client secret
 *    APPHIVE_TOKEN         – wallet token
 *
 *  API: GET https://api.sierrahive.com/v1/messages/sms
 *  Auth: credentials passed as URL query parameters
 *  Phone format: E.164 WITHOUT leading + (e.g. 23275696192)
 */

const API_BASE = "https://api.sierrahive.com/v1/messages/sms";
const SENDER_ID = "Tesmaraneh"; // max 11 chars

function getCredentials() {
  const clientId = process.env.APPHIVE_CLIENT_ID;
  const clientSecret = process.env.APPHIVE_CLIENT_SECRET;
  const token = process.env.APPHIVE_TOKEN;
  if (!clientId || !clientSecret || !token) {
    return null; // SMS not configured — skip silently
  }
  return { clientId, clientSecret, token };
}

/** Send a single SMS via GET request. Returns true on success, false on failure.
 *  Never throws — SMS is best-effort so it shouldn't block orders. */
export async function sendSms(
  to: string,
  content: string,
  reference?: string
): Promise<boolean> {
  const creds = getCredentials();
  if (!creds) {
    console.warn("[sms] AppHiveSL credentials not configured — skipping SMS");
    return false;
  }

  // E.164 without + prefix (as per AppHiveSL docs)
  const toNumber = to.replace(/^\+/, "");

  try {
    const params = new URLSearchParams({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret,
      token: creds.token,
      from: SENDER_ID,
      to: toNumber,
      content,
    });
    if (reference) {
      params.set("reference", reference);
    }

    const url = `${API_BASE}?${params.toString()}`;

    // Debug: log the request (mask secrets)
    console.log("[sms] DEBUG request:", {
      method: "GET",
      to: toNumber,
      from: SENDER_ID,
      contentLength: content.length,
      hasClientId: !!creds.clientId,
      hasClientSecret: !!creds.clientSecret,
      hasToken: !!creds.token,
      clientIdPrefix: creds.clientId.slice(0, 6),
      tokenPrefix: creds.token.slice(0, 6),
    });

    const res = await fetch(url, { method: "GET" });
    const responseText = await res.text().catch(() => "");

    console.log("[sms] DEBUG response:", {
      status: res.status,
      statusText: res.statusText,
      body: responseText.slice(0, 1000),
      headers: Object.fromEntries(res.headers.entries()),
    });

    if (!res.ok) {
      console.error(
        `[sms] AppHiveSL GET returned ${res.status} for to=${toNumber}:`,
        responseText.slice(0, 500)
      );
      return false;
    }

    let data = null;
    try { data = JSON.parse(responseText); } catch {}
    console.log("[sms] AppHiveSL response:", JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("[sms] Failed to send SMS:", err);
    return false;
  }
}

/** Send order notification SMS to multiple phone numbers.
 *  Best-effort — failures are logged but don't propagate. */
export async function notifyNewOrder(
  phones: string[],
  order: {
    reference: string;
    customerName: string;
    itemCount: number;
    totalSll: number;
  }
): Promise<void> {
  if (phones.length === 0) return;

  const msg =
    `New order ${order.reference}! ` +
    `${order.customerName} ordered ${order.itemCount} ` +
    `${order.itemCount === 1 ? "item" : "items"} ` +
    `(Le ${order.totalSll.toLocaleString()}). ` +
    `Check your dashboard.`;

  await Promise.allSettled(
    phones.map((phone) =>
      sendSms(phone, msg, `order-notif-${order.reference}`)
    )
  );
}
