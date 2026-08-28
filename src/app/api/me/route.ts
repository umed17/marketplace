import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { customerProfileSchema } from "@/lib/validations";
import { handleError } from "@/lib/api";
import { normalizePhone } from "@/lib/utils";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function PUT(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return jsonError("Ворид шавед", 401);
    const body = await req.json();

    if (body.currentPassword && body.newPassword) {
      if (!me.passwordHash) {
        return jsonError("Парол тавассути Supabase идора мешавад. Дар Supabase иваз кунед.");
      }
      const ok = await verifyPassword(body.currentPassword, me.passwordHash);
      if (!ok) return jsonError("Пароли ҷорӣ нодуруст аст");
      if (String(body.newPassword).length < 8) return jsonError("Пароли нав хеле кӯтоҳ аст");
      await prisma.user.update({
        where: { id: me.id },
        data: { passwordHash: await hashPassword(body.newPassword) },
      });
      return NextResponse.json({ ok: true });
    }

    const data = customerProfileSchema.parse(body);
    if (data.phone && data.phone !== me.phone) {
      const phone = normalizePhone(data.phone);
      const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: me.id } } });
      if (taken) return jsonError("Ин рақами телефон аллакай истифода шудааст.", 409);
      await prisma.user.update({ where: { id: me.id }, data: { phone } });
    }

    await prisma.user.update({
      where: { id: me.id },
      data: {
        firstName: data.firstName || me.firstName,
        lastName: data.lastName || me.lastName,
        avatar: body.avatar ?? undefined,
      },
    });

    if (me.role === "customer") {
      await prisma.customerProfile.upsert({
        where: { userId: me.id },
        update: { city: data.city, district: data.district },
        create: { userId: me.id, city: data.city, district: data.district },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
