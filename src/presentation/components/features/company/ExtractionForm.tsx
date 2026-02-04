"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import { Label } from "@/presentation/components/ui/label";
import { useToast } from "@/presentation/components/ui/use-toast";
import { MetricSelector } from "./MetricSelector";
import { useCreateExtraction } from "@/presentation/hooks/useExtraction";

interface ExtractionFormProps {
  symbol: string;
}

export function ExtractionForm({ symbol }: ExtractionFormProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const [fiscalYear, setFiscalYear] = useState<number>(currentYear - 1);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const createExtraction = useCreateExtraction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMetrics.length === 0) {
      toast({
        title: "No metrics selected",
        description: "Please select at least one metric to extract.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createExtraction.mutateAsync({
        symbol,
        fiscalYear,
        metrics: selectedMetrics,
      });

      toast({
        title: "Extraction started",
        description: "Your extraction has been queued for processing.",
      });

      router.push(`/tasks?extraction=${result.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start extraction",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="w-40">
          <Label htmlFor="fiscal-year">Fiscal Year</Label>
          <Select
            value={fiscalYear.toString()}
            onValueChange={(value) => setFiscalYear(parseInt(value))}
          >
            <SelectTrigger id="fiscal-year" className="mt-1.5">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <MetricSelector
        selectedMetrics={selectedMetrics}
        onSelectionChange={setSelectedMetrics}
      />

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={createExtraction.isPending || selectedMetrics.length === 0}
        >
          {createExtraction.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Extraction
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
