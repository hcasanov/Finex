"use client";

import Image from "next/image";
import { Building2, Globe, MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/presentation/components/ui/badge";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import type { CompanyDetailsDTO } from "@/application/dtos/company";

interface CompanyHeaderProps {
  company: CompanyDetailsDTO;
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      {/* Logo */}
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-background">
        {company.logoUrl ? (
          <Image
            src={company.logoUrl}
            alt={`${company.name} logo`}
            width={64}
            height={64}
            className="rounded"
          />
        ) : (
          <Building2 className="h-10 w-10 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 space-y-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{company.name}</h1>
            <Badge variant="secondary" className="text-sm font-mono">
              {company.symbol}
            </Badge>
          </div>
          {company.exchange && (
            <p className="text-sm text-muted-foreground">{company.exchange}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {company.sector && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{company.sector}</span>
              {company.industry && (
                <span className="text-muted-foreground">· {company.industry}</span>
              )}
            </div>
          )}
          {company.country && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{company.country}</span>
            </div>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
        </div>

        {company.marketCapFormatted && (
          <div className="text-lg font-semibold">
            Market Cap: {company.marketCapFormatted}
          </div>
        )}
      </div>
    </div>
  );
}

export function CompanyHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <Skeleton className="h-20 w-20 rounded-lg" />
      <div className="flex-1 space-y-3">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-7 w-48" />
      </div>
    </div>
  );
}
