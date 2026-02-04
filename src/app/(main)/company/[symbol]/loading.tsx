import { Separator } from "@/presentation/components/ui/separator";
import { CompanyHeaderSkeleton } from "@/presentation/components/features/company";

export default function CompanyLoading() {
  return (
    <div className="space-y-8">
      <CompanyHeaderSkeleton />
      <Separator />
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
