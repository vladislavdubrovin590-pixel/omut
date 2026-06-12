import { Car as CarIcon } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading } from "@/components/dashboard/ui";
import { ProfileForm } from "@/components/cabinet/profile-form";
import { PushToggle } from "@/components/cabinet/push-toggle";
import { BODY_CLASS_LABELS } from "@/lib/utils";

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
            <h2 className="mb-4 text-lg font-semibold">Уведомления</h2>
            <PushToggle />
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Мои автомобили</h2>
            {cars.length === 0 ? (
              <EmptyState
                title="Автомобили не добавлены"
                hint="Авто добавляется автоматически при записи"
                icon={<CarIcon className="h-7 w-7" />}
              />
            ) : (
              <div className="space-y-2">
                {cars.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-surface/60 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm text-foam">
                        {c.make} {c.model}
                      </div>
                      <div className="text-xs text-mute">
                        {BODY_CLASS_LABELS[c.bodyClass]}
                        {c.plate ? ` · ${c.plate}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
