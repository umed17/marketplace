import { type Locale, t } from "./i18n";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function fullName(user: { firstName: string; lastName: string; displayName?: string | null }) {
  if (user.displayName) return user.displayName;
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatSomoni(value?: number | null, locale: Locale = "tg") {
  if (value == null) return "—";
  const loc = locale === "ru" ? "ru-RU" : "tg-TJ";
  return `${value.toLocaleString(loc)} ${t(locale, "currencySomoni")}`;
}

export function formatMasterPrice(value?: number | null, locale: Locale = "tg") {
  if (value == null) return t(locale, "priceNegotiable");
  return `${t(locale, "pricePrefixFrom")} ${formatSomoni(value, locale)}`;
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("tg-TJ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string | Date, locale: Locale = "tg") {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t(locale, "timeNow");
  if (mins < 60) return t(locale, "timeMinutesAgo", { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t(locale, "timeHoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  return t(locale, "timeDaysAgo", { n: days });
}

export function isOnline(lastSeenAt?: string | Date | null) {
  if (!lastSeenAt) return false;
  const date = typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
  return Date.now() - date.getTime() < 5 * 60 * 1000;
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function stars(rating: number) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}
