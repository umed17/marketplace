import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") {
    throw Object.assign(new Error("Дастрасӣ манъ аст"), { status: 403 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ categories });
  } catch (e) {
    return jsonError((e as Error).message, (e as { status?: number }).status || 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = categorySchema.parse(await req.json());
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || "🔧",
        description: data.description,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 99,
      },
    });
    return NextResponse.json({ category });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name,
        slug: body.slug,
        icon: body.icon,
        description: body.description,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json({ category });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return jsonError("id лозим аст");
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
