import { Symbol } from "../value-objects/Symbol";
import {
  TaskStatus,
  TaskStatusType,
  canTransitionTo,
} from "../value-objects/TaskStatus";
import { InvalidStatusTransitionError } from "../errors/InvalidStatusTransitionError";

export interface ExtractionProps {
  id: string;
  companyId: string;
  symbol: Symbol;
  fiscalYear: number;
  requestedMetrics: string[];
  status: TaskStatusType;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExtractionInput {
  id?: string;
  companyId: string;
  symbol: string;
  fiscalYear: number;
  requestedMetrics: string[];
}

export class Extraction {
  private readonly props: ExtractionProps;

  private constructor(props: ExtractionProps) {
    this.props = props;
  }

  static create(input: CreateExtractionInput): Extraction {
    const now = new Date();
    return new Extraction({
      id: input.id ?? crypto.randomUUID(),
      companyId: input.companyId,
      symbol: Symbol.create(input.symbol),
      fiscalYear: input.fiscalYear,
      requestedMetrics: [...input.requestedMetrics],
      status: TaskStatus.PENDING,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ExtractionProps): Extraction {
    return new Extraction(props);
  }

  get id(): string {
    return this.props.id;
  }

  get companyId(): string {
    return this.props.companyId;
  }

  get symbol(): Symbol {
    return this.props.symbol;
  }

  get fiscalYear(): number {
    return this.props.fiscalYear;
  }

  get requestedMetrics(): string[] {
    return [...this.props.requestedMetrics];
  }

  get status(): TaskStatusType {
    return this.props.status;
  }

  get errorMessage(): string | null {
    return this.props.errorMessage;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  canCancel(): boolean {
    return (
      this.props.status === TaskStatus.PENDING ||
      this.props.status === TaskStatus.PROCESSING
    );
  }

  isCompleted(): boolean {
    return this.props.status === TaskStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.props.status === TaskStatus.FAILED;
  }

  isPending(): boolean {
    return this.props.status === TaskStatus.PENDING;
  }

  isProcessing(): boolean {
    return this.props.status === TaskStatus.PROCESSING;
  }

  private transitionTo(newStatus: TaskStatusType): void {
    if (!canTransitionTo(this.props.status, newStatus)) {
      throw new InvalidStatusTransitionError(this.props.status, newStatus);
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  markAsProcessing(): void {
    this.transitionTo(TaskStatus.PROCESSING);
  }

  markAsCompleted(): void {
    this.transitionTo(TaskStatus.COMPLETED);
  }

  markAsFailed(errorMessage: string): void {
    this.transitionTo(TaskStatus.FAILED);
    this.props.errorMessage = errorMessage;
  }

  cancel(): void {
    this.transitionTo(TaskStatus.CANCELLED);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      companyId: this.props.companyId,
      symbol: this.props.symbol.toString(),
      fiscalYear: this.props.fiscalYear,
      requestedMetrics: this.props.requestedMetrics,
      status: this.props.status,
      errorMessage: this.props.errorMessage,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
