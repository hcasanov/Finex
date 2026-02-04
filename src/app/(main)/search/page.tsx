import { SearchAutocomplete } from "@/presentation/components/features/search";

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Financial Data Extraction
        </h1>
        <p className="text-lg text-muted-foreground">
          Search for any publicly traded company to extract financial metrics
        </p>
      </div>
      <SearchAutocomplete />
      <p className="mt-6 text-sm text-muted-foreground">
        Try searching for &quot;Apple&quot;, &quot;MSFT&quot;, or &quot;Tesla&quot;
      </p>
    </div>
  );
}
