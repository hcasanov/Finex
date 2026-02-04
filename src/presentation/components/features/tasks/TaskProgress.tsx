"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/presentation/components/ui/progress";
import { cn } from "@/lib/utils";
import type { TaskStatusType } from "@/domain/value-objects/TaskStatus";
import { STEP_LABELS, type ExtractionStepType } from "@/lib/constants";

interface TaskStep {
  id: string;
  stepName: ExtractionStepType;
  status: TaskStatusType;
  progress: number;
}

interface TaskProgressProps {
  tasks: TaskStep[];
  overallProgress: number;
}

export function TaskProgress({ tasks, overallProgress }: TaskProgressProps) {
  const getStatusIcon = (status: TaskStatusType) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall Progress</span>
          <span className="text-muted-foreground">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              {getStatusIcon(task.status)}
              {index < tasks.length - 1 && (
                <div
                  className={cn(
                    "mt-2 h-8 w-0.5",
                    task.status === "completed"
                      ? "bg-green-500"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "font-medium",
                    task.status === "processing" && "text-blue-500",
                    task.status === "failed" && "text-destructive"
                  )}
                >
                  {STEP_LABELS[task.stepName]}
                </h4>
                {task.status === "processing" && (
                  <span className="text-sm text-muted-foreground">
                    {task.progress}%
                  </span>
                )}
              </div>
              {task.status === "processing" && (
                <Progress value={task.progress} className="mt-2 h-1" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
