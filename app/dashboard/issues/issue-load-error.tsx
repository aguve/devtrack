"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function IssueLoadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4 space-y-3">
      <p role="alert" className="text-red-800">Could not load your issues. Try again.</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="rounded-md border border-slate-400 bg-white px-3 py-2 font-medium disabled:opacity-60"
      >
        {pending ? "Retrying…" : "Retry loading issues"}
      </button>
    </div>
  );
}
