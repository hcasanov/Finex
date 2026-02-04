import { DomainError } from "./DomainError";

export class InvalidSymbolError extends DomainError {
  readonly invalidValue: string;

  constructor(value: string) {
    super(
      `Invalid stock symbol: "${value}". Symbol must be 1-5 uppercase letters, optionally followed by a dot and 1-2 letters.`,
      "INVALID_SYMBOL"
    );
    this.invalidValue = value;
  }
}
