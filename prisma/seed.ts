import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Test1234!", 12);
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin123!", 12);

  for (const row of [
    { key: "commission_enabled", value: "false" },
    { key: "lead_fee_enabled", value: "false" },
    { key: "vip_enabled", value: "false" },
    { key: "top_enabled", value: "false" },
    { key: "subscription_enabled", value: "false" },
    { key: "online_payment_enabled", value: "false" },
    { key: "contact_block_enabled", value: "false" },
  ]) {
    await prisma.platformSetting.upsert({
      where: { key: row.key },
      update: {},
      create: row,
    });
  }

  const categories = [];
  for (const [index, cat] of DEFAULT_CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: index },
      create: { ...cat, sortOrder: index },
    });
    categories.push(row);
  }

  await prisma.category.updateMany({
    where: { slug: "digar" },
    data: { isActive: false },
  });

  const bySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@usto.tj" },
    update: {},
    create: {
      firstName: "Админ",
      lastName: "Усто",
      email: process.env.ADMIN_EMAIL || "admin@usto.tj",
      phone: process.env.ADMIN_PHONE || "+992900000000",
      passwordHash: adminHash,
      role: "admin",
      isVerified: true,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "umed@test.tj" },
    update: {},
    create: {
      firstName: "Умед",
      lastName: "Каримов",
      email: "umed@test.tj",
      phone: "+992900000001",
      passwordHash,
      role: "customer",
      isVerified: true,
      customerProfile: { create: { city: "Душанбе", district: "Сино" } },
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "dilnoza@test.tj" },
    update: {},
    create: {
      firstName: "Дилноза",
      lastName: "Шарифзода",
      email: "dilnoza@test.tj",
      phone: "+992900000011",
      passwordHash,
      role: "customer",
      customerProfile: { create: { city: "Душанбе", district: "Фирдавсӣ" } },
    },
  });

  const mastersData = [
    {
      email: "alisher@test.tj",
      phone: "+992900000002",
      firstName: "Алишер",
      lastName: "Раҳимов",
      slug: "elektrik",
      city: "Душанбе",
      district: "Сино",
      experience: 8,
      priceFrom: 50,
      description:
        "Электрики касбӣ бо таҷрибаи 8 сол. Насби симкашӣ, таъмири щит, розетка ва чароғҳо. Корро тоза ва сари вақт иҷро мекунам.",
      services: ["Насби розетка", "Таъмири щит", "Симкашии хона", "Чароғҳои LED"],
    },
    {
      email: "rustam@test.tj",
      phone: "+992900000003",
      firstName: "Рустам",
      lastName: "Назаров",
      slug: "santekhnik",
      city: "Душанбе",
      district: "Фирдавсӣ",
      experience: 5,
      priceFrom: 40,
      description:
        "Сантехники ботаҷриба. Таъмири кран, қубур, унитаз ва насби обгармкунак. Кафолати кор медиҳам.",
      services: ["Таъмири кран", "Қубур", "Обгармкунак", "Насби унитаз"],
    },
    {
      email: "farhod@test.tj",
      phone: "+992900000004",
      firstName: "Фарҳод",
      lastName: "Мирзоев",
      slug: "sokhtmon",
      city: "Хуҷанд",
      district: "Марказ",
      experience: 12,
      priceFrom: 120,
      description:
        "Устои сохтмон бо таҷрибаи зиёда аз 12 сол. Таъмири квартира, штукатурка, плитка ва рангубор.",
      services: ["Таъмири квартира", "Плитка", "Штукатурка"],
    },
    {
      email: "malika@test.tj",
      phone: "+992900000005",
      firstName: "Малика",
      lastName: "Юсуфова",
      slug: "beauty",
      city: "Душанбе",
      district: "Шоҳмансур",
      experience: 6,
      priceFrom: 30,
      description:
        "Мутахассиси зебоӣ. Ороиш, қош, маникюр. Дар хона низ хизмат мерасонам.",
      services: ["Ороиш", "Қош", "Маникюр"],
    },
    {
      email: "javohir@test.tj",
      phone: "+992900000006",
      firstName: "Ҷавоҳир",
      lastName: "Саидов",
      slug: "kompyuter",
      city: "Душанбе",
      district: "Исмоили Сомонӣ",
      experience: 4,
      priceFrom: 35,
      description:
        "Таъмири компютер ва ноутбук, насби Windows, тозакунии вирус ва ҷамъкунии PC.",
      services: ["Таъмири ноутбук", "Насби Windows", "Тозакунии вирус"],
    },
  ];

  const masters = [];
  for (const m of mastersData) {
    const user = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phone: m.phone,
        passwordHash,
        role: "master",
        isVerified: true,
        lastSeenAt: new Date(),
        masterProfile: {
          create: {
            displayName: `${m.firstName} ${m.lastName}`,
            categoryId: bySlug[m.slug].id,
            city: m.city,
            district: m.district,
            experience: m.experience,
            description: m.description,
            priceFrom: m.priceFrom,
            workingHours: "08:00–20:00",
            isVerified: m.email === "alisher@test.tj",
            setupCompleted: true,
            isOnline: true,
            services: {
              create: m.services.map((name) => ({ name, priceFrom: m.priceFrom })),
            },
            portfolio: {
              create: [
                { imageUrl: "", description: "Кори анҷомдодашуда — намунаи 1" },
                { imageUrl: "", description: "Кори анҷомдодашуда — намунаи 2" },
              ],
            },
          },
        },
      },
    });
    masters.push(user);
  }

  const existingOrder = await prisma.order.findFirst({
    where: { title: "Таъмири крани ошхона" },
  });

  if (!existingOrder) {
    const order1 = await prisma.order.create({
      data: {
        customerId: customer.id,
        categoryId: bySlug.santekhnik.id,
        title: "Таъмири крани ошхона",
        description: "Крани ошхона вайрон шудааст, об мечакад. Лутфан имрӯз биёед.",
        city: "Душанбе",
        district: "Сино",
        address: "кӯчаи Рӯдакӣ 45",
        budgetFrom: 200,
        budgetTo: 300,
        preferredTime: "Имрӯз",
        priority: "high",
        status: "receiving_offers",
      },
    });

    const rustam = masters.find((x) => x.email === "rustam@test.tj")!;
    const alisher = masters.find((x) => x.email === "alisher@test.tj")!;

    await prisma.orderOffer.createMany({
      data: [
        {
          orderId: order1.id,
          masterId: rustam.id,
          price: 220,
          message: "Имрӯз соати 18:00 омада метавонам. Қисмҳоро бо худ меорам.",
          arrivalTime: "Имрӯз 18:00",
          finishTime: "1 соат",
        },
        {
          orderId: order1.id,
          masterId: alisher.id,
          price: 250,
          message: "Ман ин корро иҷро карда метавонам. Кафолат медиҳам.",
          arrivalTime: "Имрӯз 19:00",
          finishTime: "1-2 соат",
        },
      ],
    });

    const completed = await prisma.order.create({
      data: {
        customerId: customer.id,
        categoryId: bySlug.elektrik.id,
        selectedMasterId: alisher.id,
        title: "Насби чароғҳои LED",
        description: "Дар меҳмонхона 6 чароғи LED насб кардан лозим аст.",
        city: "Душанбе",
        district: "Сино",
        budgetFrom: 150,
        budgetTo: 250,
        status: "completed",
        completedAt: new Date(),
      },
    });

    await prisma.review.create({
      data: {
        orderId: completed.id,
        customerId: customer.id,
        masterId: alisher.id,
        rating: 5,
        comment: "Устои хуб, сари вақт омад ва кори худро хуб иҷро кард.",
        status: "approved",
      },
    });

    await prisma.masterProfile.update({
      where: { userId: alisher.id },
      data: { ratingAverage: 5, completedOrders: 1 },
    });

    await prisma.order.create({
      data: {
        customerId: customer2.id,
        categoryId: bySlug.kompyuter.id,
        title: "Ноутбук фурӯзон намешавад",
        description: "Lenovo IdeaPad. Дирӯз хомӯш шуд ва дигар фурӯзон намешавад.",
        city: "Душанбе",
        district: "Исмоили Сомонӣ",
        budgetFrom: 50,
        budgetTo: 150,
        preferredTime: "Фардо",
        status: "published",
      },
    });
  }

  console.log("Seed OK");
  console.log("Admin:    ", admin.email, " / ", process.env.ADMIN_PASSWORD || "Admin123!");
  console.log("Customer: umed@test.tj / Test1234!");
  console.log("Master:   alisher@test.tj / Test1234!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
