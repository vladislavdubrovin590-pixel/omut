import { Bell } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading, StatCard } from "@/components/dashboard/ui";
import { PushSender } from "@/components/admin/push-sender";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Уведомления" };

export default async function AdminPush() {
  await requirePageUser(["ADMIN"]);

  const [history, subscribers] = await Promise.all([
    prisma.pushNotification.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.pushToken.count(),
  ]);

  const configured = Boolean(
    process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  );

  return (
    <>
      <PageHeading title="Push-уведомления" subtitle="Рассылки клиентам в браузер" />

      <div className="mb-6 grid grid-cols-2 gap-4">
        <StatCard label="Подписчиков" value={subscribers} icon={<Bell className="h-5 w-5" />} />
        <StatCard label="Отправлено рассылок" value={history.length} />
      </div>

      <div className="space-y-6">
        <PushSender configured={configured} />

        <div>
          <h2 className="mb-3 text-lg font-semibold">История рассылок</h2>
          {history.length === 0 ? (
            <EmptyState title="Рассылок ещё не было" icon={<Bell className="h-8 w-8" />} />
          ) : (
            <div className="space-y-2">
              {history.map((n) => (
                <Card key={n.id} className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-foam">{n.title}</div>
                    <p className="mt-0.5 text-sm text-mist">{n.body}</p>
                    <p className="mt-1 text-xs text-mute">{formatDate(n.createdAt, true)}</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-teal">доставлено: {n.deliveredCount}</div>
                    {n.failedCount > 0 && (
                      <div className="text-red-300">ошибок: {n.failedCount}</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
