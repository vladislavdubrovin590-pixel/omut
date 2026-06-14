import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/dashboard/ui";
import { BookingForm } from "@/components/cabinet/booking-form";

export const metadata = { title: "Запись на услуги" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      basePrice: true,
      durationMin: true,
    },
  });

  return (
    <>
      <PageHeading
        title="Запись на услуги"
        subtitle="Выберите услуги, удобное время и автомобиль — мы подтвердим заявку"
      />
      <BookingForm services={services} initialServiceSlug={params.service} />
    </>
  );
}
