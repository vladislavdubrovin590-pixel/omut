import { BadgePercent, Car as CarIcon } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading } from "@/components/dashboard/ui";
import { ProfileForm } from "@/components/cabinet/profile-form";
import { PushToggle } from "@/components/cabinet/push-toggle";
import { CarsManager } from "@/components/cabinet/cars-manager";

export const metadata = { title: "Профиль" };

export default async function ProfilePage() {
  const user = await requirePageUser();
  const cars = await prisma.car.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeading title="Профиль" subtitle="Контактные данные, автомобили и уведомления" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Личные данные</h2>
          <ProfileForm
            initialName={user.name ?? ""}
            initialPhone={user.phone ?? ""}
          />
          {user.email && (
            <p className="mt-4 text-xs text-mute">Email: {user.email}</p>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-aqua/10 text-aqua">
                <BadgePercent className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Персональная скидка</h2>
                <p className="mt-1 text-2xl font-semibold text-aqua">
                  {user.bonusDiscountPercent}%
                </p>
                <p className="mt-1 text-sm text-mute">
                  {user.bonusDiscountPercent > 0
                    ? "Скидка автоматически применяется при онлайн-записи."
                    : "Администратор может назначить скидку в карточке клиента."}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Уведомления</h2>
            <PushToggle />
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Мои автомобили</h2>
            {cars.length === 0 ? (
              <EmptyState
                title="Автомобили не добавлены"
                hint="Добавьте авто вручную или при записи"
                icon={<CarIcon className="h-7 w-7" />}
              />
            ) : null}
            <div className={cars.length === 0 ? "mt-4" : ""}>
              <CarsManager cars={cars} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
