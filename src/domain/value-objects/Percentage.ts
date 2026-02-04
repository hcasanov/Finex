export class Percentage {
  private readonly value: number; // Stored as decimal (0.15 = 15%)

  private constructor(value: number) {
    this.value = value;
  }

  static fromDecimal(decimal: number): Percentage {
    if (!Number.isFinite(decimal)) {
      throw new Error("Value must be a finite number");
    }
    return new Percentage(decimal);
  }

  static fromPercent(percent: number): Percentage {
    if (!Number.isFinite(percent)) {
      throw new Error("Value must be a finite number");
    }
    return new Percentage(percent / 100);
  }

  static zero(): Percentage {
    return new Percentage(0);
  }

  toDecimal(): number {
    return this.value;
  }

  toPercent(): number {
    return this.value * 100;
  }

  add(other: Percentage): Percentage {
    return new Percentage(this.value + other.value);
  }

  subtract(other: Percentage): Percentage {
    return new Percentage(this.value - other.value);
  }

  multiply(factor: number): Percentage {
    return new Percentage(this.value * factor);
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  isNegative(): boolean {
    return this.value < 0;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  format(decimals = 2): string {
    return `${this.toPercent().toFixed(decimals)}%`;
  }

  toJSON(): number {
    return this.value;
  }
}
