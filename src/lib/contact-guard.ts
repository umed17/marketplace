/**
 * Contact-leak detector.
 * MVP: warn only — never block.
 * Later monetization can switch this to hard-block without rewriting callers.
 */
export type ContactHit = {
  type: "phone" | "email" | "telegram" | "whatsapp";
  value: string;
};

const PHONE =
  /(?:\+?\d[\d\s().-]{7,}\d)/g;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TELEGRAM = /(?:t\.me\/|telegram\.me\/|@)[A-Za-z0-9_]{4,}/gi;
const WHATSAPP = /(?:wa\.me\/|whatsapp\.com\/|whats\s?app)/gi;

export function detectContacts(text: string): ContactHit[] {
  const hits: ContactHit[] = [];
  for (const value of text.match(PHONE) ?? []) hits.push({ type: "phone", value });
  for (const value of text.match(EMAIL) ?? []) hits.push({ type: "email", value });
  for (const value of text.match(TELEGRAM) ?? []) hits.push({ type: "telegram", value });
  for (const value of text.match(WHATSAPP) ?? []) hits.push({ type: "whatsapp", value });
  return hits;
}

export function inspectMessage(text: string) {
  const hits = detectContacts(text);
  return {
    hits,
    hasContact: hits.length > 0,
    // Future: return { blocked: true } when monetization is on.
    blocked: false,
  };
}
