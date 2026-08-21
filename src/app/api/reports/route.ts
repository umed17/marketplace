import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reportSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    const data = reportSchema.parse(await req.json());
    const report = await prisma.report.create({
      data: {
        reporterId: me.id,
        targetType: data.targetType,
        targetId: data.targetId,
        targetUserId: data.targetUserId,
        reason: data.reason,
      },
    });
    return NextResponse.json({ report });
  } catch (error) {
    return handleError(error);
  }
}
