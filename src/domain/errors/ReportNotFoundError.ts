import { DomainError } from "./DomainError";

export class ReportNotFoundError extends DomainError {
  readonly reportId: string;

  constructor(reportId: string) {
    super(`Report with ID "${reportId}" was not found.`, "REPORT_NOT_FOUND");
    this.reportId = reportId;
  }
}
