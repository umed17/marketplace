export const CITIES = [
  "Душанбе",
  "Хуҷанд",
  "Бохтар",
  "Кӯлоб",
  "Истаравшан",
  "Панҷакент",
  "Қурғонтеппа",
  "Турсунзода",
  "Ҳисор",
  "Ваҳдат",
  "Исфара",
  "Конибодом",
] as const;

export const DISTRICTS: Record<string, string[]> = {
  Душанбе: ["Сино", "Фирдавсӣ", "Шоҳмансур", "Исмоили Сомонӣ"],
  Хуҷанд: ["Марказ", "Ҷануб", "Шимол"],
  Бохтар: ["Марказ", "Ғарб", "Шарқ"],
  Кӯлоб: ["Марказ", "Шимол"],
};

export const ORDER_STATUSES = [
  "draft",
  "published",
  "receiving_offers",
  "master_selected",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  draft: "Қарордод",
  published: "Нашршуда",
  receiving_offers: "Пешниҳод мегирад",
  master_selected: "Усто интихоб шуд",
  in_progress: "Дар иҷроиш",
  completed: "Анҷомшуда",
  cancelled: "Бекоршуда",
  pending: "Интизор",
  accepted: "Қабулшуда",
  rejected: "Радшуда",
  closed: "Пӯшида",
};

export const PRIORITY_LABEL: Record<string, string> = {
  low: "Паст",
  normal: "Муқаррарӣ",
  high: "Баланд",
};

export const CONTACT_WARNING =
  "Барои бехатарии корбарон кӯшиш кунед муоширатро дар дохили marketplace нигоҳ доред.";

export const DEFAULT_CATEGORIES = [
  { name: "Электрик", slug: "elektrik", icon: "💡" },
  { name: "Сантехник", slug: "santekhnik", icon: "🚿" },
  { name: "Кафшери оҳан (сварка)", slug: "kafshergar", icon: "🔥" },
  { name: "Устои сохтмон", slug: "sokhtmon", icon: "👷" },
  { name: "Таъмиргар", slug: "tamirgar", icon: "🪛" },
  { name: "Рангубор", slug: "rangubor", icon: "🎨" },
  { name: "Мебелсоз", slug: "mebelsoz", icon: "🛋️" },
  { name: "Кондиционер", slug: "konditsioner", icon: "❄️" },
  { name: "Таъмири телефон", slug: "telefon", icon: "📲" },
  { name: "Компютер", slug: "kompyuter", icon: "💻" },
  { name: "Автомеханик", slug: "avtomekhanik", icon: "🚘" },
  { name: "Тозакунӣ", slug: "tozakuni", icon: "🧼" },
  { name: "Фото/Видео", slug: "foto-video", icon: "📸" },
  { name: "Сартарош", slug: "sartarosh", icon: "💇" },
  { name: "Beauty", slug: "beauty", icon: "💅" },
  { name: "IT", slug: "it", icon: "⌨️" },
];

export const CATEGORY_EMOJI: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.flatMap((c) => [
    [c.slug, c.icon],
    [c.name, c.icon],
  ]),
);

export function displayCategoryName(slug?: string | null, name?: string | null, locale: "tg" | "ru" = "tg") {
  const found = DEFAULT_CATEGORIES.find((c) => c.slug === slug);
  if (found) {
    if (locale === "ru") return CATEGORY_RU[found.slug] || found.name;
    return found.name;
  }
  if (name === "Кафшергар" || name === "Кафшер" || name === "Кафшери оҳан") {
    return locale === "ru" ? "Сварщик" : "Кафшери оҳан (сварка)";
  }
  return name || "";
}

export const CATEGORY_RU: Record<string, string> = {
  elektrik: "Электрик",
  santekhnik: "Сантехник",
  kafshergar: "Сварщик",
  sokhtmon: "Строитель",
  tamirgar: "Мастер по ремонту",
  rangubor: "Маляр",
  mebelsoz: "Мебельщик",
  konditsioner: "Кондиционер",
  telefon: "Ремонт телефонов",
  kompyuter: "Компьютерный мастер",
  avtomekhanik: "Автомеханик",
  tozakuni: "Клининг",
  "foto-video": "Фото/Видео",
  sartarosh: "Парикмахер",
  beauty: "Beauty",
  it: "IT",
};

export const publicCategoryWhere = {
  isActive: true,
  slug: { not: "digar" },
};

export function categoryEmoji(slug?: string | null, icon?: string | null, name?: string | null) {
  if (name === "Кафшергар" || name === "Кафшер") return "🔥";
  if (slug === "digar" || name === "Дигар") return "🧰";
  return (slug && CATEGORY_EMOJI[slug]) || (name && CATEGORY_EMOJI[name]) || icon || "🔧";
}
