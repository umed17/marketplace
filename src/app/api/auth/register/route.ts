import { jsonError } from "@/lib/api";

export async function POST() {
  return jsonError(
    "Сабти ном танҳо бо тасдиқи email. Аз формаи регистратсия истифода баред.",
    400,
  );
}
