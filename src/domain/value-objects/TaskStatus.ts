export const TaskStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

export function isValidTaskStatus(status: string): status is TaskStatusType {
  return Object.values(TaskStatus).includes(status as TaskStatusType);
}

export function canTransitionTo(
  current: TaskStatusType,
  next: TaskStatusType
): boolean {
  const validTransitions: Record<TaskStatusType, TaskStatusType[]> = {
    [TaskStatus.PENDING]: [TaskStatus.PROCESSING, TaskStatus.CANCELLED],
    [TaskStatus.PROCESSING]: [
      TaskStatus.COMPLETED,
      TaskStatus.FAILED,
      TaskStatus.CANCELLED,
    ],
    [TaskStatus.COMPLETED]: [],
    [TaskStatus.FAILED]: [],
    [TaskStatus.CANCELLED]: [],
  };

  return validTransitions[current].includes(next);
}
