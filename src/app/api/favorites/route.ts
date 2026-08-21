import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);

  const favorites = await prisma.favorite.findMany({
    where: { customerId: me.id },
    include: {
      master: { include: { masterProfile: { include: { category: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => ({
      id: f.id,
      masterId: f.masterId,
      master: f.master,
    })),
  });
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const { masterId } = await req.json();
  if (!masterId) return jsonError("masterId лозим аст");

  const favorite = await prisma.favorite.upsert({
    where: { customerId_masterId: { customerId: me.id, masterId } },
    update: {},
    create: { customerId: me.id, masterId },
  });
  return NextResponse.json({ favorite });
}

export async function DELETE(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return jsonError("Ворид шавед", 401);
  const masterId = req.nextUrl.searchParams.get("masterId");
  if (!masterId) return jsonError("masterId лозим аст");
  await prisma.favorite.deleteMany({ where: { customerId: me.id, masterId } });
  return NextResponse.json({ ok: true });
}
