import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/dashboard/ui";
import { WorkerConsole } from "@/components/worker/worker-console";

export const metadata = { title: "Приёмка" };

export default async function WorkerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePageUser(["WORKER", "ADMIN"]);
  const params = await searchParams;
  const initialTab = params.tab === "new" ? "new" : "today";

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [bookings, services] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        scheduledAt: { lte: end },
        ...(user.role === "WORKER"
          ? { OR: [{ workerId: user.id }, { workerId: null }] }
          : {}),
      },
      include: {
        services: { include: { service: true } },
        car: true,
        user: true,
      },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, basePrice: true },
    }),
  ]);

  const dto = bookings.map((b) => ({
    id: b.id,
    scheduledAt: b.scheduledAt.toISOString(),
    status: b.status,
    clientId: b.userId,
    clientName: b.user.name ?? b.user.phone ?? b.user.email ?? "Клиент",
    carLabel: b.car ? `${b.car.make} ${b.car.model}${b.car.plate ? ` · ${b.car.plate}` : ""}` : null,
    services: b.services.map((s) => ({
      serviceId: s.serviceId,
      title: s.service.title,
      price: s.service.basePrice,
    })),
    estimatedTotal: b.services.reduce((sum, s) => sum + s.service.basePrice, 0),
    note: b.note,
  }));

  return (
    <>
      <PageHeading
        title="Приёмка автомобилей"
        subtitle="Подтверждайте приезд и оформляйте выполненные услуги"
      />
      <WorkerConsole bookings={dto} services={services} initialTab={initialTab} />
    </>
  );
}
