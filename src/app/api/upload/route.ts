import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, handleError } from "@/lib/api";
import { saveUpload } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "misc");
    const allowed = new Set(["avatars", "portfolio", "orders", "chat"]);
    if (!(file instanceof File)) return jsonError("Файл ёфт нашуд");
    if (!allowed.has(folder)) return jsonError("Папка нодуруст аст");
    const url = await saveUpload(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    return handleError(error);
  }
}
