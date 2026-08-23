import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "Ном хеле кӯтоҳ аст"),
    lastName: z.string().trim().min(2, "Насаб хеле кӯтоҳ аст"),
    email: z.string().trim().email("Email нодуруст аст").toLowerCase(),
    phone: z.string().trim().min(9, "Рақами телефон нодуруст аст"),
    password: z.string().min(8, "Парол бояд ҳадди ақал 8 аломат бошад"),
    confirmPassword: z.string(),
    role: z.enum(["customer", "master"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Паролҳо мувофиқат намекунанд",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email нодуруст аст").toLowerCase(),
  password: z.string().min(1, "Паролро нависед"),
});

export const masterProfileSchema = z
  .object({
    displayName: z.string().trim().min(2).optional(),
    firstName: z.string().trim().min(2).optional(),
    lastName: z.string().trim().min(2).optional(),
    city: z.string().trim().min(2),
    district: z.string().trim().optional(),
    categoryId: z.string().min(1, "Категорияро интихоб кунед"),
    experience: z.coerce.number().int().min(0).max(60),
    description: z.string().trim().min(20, "Тавсиф ҳадди ақал 20 аломат"),
    priceFrom: z.coerce.number().int().min(0).optional().nullable(),
    priceNegotiable: z.boolean().optional(),
    workingHours: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    services: z.array(z.string().trim().min(2)).optional(),
  })
  .refine((data) => data.priceNegotiable || (data.priceFrom != null && data.priceFrom >= 0), {
    message: "Нархро ворид кунед ё «Шартномavӣ»-ро интихоб кунед",
    path: ["priceFrom"],
  });

export const customerProfileSchema = z.object({
  firstName: z.string().trim().min(2).optional(),
  lastName: z.string().trim().min(2).optional(),
  city: z.string().trim().optional(),
  district: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export const orderSchema = z.object({
  title: z.string().trim().min(5, "Номи заказ хеле кӯтоҳ аст"),
  categoryId: z.string().min(1),
  description: z.string().trim().min(15, "Тавсифро пурратар нависед"),
  city: z.string().trim().min(2),
  district: z.string().trim().optional(),
  address: z.string().trim().optional(),
  budgetFrom: z.coerce.number().int().min(0).optional(),
  budgetTo: z.coerce.number().int().min(0).optional(),
  preferredTime: z.string().trim().optional(),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  masterId: z.string().optional(),
});

export const offerSchema = z.object({
  price: z.coerce.number().int().min(1, "Нархро нависед"),
  message: z.string().trim().min(10, "Тавзеҳро нависед"),
  arrivalTime: z.string().trim().optional(),
  finishTime: z.string().trim().optional(),
});

export const reviewSchema = z.object({
  orderId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Шарҳро нависед"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const reportSchema = z.object({
  targetType: z.enum(["user", "order", "review"]),
  targetId: z.string().optional(),
  targetUserId: z.string().optional(),
  reason: z.string().trim().min(5),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  icon: z.string().trim().optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});
