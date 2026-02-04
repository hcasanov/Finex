"use client";

import { Checkbox } from "@/presentation/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Badge } from "@/presentation/components/ui/badge";
import {
  FINANCIAL_METRICS,
  METRIC_CATEGORY_LABELS,
  type MetricCategoryType,
} from "@/lib/constants";

interface MetricSelectorProps {
  selectedMetrics: string[];
  onSelectionChange: (metrics: string[]) => void;
}

export function MetricSelector({
  selectedMetrics,
  onSelectionChange,
}: MetricSelectorProps) {
  const metricsByCategory = FINANCIAL_METRICS.reduce<
    Record<MetricCategoryType, typeof FINANCIAL_METRICS>
  >((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<MetricCategoryType, typeof FINANCIAL_METRICS>);

  const toggleMetric = (code: string) => {
    if (selectedMetrics.includes(code)) {
      onSelectionChange(selectedMetrics.filter((m) => m !== code));
    } else {
      onSelectionChange([...selectedMetrics, code]);
    }
  };

  const toggleCategory = (category: MetricCategoryType) => {
    const categoryMetrics = metricsByCategory[category] ?? [];
    const categoryCodes = categoryMetrics.map((m) => m.code);
    const allSelected = categoryCodes.every((code) =>
      selectedMetrics.includes(code)
    );

    if (allSelected) {
      onSelectionChange(
        selectedMetrics.filter((m) => !categoryCodes.includes(m))
      );
    } else {
      const newSelection = new Set([...selectedMetrics, ...categoryCodes]);
      onSelectionChange(Array.from(newSelection));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Metrics to Extract</h3>
        <Badge variant="secondary">{selectedMetrics.length} selected</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(metricsByCategory) as [MetricCategoryType, typeof FINANCIAL_METRICS][]).map(
          ([category, metrics]) => {
            const categoryCodes = metrics.map((m) => m.code);
            const selectedCount = categoryCodes.filter((c) =>
              selectedMetrics.includes(c)
            ).length;
            const allSelected = selectedCount === categoryCodes.length;

            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={allSelected}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <CardTitle className="text-sm font-medium">
                      {METRIC_CATEGORY_LABELS[category]}
                      <span className="ml-2 text-muted-foreground">
                        ({selectedCount}/{categoryCodes.length})
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics.map((metric) => (
                    <div
                      key={metric.code}
                      className="flex items-start gap-2"
                    >
                      <Checkbox
                        id={metric.code}
                        checked={selectedMetrics.includes(metric.code)}
                        onCheckedChange={() => toggleMetric(metric.code)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <label
                          htmlFor={metric.code}
                          className="cursor-pointer text-sm font-medium"
                        >
                          {metric.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}
