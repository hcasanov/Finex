"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { Toaster } from "@/presentation/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
