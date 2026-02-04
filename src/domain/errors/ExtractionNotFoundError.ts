import { DomainError } from "./DomainError";

export class ExtractionNotFoundError extends DomainError {
  readonly extractionId: string;

  constructor(extractionId: string) {
    super(
      `Extraction with ID "${extractionId}" was not found.`,
      "EXTRACTION_NOT_FOUND"
    );
    this.extractionId = extractionId;
  }
}
