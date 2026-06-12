import { Star } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, EmptyState, PageHeading, StatusBadge } from "@/components/dashboard/ui";
import { ReviewActions } from "@/components/admin/review-actions";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Отзывы" };

export default async function AdminReviews() {
  await requirePageUser(["ADMIN"]);
  const reviews = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeading
        title="Отзывы"
        subtitle="Публикация и модерация отзывов клиентов"
      />

      {reviews.length === 0 ? (
        <EmptyState title="Отзывов пока нет" icon={<Star className="h-8 w-8" />} />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foam">{r.authorName}</span>
                  <span className="flex items-center gap-0.5 text-amber-300">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                  <StatusBadge
                    status={r.approved ? "COMPLETED" : "PENDING"}
                    label={r.approved ? "Опубликован" : "На модерации"}
                  />
                </div>
                <p className="mt-2 text-sm text-mist">{r.text}</p>
                <p className="mt-1 text-xs text-mute">{formatDate(r.createdAt)}</p>
              </div>
              <ReviewActions id={r.id} approved={r.approved} />
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
