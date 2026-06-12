import { requirePageUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/dashboard/ui";
import { ContentEditor } from "@/components/admin/content-editor";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const metadata = { title: "Контент" };

export default async function AdminContent() {
  await requirePageUser(["ADMIN"]);

  const [blocks, images] = await Promise.all([
    prisma.contentBlock.findMany(),
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const initial = Object.fromEntries(blocks.map((b) => [b.key, b.value]));

  return (
    <>
      <PageHeading
        title="Контент сайта"
        subtitle="Тексты на главной и галерея работ"
      />
      <div className="space-y-6">
        <ContentEditor initial={initial} />
        <GalleryManager
          images={images.map((i) => ({
            id: i.id,
            url: i.url,
            caption: i.caption,
            category: i.category,
          }))}
        />
      </div>
    </>
  );
}
