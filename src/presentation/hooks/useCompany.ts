"use client";

import { useQuery } from "@tanstack/react-query";
import type { CompanyDetailsDTO } from "@/application/dtos/company";
import { API_ROUTES } from "@/lib/constants";

async function fetchCompany(symbol: string): Promise<CompanyDetailsDTO> {
  const response = await fetch(API_ROUTES.COMPANY_DETAILS(symbol));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Company not found");
    }
    throw new Error("Failed to fetch company");
  }

  return response.json();
}

export function useCompany(symbol: string) {
  return useQuery({
    queryKey: ["company", symbol],
    queryFn: () => fetchCompany(symbol),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
