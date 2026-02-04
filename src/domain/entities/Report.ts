export interface ExtractedMetric {
  code: string;
  name: string;
  value: number | null;
  unit: "currency" | "percentage" | "ratio" | "number";
  period: string;
  source: string | null;
  confidence: number;
}

export interface ReportProps {
  id: string;
  extractionId: string;
  companyId: string;
  title: string;
  summary: string | null;
  pdfUrl: string | null;
  pdfSizeBytes: number | null;
  extractedMetrics: ExtractedMetric[];
  dataSources: string[];
  generatedAt: Date;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface CreateReportInput {
  id?: string;
  extractionId: string;
  companyId: string;
  title: string;
  summary?: string | null;
  pdfUrl?: string | null;
  pdfSizeBytes?: number | null;
  extractedMetrics: ExtractedMetric[];
  dataSources?: string[];
  expiresAt?: Date | null;
}

export class Report {
  private readonly props: ReportProps;

  private constructor(props: ReportProps) {
    this.props = props;
  }

  static create(input: CreateReportInput): Report {
    const now = new Date();
    return new Report({
      id: input.id ?? crypto.randomUUID(),
      extractionId: input.extractionId,
      companyId: input.companyId,
      title: input.title,
      summary: input.summary ?? null,
      pdfUrl: input.pdfUrl ?? null,
      pdfSizeBytes: input.pdfSizeBytes ?? null,
      extractedMetrics: [...input.extractedMetrics],
      dataSources: input.dataSources ?? [],
      generatedAt: now,
      expiresAt: input.expiresAt ?? null,
      createdAt: now,
    });
  }

  static reconstitute(props: ReportProps): Report {
    return new Report(props);
  }

  get id(): string {
    return this.props.id;
  }

  get extractionId(): string {
    return this.props.extractionId;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get title(): string {
    return this.props.title;
  }

  get summary(): string | null {
    return this.props.summary;
  }

  get pdfUrl(): string | null {
    return this.props.pdfUrl;
  }

  get pdfSizeBytes(): number | null {
    return this.props.pdfSizeBytes;
  }

  get extractedMetrics(): ExtractedMetric[] {
    return [...this.props.extractedMetrics];
  }

  get dataSources(): string[] {
    return [...this.props.dataSources];
  }

  get generatedAt(): Date {
    return this.props.generatedAt;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  isExpired(): boolean {
    if (!this.props.expiresAt) return false;
    return new Date() > this.props.expiresAt;
  }

  hasPdf(): boolean {
    return this.props.pdfUrl !== null;
  }

  getMetricByCode(code: string): ExtractedMetric | undefined {
    return this.props.extractedMetrics.find((m) => m.code === code);
  }

  getMetricsByCategory(
    category: string,
    metricDefinitions: Array<{ code: string; category: string }>
  ): ExtractedMetric[] {
    const categoryCodes = metricDefinitions
      .filter((m) => m.category === category)
      .map((m) => m.code);

    return this.props.extractedMetrics.filter((m) =>
      categoryCodes.includes(m.code)
    );
  }

  setPdfUrl(url: string, sizeBytes: number): void {
    this.props.pdfUrl = url;
    this.props.pdfSizeBytes = sizeBytes;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      extractionId: this.props.extractionId,
      companyId: this.props.companyId,
      title: this.props.title,
      summary: this.props.summary,
      pdfUrl: this.props.pdfUrl,
      pdfSizeBytes: this.props.pdfSizeBytes,
      extractedMetrics: this.props.extractedMetrics,
      dataSources: this.props.dataSources,
      generatedAt: this.props.generatedAt.toISOString(),
      expiresAt: this.props.expiresAt?.toISOString() ?? null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
