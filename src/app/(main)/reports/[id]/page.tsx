"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Badge } from "@/presentation/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";
import { API_ROUTES, METRIC_CATEGORY_LABELS, type MetricCategoryType } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import type { ReportDetailsDTO } from "@/application/dtos/report";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

async function fetchReport(id: string): Promise<ReportDetailsDTO> {
  const response = await fetch(API_ROUTES.REPORT_DETAILS(id));
  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }
  return response.json();
}

function formatMetricValue(
  value: number | null,
  unit: string
): string {
  if (value === null) return "N/A";

  switch (unit) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value);
    case "percentage":
      return `${(value * 100).toFixed(2)}%`;
    case "ratio":
      return value.toFixed(2);
    default:
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(value);
  }
}

export default function ReportPage({ params }: ReportPageProps) {
  const { id } = use(params);

  const { data: report, isLoading, error } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReport(id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>Report Not Found</CardTitle>
          <CardDescription>
            The requested report could not be found.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{report.title}</h1>
          <p className="text-muted-foreground">
            Generated {formatDateTime(report.generatedAt)}
          </p>
        </div>
        {report.pdfUrl && (
          <Button asChild>
            <a
              href={API_ROUTES.REPORT_DOWNLOAD(report.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
              {report.pdfSizeFormatted && (
                <span className="ml-1 text-xs opacity-70">
                  ({report.pdfSizeFormatted})
                </span>
              )}
            </a>
          </Button>
        )}
      </div>

      {report.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {report.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {Object.entries(report.metricsByCategory).map(([category, metrics]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">
              {METRIC_CATEGORY_LABELS[category as MetricCategoryType] ?? category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.code}>
                    <TableCell className="font-medium">{metric.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMetricValue(metric.value, metric.unit)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {metric.period}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          metric.confidence >= 0.8
                            ? "success"
                            : metric.confidence >= 0.5
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {Math.round(metric.confidence * 100)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {report.dataSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {report.dataSources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
