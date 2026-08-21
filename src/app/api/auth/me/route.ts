import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Ворид шавед", 401);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  });

  return NextResponse.json({
    user: {
      ...publicUser(user),
      masterProfile: user.masterProfile,
      customerProfile: user.customerProfile,
    },
  });
}
