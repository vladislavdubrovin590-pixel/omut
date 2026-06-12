import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/dashboard/ui";
import { ServicesManager } from "@/components/admin/services-manager";

export const metadata = { title: "Услуги" };

export default async function AdminServices() {
  await requirePageUser(["ADMIN"]);
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  const data = services.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDesc: s.shortDesc ?? "",
    category: s.category,
    basePrice: s.basePrice,
    durationMin: s.durationMin,
    active: s.active,
    popular: s.popular,
    sortOrder: s.sortOrder,
  }));

  return (
    <>
      <PageHeading title="Услуги" subtitle="Каталог услуг и цены — отображаются на сайте" />
      <ServicesManager services={data} />
    </>
  );
}
