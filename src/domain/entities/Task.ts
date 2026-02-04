import {
  TaskStatus,
  TaskStatusType,
  canTransitionTo,
} from "../value-objects/TaskStatus";
import { InvalidStatusTransitionError } from "../errors/InvalidStatusTransitionError";

export type ExtractionStep =
  | "fetch_documents"
  | "vectorize"
  | "extract_data"
  | "generate_report";

export interface TaskProps {
  id: string;
  extractionId: string;
  stepName: ExtractionStep;
  status: TaskStatusType;
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
  errorMessage: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  id?: string;
  extractionId: string;
  stepName: ExtractionStep;
}

export class Task {
  private readonly props: TaskProps;

  private constructor(props: TaskProps) {
    this.props = props;
  }

  static create(input: CreateTaskInput): Task {
    const now = new Date();
    return new Task({
      id: input.id ?? crypto.randomUUID(),
      extractionId: input.extractionId,
      stepName: input.stepName,
      status: TaskStatus.PENDING,
      progress: 0,
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  get id(): string {
    return this.props.id;
  }

  get extractionId(): string {
    return this.props.extractionId;
  }

  get stepName(): ExtractionStep {
    return this.props.stepName;
  }

  get status(): TaskStatusType {
    return this.props.status;
  }

  get progress(): number {
    return this.props.progress;
  }

  get startedAt(): Date | null {
    return this.props.startedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get errorMessage(): string | null {
    return this.props.errorMessage;
  }

  get metadata(): Record<string, unknown> | null {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  private transitionTo(newStatus: TaskStatusType): void {
    if (!canTransitionTo(this.props.status, newStatus)) {
      throw new InvalidStatusTransitionError(this.props.status, newStatus);
    }
    this.props.status = newStatus;
    this.props.updatedAt = new Date();
  }

  start(): void {
    this.transitionTo(TaskStatus.PROCESSING);
    this.props.startedAt = new Date();
  }

  updateProgress(progress: number): void {
    this.props.progress = Math.min(100, Math.max(0, progress));
    this.props.updatedAt = new Date();
  }

  complete(metadata?: Record<string, unknown>): void {
    this.transitionTo(TaskStatus.COMPLETED);
    this.props.progress = 100;
    this.props.completedAt = new Date();
    if (metadata) {
      this.props.metadata = metadata;
    }
  }

  fail(errorMessage: string): void {
    this.transitionTo(TaskStatus.FAILED);
    this.props.errorMessage = errorMessage;
    this.props.completedAt = new Date();
  }

  cancel(): void {
    this.transitionTo(TaskStatus.CANCELLED);
    this.props.completedAt = new Date();
  }

  setMetadata(metadata: Record<string, unknown>): void {
    this.props.metadata = metadata;
    this.props.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      extractionId: this.props.extractionId,
      stepName: this.props.stepName,
      status: this.props.status,
      progress: this.props.progress,
      startedAt: this.props.startedAt?.toISOString() ?? null,
      completedAt: this.props.completedAt?.toISOString() ?? null,
      errorMessage: this.props.errorMessage,
      metadata: this.props.metadata,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
