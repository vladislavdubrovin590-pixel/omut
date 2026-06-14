import "server-only";
import { prisma } from "@/lib/prisma";
import { SEED_SERVICES } from "@/lib/constants";

export type PublicService = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string | null;
  category: string;
  basePrice: number;
  durationMin: number;
  popular: boolean;
};

const FALLBACK_SERVICES: PublicService[] = SEED_SERVICES.map((s, i) => ({
  id: `seed-${i}`,
  slug: s.slug,
  title: s.title,
  shortDesc: s.shortDesc,
  category: s.category,
  basePrice: s.basePrice,
  durationMin: s.durationMin,
  popular: "popular" in s ? (s.popular as boolean) : false,
}));

export async function getServices(): Promise<PublicService[]> {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (services.length === 0) return FALLBACK_SERVICES;
    return services.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      shortDesc: s.shortDesc,
      category: s.category,
      basePrice: s.basePrice,
      durationMin: s.durationMin,
      popular: s.popular,
    }));
  } catch {
    return FALLBACK_SERVICES;
  }
}

export async function getApprovedReviews() {
  try {
    return await prisma.review.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
      take: 9,
    });
  } catch {
    return [];
  }
}

export async function getContent(): Promise<Record<string, string>> {
  try {
    const blocks = await prisma.contentBlock.findMany();
    return Object.fromEntries(blocks.map((b) => [b.key, b.value]));
  } catch {
    return {};
  }
}

export async function getGallery() {
  try {
    return await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getActivePromotions() {
  const now = new Date();
  try {
    return await prisma.promotion.findMany({
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}
