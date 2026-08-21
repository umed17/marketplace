import { prisma } from "./prisma";

export async function recalcMasterStats(masterUserId: string) {
  const [agg, completed] = await Promise.all([
    prisma.review.aggregate({
      where: { masterId: masterUserId, status: "approved" },
      _avg: { rating: true },
    }),
    prisma.order.count({
      where: { selectedMasterId: masterUserId, status: "completed" },
    }),
  ]);

  await prisma.masterProfile.updateMany({
    where: { userId: masterUserId },
    data: {
      ratingAverage: Number((agg._avg.rating ?? 0).toFixed(2)),
      completedOrders: completed,
    },
  });
}
