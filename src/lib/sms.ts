/** AppHiveSL SMS integration.
 *
 *  Env vars required:
 *    APPHIVE_CLIENT_ID     – your client ID
 *    APPHIVE_CLIENT_SECRET – your client secret
 *    APPHIVE_TOKEN         – wallet token
 *
 *  API: POST https://api.sierrahive.com/v1/messages/sms
 *  Auth: Basic base64(clientId:clientSecret)
 *  Wallet: X-Wallet: Token {token}
 */

const API_URL = "https://api.sierrahive.com/v1/messages/sms";
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

/** Send a single SMS. Returns true on success, false on failure.
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

  const basicAuth = Buffer.from(
    `${creds.clientId}:${creds.clientSecret}`
  ).toString("base64");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
        "X-Wallet": `Token ${creds.token}`,
      },
      body: JSON.stringify({
        From: SENDER_ID,
        To: to.startsWith("+") ? to : `+${to}`,
        Content: content,
        ...(reference ? { Reference: reference } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[sms] AppHiveSL returned ${res.status} for To=${to.startsWith("+") ? to : `+${to}`}:`,
        text
      );
      return false;
    }

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
