"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productsQueryKey, fetchProducts } from "@/lib/api/products";
import { createPitch, pitchesQueryKey, type PitchResult } from "@/lib/api/pitches";

const RETAILERS = ["Whole Foods", "Walmart", "HEB", "Sam's Club"];
const FOCUSES = ["Organic", "Premium", "Value"];

export type { PitchResult };

export default function GeneratePitch() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: loadingProducts, error: productsError } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const generateMutation = useMutation({
    mutationFn: createPitch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pitchesQueryKey });
    },
  });

  const [productId, setProductId] = useState("");
  const [retailer, setRetailer] = useState("");
  const [focus, setFocus] = useState("");

  const result = generateMutation.data ?? null;
  const error = productsError?.message ?? generateMutation.error?.message ?? null;
  const loading = generateMutation.isPending;

  const handleGenerate = () => {
    if (!productId || !retailer || !focus) return;
    generateMutation.mutate({ productId, retailer, focus });
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
            <div className="space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Add products in the <strong>Products</strong> page first, then come back to generate pitches.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product</label>
                <Select value={productId || undefined} onValueChange={(v) => setProductId(v ?? "")}>
                  <SelectTrigger className="w-full rounded-xl h-11">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Target Retailer</label>
                <Select value={retailer || undefined} onValueChange={(v) => setRetailer(v ?? "")}>
                  <SelectTrigger className="w-full rounded-xl h-11">
                    <SelectValue placeholder="Select retailer" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETAILERS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Retailer Focus</label>
                <Select value={focus || undefined} onValueChange={(v) => setFocus(v ?? "")}>
                  <SelectTrigger className="w-full rounded-xl h-11">
                    <SelectValue placeholder="Select focus area" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUSES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                {result.talkingPoints?.map((point, i) => (
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
              {result.issues?.map((issue, i) => (
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
              {result.suggestions?.map((s, i) => (
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
