import { Symbol } from "../value-objects/Symbol";

export interface CompanyProps {
  id: string;
  symbol: Symbol;
  name: string;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  country: string | null;
  marketCap: number | null;
  logoUrl: string | null;
  website: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyInput {
  id?: string;
  symbol: string;
  name: string;
  exchange?: string | null;
  sector?: string | null;
  industry?: string | null;
  country?: string | null;
  marketCap?: number | null;
  logoUrl?: string | null;
  website?: string | null;
  description?: string | null;
}

export class Company {
  private readonly props: CompanyProps;

  private constructor(props: CompanyProps) {
    this.props = props;
  }

  static create(input: CreateCompanyInput): Company {
    const now = new Date();
    return new Company({
      id: input.id ?? crypto.randomUUID(),
      symbol: Symbol.create(input.symbol),
      name: input.name,
      exchange: input.exchange ?? null,
      sector: input.sector ?? null,
      industry: input.industry ?? null,
      country: input.country ?? null,
      marketCap: input.marketCap ?? null,
      logoUrl: input.logoUrl ?? null,
      website: input.website ?? null,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: CompanyProps): Company {
    return new Company(props);
  }

  get id(): string {
    return this.props.id;
  }

  get symbol(): Symbol {
    return this.props.symbol;
  }

  get name(): string {
    return this.props.name;
  }

  get exchange(): string | null {
    return this.props.exchange;
  }

  get sector(): string | null {
    return this.props.sector;
  }

  get industry(): string | null {
    return this.props.industry;
  }

  get country(): string | null {
    return this.props.country;
  }

  get marketCap(): number | null {
    return this.props.marketCap;
  }

  get logoUrl(): string | null {
    return this.props.logoUrl;
  }

  get website(): string | null {
    return this.props.website;
  }

  get description(): string | null {
    return this.props.description;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(input: Partial<CreateCompanyInput>): void {
    if (input.name !== undefined) {
      this.props.name = input.name;
    }
    if (input.exchange !== undefined) {
      this.props.exchange = input.exchange;
    }
    if (input.sector !== undefined) {
      this.props.sector = input.sector;
    }
    if (input.industry !== undefined) {
      this.props.industry = input.industry;
    }
    if (input.country !== undefined) {
      this.props.country = input.country;
    }
    if (input.marketCap !== undefined) {
      this.props.marketCap = input.marketCap;
    }
    if (input.logoUrl !== undefined) {
      this.props.logoUrl = input.logoUrl;
    }
    if (input.website !== undefined) {
      this.props.website = input.website;
    }
    if (input.description !== undefined) {
      this.props.description = input.description;
    }
    this.props.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      symbol: this.props.symbol.toString(),
      name: this.props.name,
      exchange: this.props.exchange,
      sector: this.props.sector,
      industry: this.props.industry,
      country: this.props.country,
      marketCap: this.props.marketCap,
      logoUrl: this.props.logoUrl,
      website: this.props.website,
      description: this.props.description,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
