import type { AuthError } from "@supabase/supabase-js";
import type { Locale } from "@/lib/i18n";

const messages: Record<Locale, Record<string, string>> = {
  tg: {
    invalid_credentials: "Email ё парол нодуруст аст.",
    email_not_confirmed: "Email-ро тасдиқ кунед. Рамзро аз нома ворид кунед.",
    otp_expired: "Рамз қадим шуд. Рамзи нав дархост кунед.",
    otp_disabled: "Тасдиқи email фаъол нест. Бо дастгирӣ тамос гиред.",
    user_already_registered: "Ин email аллакай сабт шудааст. Ворид шавед ё рамзро аз нав фиристед.",
    over_email_send_rate_limit: "Зиёд кӯшиш кардед. Баъдтар такрор кунед.",
    over_request_rate_limit: "Зиёд кӯшиш кардед. Баъдтар такрор кунед.",
    validation_failed: "Маълумот нодуруст аст. Санҷед ва такрор кунед.",
    signup_disabled: "Сабти ном муваққатан банд аст.",
    weak_password: "Парол хеле суст аст. Ҳадди ақал 8 аломат истифода баред.",
    same_password: "Пароли нав бо пароли кӯҳна якхела аст.",
    email_address_invalid: "Email нодуруст аст.",
    default: "Хато рӯй дод. Боз такрор кунед.",
  },
  ru: {
    invalid_credentials: "Email или пароль неверны.",
    email_not_confirmed: "Подтвердите email. Введите код из письма.",
    otp_expired: "Код устарел. Запросите новый код.",
    otp_disabled: "Подтверждение email не активно. Свяжитесь с поддержкой.",
    user_already_registered: "Этот email уже зарегистрирован. Войдите или запросите код повторно.",
    over_email_send_rate_limit: "Слишком много попыток. Попробуйте позже.",
    over_request_rate_limit: "Слишком много попыток. Попробуйте позже.",
    validation_failed: "Данные неверны. Проверьте и попробуйте снова.",
    signup_disabled: "Регистрация временно отключена.",
    weak_password: "Пароль слишком слабый. Используйте минимум 8 символов.",
    same_password: "Новый пароль совпадает со старым.",
    email_address_invalid: "Неверный email.",
    default: "Произошла ошибка. Попробуйте снова.",
  },
};

export function mapSupabaseAuthError(error: AuthError | null | undefined, locale: Locale): string {
  if (!error) return messages[locale].default;

  const code = error.code ?? "";
  const table = messages[locale];
  if (code && table[code]) return table[code];

  const msg = error.message.toLowerCase();
  if (msg.includes("invalid login credentials")) return table.invalid_credentials;
  if (msg.includes("email not confirmed")) return table.email_not_confirmed;
  if (msg.includes("token has expired") || msg.includes("otp expired")) return table.otp_expired;
  if (msg.includes("already registered") || msg.includes("already been registered")) return table.user_already_registered;
  if (msg.includes("rate limit")) return table.over_email_send_rate_limit;

  return table.default;
}
