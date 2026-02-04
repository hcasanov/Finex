"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import { TaskProgress } from "@/presentation/components/features/tasks";
import { useExtraction } from "@/presentation/hooks/useExtraction";
import { formatDateTime } from "@/lib/utils";
import type { ExtractionStepType } from "@/lib/constants";

function TasksContent() {
  const searchParams = useSearchParams();
  const extractionId = searchParams.get("extraction");

  const { data: extraction, isLoading } = useExtraction(extractionId, {
    polling: true,
  });

  if (!extractionId) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>No Active Task</CardTitle>
          <CardDescription>
            Start an extraction from a company page to see its progress here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/search">Search Companies</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!extraction) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Task Not Found</CardTitle>
          <CardDescription>
            The requested extraction task could not be found.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const isCompleted = extraction.status === "completed";
  const isFailed = extraction.status === "failed";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extraction Task</h1>
        <p className="text-muted-foreground">
          {extraction.symbol} - FY{extraction.fiscalYear}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Progress</CardTitle>
            <Badge
              variant={
                isCompleted
                  ? "success"
                  : isFailed
                  ? "destructive"
                  : "secondary"
              }
            >
              {extraction.status}
            </Badge>
          </div>
          <CardDescription>
            Started {formatDateTime(extraction.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TaskProgress
            tasks={extraction.tasks.map((t) => ({
              ...t,
              stepName: t.stepName as ExtractionStepType,
            }))}
            overallProgress={extraction.overallProgress}
          />
        </CardContent>
      </Card>

      {isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Report Ready
            </CardTitle>
            <CardDescription>
              Your financial data extraction is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/reports/${extraction.id}`}>View Report</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isFailed && extraction.errorMessage && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {extraction.errorMessage}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}
