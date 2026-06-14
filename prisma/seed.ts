import { PrismaClient } from "@prisma/client";
import { SEED_SERVICES, BUSINESS } from "../src/lib/constants";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding services…");
  for (const s of SEED_SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        title: s.title,
        shortDesc: s.shortDesc,
        category: s.category,
        basePrice: s.basePrice,
        durationMin: s.durationMin,
        popular: "popular" in s ? (s.popular as boolean) : false,
        sortOrder: s.sortOrder,
      },
      update: {
        // Do not overwrite admin-edited catalog data on deploy.
      },
    });
  }

  console.log("Seeding content blocks…");
  const content: Array<[string, string, string]> = [
    ["hero.badge", "text", `Детейлинг в центре Самары · ${BUSINESS.address}`],
    ["hero.title", "text", "Глубокая забота о вашем автомобиле"],
    [
      "hero.subtitle",
      "text",
      "Детейлинг-студия «Омут» в центре Самары. Полировка, химчистка, керамика и защита кузова — с прозрачными ценами и личным кабинетом.",
    ],
    ["hero.stat1.value", "text", "12 мес"],
    ["hero.stat1.label", "text", "гарантия на керамику"],
    ["hero.stat2.value", "text", "pH-нейтр."],
    ["hero.stat2.label", "text", "безопасная химия"],
    ["hero.stat3.value", "text", "Любой класс"],
    ["hero.stat3.label", "text", "от седана до SUV"],
    ["hero.stat4.value", "text", "1 день"],
    ["hero.stat4.label", "text", "большинство работ"],
    ["services.title", "text", "Полный уход за автомобилем"],
    [
      "services.subtitle",
      "text",
      "Прозрачные цены «от» для класса B. Точную стоимость рассчитаем по фото или на осмотре.",
    ],
    ["promotions.title", "text", "Выгодные предложения"],
    ["promotions.subtitle", "text", "Актуальные скидки и бонусы для клиентов студии"],
    ["about.title", "text", "Почему «Омут»"],
    [
      "about.text",
      "text",
      "Мы относимся к каждому автомобилю как к своему: безопасные технологии, премиальные материалы и контроль качества на каждом этапе. Вы видите историю всех работ в личном кабинете и всегда знаете стоимость заранее.",
    ],
    ["about.feature1.title", "text", "Прозрачные цены"],
    [
      "about.feature1.text",
      "text",
      "Стоимость согласуем до начала работ. Никаких сюрпризов на выдаче.",
    ],
    ["about.feature2.title", "text", "Личный кабинет"],
    [
      "about.feature2.text",
      "text",
      "Вся история обращений, выполненные услуги и суммы — онлайн, в любой момент.",
    ],
    ["about.feature3.title", "text", "Фото- и видеоотчёт"],
    ["about.feature3.text", "text", "Показываем результат до и после. Гарантия на покрытия."],
    ["process.title", "text", "Четыре простых шага"],
    ["process.step1.title", "text", "Заявка"],
    ["process.step1.text", "text", "Записываетесь онлайн или присылаете фото в мессенджер."],
    ["process.step2.title", "text", "Осмотр и расчёт"],
    ["process.step2.text", "text", "Согласуем услуги, срок и точную стоимость."],
    ["process.step3.title", "text", "Работа"],
    ["process.step3.text", "text", "Выполняем по технологии, с контролем качества."],
    ["process.step4.title", "text", "Выдача"],
    ["process.step4.text", "text", "Показываем результат, фиксируем в вашем кабинете."],
    ["gallery.title", "text", "Результат, который видно"],
    ["reviews.title", "text", "Нам доверяют автомобили"],
    ["contacts.address", "text", BUSINESS.addressFull],
    ["contacts.hours", "text", BUSINESS.hours],
    ["contacts.phone", "text", BUSINESS.phone],
    ["contacts.landmark", "text", BUSINESS.landmark],
    ["cta.title", "text", "Готовы вернуть авто глубину и блеск?"],
    [
      "cta.text",
      "text",
      "Запишитесь онлайн — подтвердим время и рассчитаем стоимость. История всех работ будет в вашем личном кабинете.",
    ],
    ["cta.trust1", "text", "Прозрачные цены"],
    ["cta.trust2", "text", "Гарантия на покрытия"],
    ["cta.trust3", "text", "Фотоотчёт"],
  ];
  for (const [key, type, value] of content) {
    await prisma.contentBlock.upsert({
      where: { key },
      create: { key, type, value },
      update: {},
    });
  }

  console.log("Seeding sample reviews…");
  const reviews = [
    {
      authorName: "Андрей",
      rating: 5,
      text: "Делал керамику — машина как из салона. Всё показали до и после, в кабинете вся история.",
      approved: true,
    },
    {
      authorName: "Марина",
      rating: 5,
      text: "Химчистка салона на отлично, забрали запах и пятна. Очень удобно, что напомнили о записи.",
      approved: true,
    },
    {
      authorName: "Сергей",
      rating: 5,
      text: "Полировка кузова — аккуратно и по честной цене. Рекомендую, в центре удобно.",
      approved: true,
    },
  ];
  for (const r of reviews) {
    const exists = await prisma.review.findFirst({
      where: { authorName: r.authorName, text: r.text },
    });
    if (!exists) await prisma.review.create({ data: r });
  }

  console.log("Seeding test users…");
  const testPassword = "Omut2026!";
  const passwordHash = hashPassword(testPassword);
  const testUsers = [
    {
      name: "Администратор Омут",
      phone: "+79000000001",
      email: "admin@omut.local",
      role: "ADMIN" as const,
      note: "Тестовый администратор",
    },
    {
      name: "Сотрудник приёмки",
      phone: "+79000000002",
      email: "worker@omut.local",
      role: "WORKER" as const,
      note: "Тестовый сотрудник",
    },
    {
      name: "Тестовый клиент",
      phone: "+79000000003",
      email: "client@omut.local",
      role: "CLIENT" as const,
      note: "Тестовый клиент",
    },
  ];

  for (const u of testUsers) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      create: {
        ...u,
        passwordHash,
      },
      update: {},
    });
  }

  const client = await prisma.user.findUniqueOrThrow({
    where: { phone: "+79000000003" },
  });
  const worker = await prisma.user.findUniqueOrThrow({
    where: { phone: "+79000000002" },
  });
  const detailingWash = await prisma.service.findUnique({
    where: { slug: "detailing-wash" },
  });
  const ceramic = await prisma.service.findUnique({ where: { slug: "ceramic" } });

  const car = await prisma.car.upsert({
    where: { id: "test-client-car" },
    create: {
      id: "test-client-car",
      userId: client.id,
      make: "Toyota",
      model: "Camry",
      plate: "А123АА163",
      bodyClass: "B",
    },
    update: {
    },
  });

  if (detailingWash && ceramic) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 1);
    scheduledAt.setHours(12, 0, 0, 0);

    const booking = await prisma.booking.upsert({
      where: { id: "test-client-booking" },
      create: {
        id: "test-client-booking",
        userId: client.id,
        carId: car.id,
        scheduledAt,
        status: "CONFIRMED",
        note: "Тестовая запись для проверки кабинета",
        estimatedTotal: detailingWash.basePrice + ceramic.basePrice,
        services: {
          create: [
            { serviceId: detailingWash.id, price: detailingWash.basePrice },
            { serviceId: ceramic.id, price: ceramic.basePrice },
          ],
        },
      },
      update: {
      },
    });

    const completedAt = new Date();
    completedAt.setDate(completedAt.getDate() - 7);
    completedAt.setHours(18, 0, 0, 0);
    await prisma.visit.upsert({
      where: { id: "test-client-visit" },
      create: {
        id: "test-client-visit",
        userId: client.id,
        workerId: worker.id,
        carId: car.id,
        status: "COMPLETED",
        arrivedAt: completedAt,
        completedAt,
        totalAmount: detailingWash.basePrice,
        note: "Тестовый завершённый визит",
        items: {
          create: [
            {
              serviceId: detailingWash.id,
              title: detailingWash.title,
              price: detailingWash.basePrice,
              qty: 1,
            },
          ],
        },
      },
      update: {
      },
    });

    // Keep relation around for realistic admin/worker views.
    await prisma.bookingService.findFirst({
      where: { bookingId: booking.id },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
