"use client";

import { use } from "react";
import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Separator } from "@/presentation/components/ui/separator";
import {
  CompanyHeader,
  CompanyHeaderSkeleton,
  ExtractionForm,
} from "@/presentation/components/features/company";
import { useCompany } from "@/presentation/hooks/useCompany";

interface CompanyPageProps {
  params: Promise<{ symbol: string }>;
}

export default function CompanyPage({ params }: CompanyPageProps) {
  const { symbol } = use(params);
  const { data: company, isLoading, error } = useCompany(symbol);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <CompanyHeaderSkeleton />
        <Separator />
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Company Not Found</CardTitle>
          </div>
          <CardDescription>
            We couldn&apos;t find a company with the symbol &quot;{symbol}&quot;.
            Please check the symbol and try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <CompanyHeader company={company} />

      {company.description && (
        <p className="max-w-3xl text-sm text-muted-foreground">
          {company.description}
        </p>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Extract Financial Data</CardTitle>
          <CardDescription>
            Select the fiscal year and metrics you want to extract from{" "}
            {company.name}&apos;s financial reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExtractionForm symbol={company.symbol} />
        </CardContent>
      </Card>
    </div>
  );
}
