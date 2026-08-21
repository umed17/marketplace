import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  if (me.role !== "master") return jsonError("Дастрасӣ манъ аст", 403);
  const profile = await prisma.masterProfile.findUnique({ where: { userId: me.id } });
  if (!profile) return jsonError("Профил ёфт нашуд", 404);
  const { imageUrl, description } = await req.json();
  const item = await prisma.portfolioItem.create({
    data: { masterId: profile.id, imageUrl: imageUrl || "", description: description || "" },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return jsonError("id лозим аст");
  const profile = await prisma.masterProfile.findUnique({ where: { userId: me.id } });
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item || (item.masterId !== profile?.id && me.role !== "admin")) {
    return jsonError("Дастрасӣ манъ аст", 403);
  }
  await prisma.portfolioItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
