export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function fullName(user: { firstName: string; lastName: string; displayName?: string | null }) {
  if (user.displayName) return user.displayName;
  return `${user.firstName} ${user.lastName}`.trim();
}

export function formatSomoni(value?: number | null) {
  if (value == null) return "—";
  return `${value.toLocaleString("tg-TJ")} сомонӣ`;
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

export function timeAgo(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ҳозир";
  if (mins < 60) return `${mins} дақ пеш`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} соат пеш`;
  const days = Math.floor(hours / 24);
  return `${days} рӯз пеш`;
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
