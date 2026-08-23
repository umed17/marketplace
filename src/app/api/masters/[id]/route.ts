import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { masterProfileSchema } from "@/lib/validations";
import { handleError, jsonError } from "@/lib/api";
import { normalizePhone } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const me = await getCurrentUser();

  const profile = await prisma.masterProfile.findFirst({
    where: { OR: [{ userId: id }, { id }] },
    include: {
      user: true,
      category: true,
      services: true,
      portfolio: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!profile || profile.user.isBlocked) {
    return jsonError("Усто ёфт нашуд", 404);
  }

  const reviews = await prisma.review.findMany({
    where: { masterId: profile.userId, status: "approved" },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const favorite = me
    ? await prisma.favorite.findUnique({
        where: { customerId_masterId: { customerId: me.id, masterId: profile.userId } },
      })
    : null;

  const fiveMin = Date.now() - 5 * 60 * 1000;

  return NextResponse.json({
    master: {
      id: profile.userId,
      profileId: profile.id,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      displayName: profile.displayName || `${profile.user.firstName} ${profile.user.lastName}`,
      avatar: profile.user.avatar,
      phone: me?.id === profile.userId || me?.role === "admin" ? profile.user.phone : undefined,
      city: profile.city,
      district: profile.district,
      experience: profile.experience,
      description: profile.description,
      priceFrom: profile.priceFrom,
      workingHours: profile.workingHours,
      isVerified: profile.isVerified,
      rating: profile.ratingAverage,
      completedOrders: profile.completedOrders,
      category: profile.category,
      services: profile.services,
      portfolio: profile.portfolio,
      reviews,
      isFavorite: Boolean(favorite),
      isOnline: Boolean(profile.user.lastSeenAt && profile.user.lastSeenAt.getTime() > fiveMin),
      setupCompleted: profile.setupCompleted,
    },
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    if (me.id !== id && me.role !== "admin") return jsonError("Дастрасӣ манъ аст", 403);

    const data = masterProfileSchema.parse(await req.json());

    const displayName =
      data.displayName?.trim() ||
      `${data.firstName || me.firstName} ${data.lastName || me.lastName}`.trim();

    const priceFrom = data.priceNegotiable ? null : data.priceFrom ?? null;

    if (data.phone && data.phone !== me.phone) {
      const phone = normalizePhone(data.phone);
      const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: me.id } } });
      if (taken) return jsonError("Ин рақами телефон аллакай истифода шудааст.", 409);
      await prisma.user.update({ where: { id: me.id }, data: { phone } });
    }

    if (data.firstName || data.lastName) {
      await prisma.user.update({
        where: { id: me.id },
        data: {
          firstName: data.firstName || me.firstName,
          lastName: data.lastName || me.lastName,
        },
      });
    }

    const profile = await prisma.masterProfile.upsert({
      where: { userId: id },
      update: {
        displayName,
        city: data.city,
        district: data.district,
        categoryId: data.categoryId,
        experience: data.experience,
        description: data.description,
        priceFrom,
        workingHours: data.workingHours,
        setupCompleted: true,
      },
      create: {
        userId: id,
        displayName,
        city: data.city,
        district: data.district,
        categoryId: data.categoryId,
        experience: data.experience,
        description: data.description,
        priceFrom,
        workingHours: data.workingHours,
        setupCompleted: true,
      },
    });

    if (data.services) {
      await prisma.service.deleteMany({ where: { masterId: profile.id } });
      if (data.services.length) {
        await prisma.service.createMany({
          data: data.services.map((name) => ({ masterId: profile.id, name })),
        });
      }
    }

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return handleError(error);
  }
}
