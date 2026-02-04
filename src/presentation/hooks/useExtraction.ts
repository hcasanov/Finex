"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateExtractionRequestDTO,
  ExtractionWithTasksDTO,
} from "@/application/dtos/extraction";
import { API_ROUTES } from "@/lib/constants";

async function createExtraction(
  data: CreateExtractionRequestDTO
): Promise<ExtractionWithTasksDTO> {
  const response = await fetch(API_ROUTES.EXTRACTIONS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error ?? "Failed to create extraction");
  }

  return response.json();
}

async function fetchExtraction(id: string): Promise<ExtractionWithTasksDTO> {
  const response = await fetch(API_ROUTES.EXTRACTION_DETAILS(id));

  if (!response.ok) {
    throw new Error("Failed to fetch extraction");
  }

  return response.json();
}

async function cancelExtraction(id: string): Promise<{ success: boolean }> {
  const response = await fetch(API_ROUTES.EXTRACTION_CANCEL(id), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to cancel extraction");
  }

  return response.json();
}

export function useCreateExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExtraction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
    },
  });
}

export function useExtraction(id: string | null, options?: { polling?: boolean }) {
  return useQuery({
    queryKey: ["extraction", id],
    queryFn: () => fetchExtraction(id!),
    enabled: !!id,
    refetchInterval: options?.polling ? 3000 : false, // Poll every 3 seconds
  });
}

export function useCancelExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelExtraction,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["extraction", id] });
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
    },
  });
}
