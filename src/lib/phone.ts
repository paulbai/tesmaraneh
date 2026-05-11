/** Phone number normalization for Sierra Leone.
 *
 *  Accepts common formats:
 *    +23275696192  → 23275696192
 *    23275696192   → 23275696192
 *    075696192     → 23275696192
 *    75696192      → 23275696192
 *
 *  Returns the normalized E.164 number (without leading +), or null
 *  if the input is invalid. */

const SL_COUNTRY_CODE = "232";

/** Sierra Leone local numbers start with 0 followed by 2 digits (network
 *  code) + 6 digits. After stripping the leading 0, the subscriber number
 *  is 8 digits. Common prefixes: 030, 031, 032, 033, 034, 044, 076, 077,
 *  078, 079, 088, 099, etc. */
const SL_LOCAL_REGEX = /^0\d{8}$/;

/** A bare subscriber number without the leading 0 (e.g. 75696192). */
const SL_SUBSCRIBER_REGEX = /^[3-9]\d{7}$/;

export function normalizePhone(raw: string): string | null {
  // Strip whitespace, dashes, parentheses
  let phone = raw.replace(/[\s\-()]/g, "");

  // Strip leading +
  if (phone.startsWith("+")) {
    phone = phone.slice(1);
  }

  // Must be digits only at this point
  if (!/^\d+$/.test(phone)) return null;

  // Case 1: Local format with leading 0 (e.g. 075696192)
  if (SL_LOCAL_REGEX.test(phone)) {
    phone = SL_COUNTRY_CODE + phone.slice(1); // drop the 0, prepend 232
  }

  // Case 2: Bare subscriber number (e.g. 75696192)
  if (SL_SUBSCRIBER_REGEX.test(phone)) {
    phone = SL_COUNTRY_CODE + phone;
  }

  // Final validation: must be 8-15 digits (E.164 range)
  if (!/^\d{8,15}$/.test(phone)) return null;

  return phone;
}
