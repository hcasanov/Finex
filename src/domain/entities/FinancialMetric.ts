import type { MetricCategoryType } from "../value-objects/MetricCategory";

export type MetricUnit = "currency" | "percentage" | "ratio" | "number";

export interface FinancialMetricDefinition {
  code: string;
  name: string;
  category: MetricCategoryType;
  description: string;
  unit: MetricUnit;
  formula?: string;
  isCalculated: boolean;
  displayOrder: number;
}

export interface FinancialMetricProps {
  id: string;
  code: string;
  name: string;
  category: MetricCategoryType;
  description: string;
  unit: MetricUnit;
  formula: string | null;
  isCalculated: boolean;
  displayOrder: number;
  createdAt: Date;
}

export class FinancialMetric {
  private readonly props: FinancialMetricProps;

  private constructor(props: FinancialMetricProps) {
    this.props = props;
  }

  static create(definition: FinancialMetricDefinition): FinancialMetric {
    return new FinancialMetric({
      id: crypto.randomUUID(),
      code: definition.code,
      name: definition.name,
      category: definition.category,
      description: definition.description,
      unit: definition.unit,
      formula: definition.formula ?? null,
      isCalculated: definition.isCalculated,
      displayOrder: definition.displayOrder,
      createdAt: new Date(),
    });
  }

  static reconstitute(props: FinancialMetricProps): FinancialMetric {
    return new FinancialMetric(props);
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get category(): MetricCategoryType {
    return this.props.category;
  }

  get description(): string {
    return this.props.description;
  }

  get unit(): MetricUnit {
    return this.props.unit;
  }

  get formula(): string | null {
    return this.props.formula;
  }

  get isCalculated(): boolean {
    return this.props.isCalculated;
  }

  get displayOrder(): number {
    return this.props.displayOrder;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  formatValue(value: number | null): string {
    if (value === null) return "N/A";

    switch (this.props.unit) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value);
      case "percentage":
        return `${(value * 100).toFixed(2)}%`;
      case "ratio":
        return value.toFixed(2);
      case "number":
        return new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(value);
      default:
        return value.toString();
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      code: this.props.code,
      name: this.props.name,
      category: this.props.category,
      description: this.props.description,
      unit: this.props.unit,
      formula: this.props.formula,
      isCalculated: this.props.isCalculated,
      displayOrder: this.props.displayOrder,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
