import { redirect } from "next/navigation";

export default async function PublicBookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const params = await searchParams;
  const query = params.service
    ? `?service=${encodeURIComponent(params.service)}`
    : "";

  redirect(`/cabinet/book${query}`);
}
