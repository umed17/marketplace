import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
  return me;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    const role = req.nextUrl.searchParams.get("role") || undefined;
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role as never } : {}),
        ...(q
          ? {
              OR: [
                { email: { contains: q } },
                { phone: { contains: q } },
                { firstName: { contains: q } },
                { lastName: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { masterProfile: true, customerProfile: true },
    });
    return NextResponse.json({
      users: users.map(({ passwordHash, ...u }) => u),
    });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}
