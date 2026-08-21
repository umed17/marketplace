import { prisma } from "./prisma";

export async function notify(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  return prisma.notification.create({ data: params });
}

export async function notifyMany(
  userIds: string[],
  payload: { type: string; title: string; body: string; link?: string },
) {
  if (!userIds.length) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, ...payload })),
  });
}
