import Link from "next/link";
import type { IssueQuery } from "@/src/core/issues/query";
import { priorityLabels, statusLabels } from "@/src/core/issues/schema";

const controlClass = "mt-1 block w-full rounded-md border border-slate-400 bg-white px-3 py-2";

export function IssueFilters({ query }: { query?: IssueQuery }) {
  return (
    <form key={JSON.stringify(query)} action="/dashboard" method="get" className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="font-medium">
          Search issues
          <input name="q" type="search" defaultValue={query?.q ?? ""} className={controlClass} />
        </label>
        <label className="font-medium">
          Filter by status
          <select name="status" defaultValue={query?.status ?? ""} className={controlClass}>
            <option value="">All statuses</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="font-medium">
          Filter by priority
          <select name="priority" defaultValue={query?.priority ?? ""} className={controlClass}>
            <option value="">All priorities</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white">
          Apply filters
        </button>
        <Link href="/dashboard" className="underline">Clear filters</Link>
      </div>
    </form>
  );
}
