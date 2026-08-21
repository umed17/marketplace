import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() || "";
  const categoryId = searchParams.get("categoryId") || undefined;
  const city = searchParams.get("city") || undefined;
  const district = searchParams.get("district") || undefined;
  const verified = searchParams.get("verified");
  const online = searchParams.get("online");
  const minRating = Number(searchParams.get("minRating") || 0);
  const minExperience = Number(searchParams.get("minExperience") || 0);
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort") || "rating";

  const me = await getCurrentUser();

  const where = {
    setupCompleted: true,
    user: { isBlocked: false, role: "master" as const },
    ...(categoryId ? { categoryId } : {}),
    ...(city ? { city } : {}),
    ...(district ? { district } : {}),
    ...(verified === "1" ? { isVerified: true } : {}),
    ...(minRating ? { ratingAverage: { gte: minRating } } : {}),
    ...(minExperience ? { experience: { gte: minExperience } } : {}),
    ...(maxPrice ? { priceFrom: { lte: Number(maxPrice) } } : {}),
    ...(q
      ? {
          OR: [
            { displayName: { contains: q } },
            { description: { contains: q } },
            { city: { contains: q } },
            { user: { firstName: { contains: q } } },
            { user: { lastName: { contains: q } } },
            { services: { some: { name: { contains: q } } } },
            { category: { name: { contains: q } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "newest"
      ? { createdAt: "desc" as const }
      : sort === "experience"
        ? { experience: "desc" as const }
        : sort === "price"
          ? { priceFrom: "asc" as const }
          : { ratingAverage: "desc" as const };

  const masters = await prisma.masterProfile.findMany({
    where,
    include: {
      user: true,
      category: true,
      services: true,
    },
    orderBy,
    take: 60,
  });

  const favoriteIds = me
    ? new Set(
        (
          await prisma.favorite.findMany({
            where: { customerId: me.id },
            select: { masterId: true },
          })
        ).map((f) => f.masterId),
      )
    : new Set<string>();

  const fiveMin = Date.now() - 5 * 60 * 1000;
  const items = masters
    .filter((m) => {
      if (online !== "1") return true;
      return m.user.lastSeenAt && m.user.lastSeenAt.getTime() > fiveMin;
    })
    .map((m) => ({
      id: m.userId,
      profileId: m.id,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      displayName: m.displayName || `${m.user.firstName} ${m.user.lastName}`,
      avatar: m.user.avatar,
      rating: m.ratingAverage,
      completedOrders: m.completedOrders,
      category: m.category,
      city: m.city,
      district: m.district,
      experience: m.experience,
      priceFrom: m.priceFrom,
      isVerified: m.isVerified,
      isOnline: Boolean(m.user.lastSeenAt && m.user.lastSeenAt.getTime() > fiveMin),
      isFavorite: favoriteIds.has(m.userId),
      services: m.services,
    }));

  return NextResponse.json({ masters: items });
}
