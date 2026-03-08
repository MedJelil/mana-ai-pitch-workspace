"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  MapPin,
  CheckCircle2,
  Store,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type SelectedStore,
  type StoreResult,
  retailerSearchQueryKey,
  searchRetailerStores,
} from "@/lib/api/retailer-search";
import { searchUSCities, type USCity } from "@/lib/us-cities";

// ---------- props ----------

type Props = {
  value: SelectedStore | null;
  onChange: (store: SelectedStore | null) => void;
  disabled?: boolean;
};

// ---------- component ----------

export default function RetailerSearch({ value, onChange, disabled }: Props) {
  const [brand, setBrand] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [searchState, setSearchState] = useState<{
    brand: string;
    near: string;
  } | null>(null);

  // Controls whether the store results list is visible (hidden after selection)
  const [storeListVisible, setStoreListVisible] = useState(true);

  // Autocomplete state (purely local — no API call)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute suggestions synchronously from local dataset
  const suggestions: USCity[] = useMemo(
    () =>
      locationInput.trim().length >= 1 ? searchUSCities(locationInput, 6) : [],
    [locationInput],
  );

  // Derived: only show the dropdown when there are results and the field is focused
  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Store search query
  const {
    data: results,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: retailerSearchQueryKey(
      searchState?.brand ?? "",
      searchState?.near ?? "",
    ),
    queryFn: () => searchRetailerStores(searchState!.brand, searchState!.near),
    enabled: !!searchState,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ---- handlers ----

  const handleBrandChange = (val: string) => {
    setBrand(val);
    setSearchState(null);
    onChange(null);
  };

  const handleLocationChange = (val: string) => {
    setLocationInput(val);
    setSuggestionsOpen(true);
    setActiveSuggestion(-1);
    setSearchState(null);
    onChange(null);
  };

  const applySuggestion = (city: USCity) => {
    const formatted = `${city.city}, ${city.state}`;
    setLocationInput(formatted);
    setSuggestionsOpen(false);
    setSearchState(null);
    onChange(null);
    inputRef.current?.focus();
  };

  const triggerSearch = (near?: string) => {
    const location = near ?? locationInput;
    if (!brand || !location.trim()) return;
    setSuggestionsOpen(false);
    setStoreListVisible(true);
    setSearchState({ brand, near: location.trim() });
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && activeSuggestion >= 0) {
        e.preventDefault();
        const s = suggestions[activeSuggestion];
        const formatted = `${s.city}, ${s.state}`;
        setLocationInput(formatted);
        setSuggestionsOpen(false);
        triggerSearch(formatted);
        return;
      }
      if (e.key === "Escape") {
        setSuggestionsOpen(false);
        setActiveSuggestion(-1);
        return;
      }
    }
    if (e.key === "Enter") triggerSearch();
  };

  const handleSelectStore = (store: StoreResult) => {
    const city = store.location.locality ?? "";
    const state = store.location.region ?? "";
    const address =
      store.location.address ?? store.location.formatted_address ?? "";

    const isSame =
      value?.storeName === store.name &&
      value?.city === city &&
      value?.state === state;

    if (isSame) {
      onChange(null);
      setStoreListVisible(true);
    } else {
      onChange({
        retailerBrand: brand,
        storeName: store.name,
        address,
        city,
        state,
      });
      setStoreListVisible(false);
    }
  };

  const fetching = isLoading || isFetching;
  const hasSearched = !!searchState;
  const noResults =
    hasSearched && !fetching && !error && (results?.length ?? 0) === 0;

  const storeError = error
    ? (error as Error).message.includes("Foursquare")
      ? "Foursquare API key is invalid or missing. Add a valid key to FOURSQUARE_API_KEY in .env."
      : (error as Error).message
    : null;

  return (
    <div className="space-y-4">
      {/* Retailer Brand — free-text input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Retailer / Brand
        </label>
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 rounded-xl h-11"
            placeholder="e.g. Whole Foods, Walmart, HEB, Costco…"
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={disabled}
            autoComplete="off"
          />
        </div>
      </div>

      {/* Location input with instant local autocomplete */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Location</label>
        <div className="flex gap-2">
          <div className="relative flex-1" ref={containerRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              ref={inputRef}
              className="pl-9 rounded-xl h-11"
              placeholder="City, state or ZIP code (US only)"
              value={locationInput}
              onChange={(e) => handleLocationChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (suggestions.length > 0) setSuggestionsOpen(true);
              }}
              disabled={disabled || !brand}
              autoComplete="off"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((city, i) => {
                  const label = `${city.city}, ${city.state}`;
                  return (
                    <li key={label}>
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault(); // keep input focused
                          applySuggestion(city);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
                          i === activeSuggestion
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted/60 text-foreground"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1">{label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-xl h-11 px-4 shrink-0 flex items-center gap-1"
            onClick={() => triggerSearch()}
            disabled={disabled || !brand || !locationInput.trim() || fetching}
          >
            {fetching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
        {!brand.trim() && (
          <p className="text-xs text-muted-foreground">
            Enter a retailer or brand name first
          </p>
        )}
      </div>

      {/* Store results */}
      {hasSearched && storeListVisible && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Select a Store
          </label>

          {fetching && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-muted/50 animate-pulse"
                />
              ))}
            </div>
          )}

          {storeError && !fetching && (
            <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
              {storeError}
            </div>
          )}

          {noResults && (
            <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
              <Store className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No {brand} stores found near &ldquo;{searchState?.near}&rdquo;.
              <br />
              Try a different city, state, or ZIP code.
            </div>
          )}

          {!fetching && !storeError && (results?.length ?? 0) > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
              {results!.map((store) => {
                const city = store.location.locality ?? "";
                const state = store.location.region ?? "";
                const address =
                  store.location.address ??
                  store.location.formatted_address ??
                  "";
                const isSelected =
                  value?.storeName === store.name &&
                  value?.city === city &&
                  value?.state === state &&
                  value?.address === address;

                return (
                  <button
                    key={store.fsq_id}
                    type="button"
                    onClick={() => handleSelectStore(store)}
                    disabled={disabled}
                    className={`w-full text-left rounded-xl border px-4 py-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isSelected
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {store.name}
                        </p>
                        {address && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {address}
                          </p>
                        )}
                        {(city || state) && (
                          <p className="text-xs text-muted-foreground truncate">
                            {[city, state].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected store confirmation */}
      {value && (
        <div className="rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {value.storeName}
            </p>
            <p className="text-xs text-muted-foreground">
              {[value.city, value.state].filter(Boolean).join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStoreListVisible(true)}
            className="text-xs text-primary hover:text-primary/80 font-medium shrink-0 transition-colors"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}
