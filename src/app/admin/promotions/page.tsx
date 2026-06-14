import { Gift } from "lucide-react";
import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PromotionsManager } from "@/components/admin/promotions-manager";
import { EmptyState, PageHeading } from "@/components/dashboard/ui";

export const metadata = { title: "Акции" };

export default async function AdminPromotionsPage() {
  await requirePageUser(["ADMIN"]);
  const promotions = await prisma.promotion.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeading
        title="Акции и скидки"
        subtitle="Управляйте временными акциями и бонусными предложениями"
      />
      {promotions.length === 0 && (
        <EmptyState
          title="Акций пока нет"
          hint="Создайте первую акцию ниже"
          icon={<Gift className="h-8 w-8" />}
        />
      )}
      <div className="mt-5">
        <PromotionsManager promotions={promotions} />
      </div>
    </>
  );
}
