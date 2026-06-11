import { PrismaClient } from "@prisma/client";
import { SEED_SERVICES, BUSINESS } from "../src/lib/constants";

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
        title: s.title,
        shortDesc: s.shortDesc,
        category: s.category,
        basePrice: s.basePrice,
        durationMin: s.durationMin,
        sortOrder: s.sortOrder,
      },
    });
  }

  console.log("Seeding content blocks…");
  const content: Array<[string, string, string]> = [
    ["hero.title", "text", "Глубокая забота о вашем автомобиле"],
    [
      "hero.subtitle",
      "text",
      "Детейлинг-студия «Омут» в центре Самары. Полировка, химчистка, керамика и защита кузова — с прозрачными ценами и личным кабинетом.",
    ],
    ["about.title", "text", "Почему «Омут»"],
    [
      "about.text",
      "text",
      "Мы относимся к каждому автомобилю как к своему: безопасные технологии, премиальные материалы и контроль качества на каждом этапе. Вы видите историю всех работ в личном кабинете и всегда знаете стоимость заранее.",
    ],
    ["contacts.address", "text", BUSINESS.addressFull],
    ["contacts.hours", "text", BUSINESS.hours],
    ["contacts.phone", "text", BUSINESS.phone],
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
