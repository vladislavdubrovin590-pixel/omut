"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, EyeOff, Loader2, Trash2 } from "lucide-react";
import { setReviewApproval, deleteReview } from "@/lib/actions/admin";

export function ReviewActions({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-mute" />}
      <button
        onClick={() =>
          start(async () => {
            await setReviewApproval(id, !approved);
            router.refresh();
          })
        }
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
          approved
            ? "border-line text-mist hover:border-amber-400/50 hover:text-amber-300"
            : "border-teal/40 text-teal hover:bg-teal/10"
        }`}
      >
        {approved ? <EyeOff className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
        {approved ? "Скрыть" : "Опубликовать"}
      </button>
      <button
        onClick={() =>
          start(async () => {
            await deleteReview(id);
            router.refresh();
          })
        }
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-mist hover:border-red-400/50 hover:text-red-300"
      >
        <Trash2 className="h-3.5 w-3.5" /> Удалить
      </button>
    </div>
  );
}
