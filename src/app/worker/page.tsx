import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/dashboard/ui";
import { WorkerConsole } from "@/components/worker/worker-console";
import { applyPercentDiscount, bookingDisplayTotal } from "@/lib/utils";

export const metadata = { title: "Приёмка" };

export default async function WorkerPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; booking?: string }>;
}) {
  const user = await requirePageUser(["WORKER", "ADMIN"]);
  const params = await searchParams;
  const requestedBookingId = params.booking;
  const initialTab = params.tab === "new" || requestedBookingId ? "new" : "today";

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const bookingInclude = {
    services: { include: { service: true } },
    car: true,
    user: true,
  };

  const [bookings, services, requestedBooking] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        scheduledAt: { lte: end },
        ...(user.role === "WORKER"
          ? { OR: [{ workerId: user.id }, { workerId: null }] }
          : {}),
      },
      include: bookingInclude,
      orderBy: { scheduledAt: "asc" },
      take: 50,
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, basePrice: true },
    }),
    requestedBookingId
      ? prisma.booking.findFirst({
          where: {
            id: requestedBookingId,
            status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
            ...(user.role === "WORKER"
              ? { OR: [{ workerId: user.id }, { workerId: null }] }
              : {}),
          },
          include: bookingInclude,
        })
      : Promise.resolve(null),
  ]);

  const allBookings =
    requestedBooking && !bookings.some((b) => b.id === requestedBooking.id)
      ? [requestedBooking, ...bookings]
      : bookings;

  const dto = allBookings.map((b) => ({
    id: b.id,
    scheduledAt: b.scheduledAt.toISOString(),
    status: b.status,
    clientId: b.userId,
    clientName: b.user.name ?? b.user.phone ?? b.user.email ?? "Клиент",
    clientDiscountPercent: b.user.bonusDiscountPercent,
    carLabel: b.car ? `${b.car.make} ${b.car.model}${b.car.plate ? ` · ${b.car.plate}` : ""}` : null,
    services: b.services.map((s) => ({
      serviceId: s.serviceId,
      title: s.service.title,
      price: applyPercentDiscount(s.service.basePrice, b.user.bonusDiscountPercent),
    })),
    estimatedTotal: bookingDisplayTotal(
      b.status,
      b.estimatedTotal,
      b.services,
      b.user.bonusDiscountPercent,
    ),
    note: b.note,
  }));

  return (
    <>
      <PageHeading
        title="Приёмка автомобилей"
        subtitle="Подтверждайте приезд и оформляйте выполненные услуги"
      />
      <WorkerConsole
        bookings={dto}
        services={services}
        initialTab={initialTab}
        initialBookingId={requestedBooking?.id ?? null}
      />
    </>
  );
}
