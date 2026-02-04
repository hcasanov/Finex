"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import type { CompanySearchResponseDTO } from "@/application/dtos/company";
import { API_ROUTES } from "@/lib/constants";

// Debounce delay of 2 seconds to avoid excessive API calls
const DEBOUNCE_DELAY_MS = 2000;

async function searchCompanies(
  query: string,
  signal: AbortSignal
): Promise<CompanySearchResponseDTO> {
  const response = await fetch(
    `${API_ROUTES.COMPANIES_SEARCH}?q=${encodeURIComponent(query)}&limit=10`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Failed to search companies");
  }

  return response.json();
}

export function useCompanySearch(query: string) {
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY_MS);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  // Cancel any in-flight request when query changes or component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [debouncedQuery]);

  return useQuery({
    queryKey: ["companies", "search", debouncedQuery],
    queryFn: async () => {
      // Abort previous request if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        const result = await searchCompanies(
          debouncedQuery,
          abortControllerRef.current.signal
        );
        return result;
      } catch (error) {
        // Don't throw on abort - it's expected behavior
        if (error instanceof Error && error.name === "AbortError") {
          // Return previous data or empty result on abort
          const previousData = queryClient.getQueryData<CompanySearchResponseDTO>([
            "companies",
            "search",
            debouncedQuery,
          ]);
          return previousData ?? { results: [], total: 0 };
        }
        throw error;
      }
    },
    enabled: debouncedQuery.length >= 1,
    staleTime: 1000 * 60 * 5, // 5 minutes - cache results
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in memory
    refetchOnWindowFocus: false, // Don't refetch when user focuses window
    retry: false, // Don't retry on failure
  });
}
