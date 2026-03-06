"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./Products";

const RETAILERS = ["Whole Foods", "Walmart", "HEB", "Sam's Club"];
const FOCUSES = ["Organic", "Premium", "Value"];

export type PitchResult = {
  id: string;
  productId: string;
  productName: string;
  retailer: string;
  focus: string;
  positioning: string;
  talkingPoints: string[];
  suggestedPitch: string;
  fitScore: number;
  issues: string[];
  suggestions: string[];
  createdAt: string;
};

export default function GeneratePitch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [retailer, setRetailer] = useState("");
  const [focus, setFocus] = useState("");
  const [result, setResult] = useState<PitchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load products");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleGenerate = async () => {
    if (!productId || !retailer || !focus) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/pitches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, retailer, focus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate pitch");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    result && result.fitScore >= 80
      ? "badge-score-high"
      : result && result.fitScore >= 50
        ? "badge-score-mid"
        : "badge-score-low";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Generate Pitch</h1>
        <p className="text-muted-foreground mt-2">Create tailored retail pitches powered by AI</p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-light space-y-5">
          <h2 className="font-display text-xl font-semibold text-foreground">Product Selection</h2>

          {loadingProducts ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Add products in the <strong>Products</strong> page first, then come back to generate pitches.
            </p>
          ) : (
            <>
              <SelectField
                label="Product"
                value={productId}
                onChange={setProductId}
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Select a product"
              />
              <SelectField
                label="Target Retailer"
                value={retailer}
                onChange={setRetailer}
                options={RETAILERS.map((r) => ({ value: r, label: r }))}
                placeholder="Select retailer"
              />
              <SelectField
                label="Retailer Focus"
                value={focus}
                onChange={setFocus}
                options={FOCUSES.map((f) => ({ value: f, label: f }))}
                placeholder="Select focus area"
              />

              <Button
                onClick={handleGenerate}
                disabled={!productId || !retailer || !focus || loading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base font-semibold"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate Pitch
                  </span>
                )}
              </Button>
            </>
          )}
        </motion.div>

        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-navy space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Pitch Result</h2>
              <span className="badge-retailer">{result.retailer}</span>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Positioning</h3>
              <p className="text-sm leading-relaxed opacity-90">{result.positioning}</p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Talking Points</h3>
              <ul className="space-y-2">
                {result.talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm opacity-90">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Suggested Pitch</h3>
              <p className="text-sm leading-relaxed opacity-90 italic">&quot;{result.suggestedPitch}&quot;</p>
            </div>
          </motion.div>
        ) : (
          <div className="card-light flex items-center justify-center min-h-[300px] lg:min-h-0">
            <div className="text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select options and generate a pitch</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          <div className="card-light flex flex-col items-center justify-center py-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Fit Score</p>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold ${scoreColor}`}>
              {result.fitScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />{" "}
              {result.fitScore >= 80 ? "Strong fit" : result.fitScore >= 50 ? "Moderate fit" : "Challenges"}
            </p>
          </div>

          <div className="card-light space-y-3">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Issues
            </h3>
            <ul className="space-y-2">
              {result.issues.map((issue, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-light space-y-3">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-secondary" /> Suggestions
            </h3>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-background border border-input rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
