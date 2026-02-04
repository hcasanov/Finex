import { DomainError } from "./DomainError";
import type { TaskStatusType } from "../value-objects/TaskStatus";

export class InvalidStatusTransitionError extends DomainError {
  readonly currentStatus: TaskStatusType;
  readonly targetStatus: TaskStatusType;

  constructor(currentStatus: TaskStatusType, targetStatus: TaskStatusType) {
    super(
      `Cannot transition from status "${currentStatus}" to "${targetStatus}".`,
      "INVALID_STATUS_TRANSITION"
    );
    this.currentStatus = currentStatus;
    this.targetStatus = targetStatus;
  }
}
