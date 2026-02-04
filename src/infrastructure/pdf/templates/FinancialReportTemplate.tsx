import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ExtractedMetric } from "@/domain/entities/Report";
import { FINANCIAL_METRICS, type MetricCategoryType } from "@/lib/constants";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #1a1a1a",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    padding: 8,
  },
  summaryText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333333",
    textAlign: "justify",
  },
  table: {
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    padding: 8,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #e0e0e0",
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: "#f9f9f9",
  },
  tableCell: {
    fontSize: 10,
    color: "#333333",
  },
  metricName: {
    width: "40%",
  },
  metricValue: {
    width: "25%",
    textAlign: "right",
  },
  metricPeriod: {
    width: "20%",
    textAlign: "center",
  },
  metricConfidence: {
    width: "15%",
    textAlign: "right",
  },
  confidenceHigh: {
    color: "#16a34a",
  },
  confidenceMedium: {
    color: "#ca8a04",
  },
  confidenceLow: {
    color: "#dc2626",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1 solid #e0e0e0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
  sourcesSection: {
    marginTop: 20,
  },
  sourceItem: {
    fontSize: 9,
    color: "#666666",
    marginBottom: 4,
  },
});

interface FinancialReportProps {
  symbol: string;
  companyName?: string;
  fiscalYear: number;
  summary: string;
  metrics: ExtractedMetric[];
  dataSources: string[];
  generatedAt: Date;
}

function formatMetricValue(value: number | null, unit: string): string {
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

function getConfidenceStyle(confidence: number) {
  if (confidence >= 0.8) return styles.confidenceHigh;
  if (confidence >= 0.5) return styles.confidenceMedium;
  return styles.confidenceLow;
}

function groupMetricsByCategory(
  metrics: ExtractedMetric[]
): Record<string, ExtractedMetric[]> {
  const grouped: Record<string, ExtractedMetric[]> = {};

  for (const metric of metrics) {
    const definition = FINANCIAL_METRICS.find((m) => m.code === metric.code);
    const category = definition?.category ?? "other";

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(metric);
  }

  return grouped;
}

const CATEGORY_LABELS: Record<MetricCategoryType, string> = {
  revenue_profits: "Revenue & Profits",
  charges_investments: "Charges & Investments",
  balance_sheet: "Balance Sheet",
  ratios: "Financial Ratios",
  cash_flow: "Cash Flow",
};

export function FinancialReportTemplate({
  symbol,
  companyName,
  fiscalYear,
  summary,
  metrics,
  dataSources,
  generatedAt,
}: FinancialReportProps) {
  const metricsByCategory = groupMetricsByCategory(metrics);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {companyName ?? symbol} Financial Report
          </Text>
          <Text style={styles.subtitle}>
            Fiscal Year {fiscalYear} | Generated{" "}
            {generatedAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Metrics by Category */}
        {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {CATEGORY_LABELS[category as MetricCategoryType] ?? category}
            </Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.metricName]}>
                  Metric
                </Text>
                <Text style={[styles.tableHeaderText, styles.metricValue]}>
                  Value
                </Text>
                <Text style={[styles.tableHeaderText, styles.metricPeriod]}>
                  Period
                </Text>
                <Text style={[styles.tableHeaderText, styles.metricConfidence]}>
                  Confidence
                </Text>
              </View>
              {/* Table Rows */}
              {categoryMetrics.map((metric, index) => (
                <View
                  key={metric.code}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 ? styles.tableRowAlt : {},
                  ]}
                >
                  <Text style={[styles.tableCell, styles.metricName]}>
                    {metric.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.metricValue]}>
                    {formatMetricValue(metric.value, metric.unit)}
                  </Text>
                  <Text style={[styles.tableCell, styles.metricPeriod]}>
                    {metric.period}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.metricConfidence,
                      getConfidenceStyle(metric.confidence),
                    ]}
                  >
                    {Math.round(metric.confidence * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Data Sources */}
        <View style={styles.sourcesSection}>
          <Text style={styles.sectionTitle}>Data Sources</Text>
          {dataSources.map((source, index) => (
            <Text key={index} style={styles.sourceItem}>
              • {source}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This report was generated automatically using AI-powered financial
            data extraction. Confidence scores indicate the reliability of each
            extracted metric. Always verify critical financial data with
            official sources.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
