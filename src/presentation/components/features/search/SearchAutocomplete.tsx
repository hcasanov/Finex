"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Loader2 } from "lucide-react";
import { Input } from "@/presentation/components/ui/input";
import { useCompanySearch } from "@/presentation/hooks/useCompanySearch";
import { cn } from "@/lib/utils";

export function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const { data, isLoading, isFetching } = useCompanySearch(query);

  const results = data?.results ?? [];
  const showDropdown = isOpen && query.length >= 1;

  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/company/${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex].symbol);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a company by name or symbol..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="h-12 pl-10 pr-10 text-base"
        />
        {(isLoading || isFetching) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md"
        >
          {results.length === 0 && !isLoading && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              {query.length >= 1
                ? "No companies found"
                : "Start typing to search"}
            </li>
          )}
          {results.map((company, index) => (
            <li
              key={company.symbol}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 text-sm outline-none",
                selectedIndex === index
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleSelect(company.symbol)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-1 flex-col">
                <span className="font-medium">{company.name}</span>
                <span className="text-xs text-muted-foreground">
                  {company.symbol}
                  {company.exchange && ` · ${company.exchange}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
