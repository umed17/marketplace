import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return jsonError(first?.message || "Маълумот нодуруст аст", 400);
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = Number((error as { status: number }).status) || 400;
    const message = error instanceof Error ? error.message : "Хато";
    return jsonError(message, status);
  }
  console.error(error);
  return jsonError("Хатои дохилии сервер", 500);
}

export function requireRole(role: string | string[], userRole: string) {
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(userRole) && userRole !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
}
