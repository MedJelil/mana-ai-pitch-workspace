"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: loadingProducts, error: productsError } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const generateMutation = useMutation({
    mutationFn: createPitch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: pitchesQueryKey });
      router.push(`/pitch/${data.id}`);
    },
  });

  const [productId, setProductId] = useState("");
  const [retailer, setRetailer] = useState("");
  const [focus, setFocus] = useState("");

  const error = productsError?.message ?? generateMutation.error?.message ?? null;
  const loading = generateMutation.isPending;

  const handleGenerate = () => {
    if (!productId || !retailer || !focus) return;
    generateMutation.mutate({ productId, retailer, focus });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
          Generate Pitch
        </h1>
        <p className="text-muted-foreground mt-2">
          Create tailored retail pitches powered by AI
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid lg:grid-cols-2 gap-8"
      >
        <motion.div
          className={`card-light space-y-5 transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <h2 className="font-display text-xl font-semibold text-foreground">
            Product Selection
          </h2>

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
              Add products in the <strong>Products</strong> page first, then come
              back to generate pitches.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product</label>
                <Select
                  value={productId || undefined}
                  onValueChange={(v) => setProductId(v ?? "")}
                >
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
                <label className="text-sm font-medium text-foreground">
                  Target Retailer
                </label>
                <Select
                  value={retailer || undefined}
                  onValueChange={(v) => setRetailer(v ?? "")}
                >
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
                <label className="text-sm font-medium text-foreground">
                  Retailer Focus
                </label>
                <Select
                  value={focus || undefined}
                  onValueChange={(v) => setFocus(v ?? "")}
                >
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

        {loading ? (
          <motion.div
            key="shimmer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="card-light shimmer flex flex-col items-center justify-center min-h-[380px] rounded-2xl overflow-hidden"
          >
            <div className="relative z-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  Cooking your pitch…
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is tailoring this for {retailer}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-light flex items-center justify-center min-h-[380px] lg:min-h-0"
          >
            <div className="text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select options and generate a pitch</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
