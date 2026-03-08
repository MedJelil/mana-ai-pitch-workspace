"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  CircleAlert,
  HelpCircle,
  ShieldAlert,
  ChevronLeft,
  CheckCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPitch, regeneratePitch, pitchesQueryKey } from "@/lib/api/pitches";

export default function PitchResultPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const queryClient = useQueryClient();

  const { data: pitch, isLoading, error } = useQuery({
    queryKey: [...pitchesQueryKey, id],
    queryFn: () => fetchPitch(id!),
    enabled: !!id,
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regeneratePitch(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData([...pitchesQueryKey, id], updated);
    },
  });

  const isRegenerating = regenerateMutation.isPending;

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
        </div>

        {/* Pitch content card (card-navy) */}
        <div className="bg-card rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28 bg-card-foreground/10" />
            <Skeleton className="h-6 w-40 rounded-full bg-card-foreground/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-card-foreground/10" />
            <Skeleton className="h-4 w-full bg-card-foreground/10" />
            <Skeleton className="h-4 w-full bg-card-foreground/10" />
            <Skeleton className="h-4 w-3/4 bg-card-foreground/10" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-card-foreground/10" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded-full shrink-0 bg-card-foreground/10" />
                <Skeleton className={`h-4 bg-card-foreground/10 ${i % 2 === 0 ? "w-full" : "w-5/6"}`} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 bg-card-foreground/10" />
            <Skeleton className="h-4 w-full bg-card-foreground/10" />
            <Skeleton className="h-4 w-4/5 bg-card-foreground/10" />
          </div>
        </div>

        {/* Readiness checklist */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-44" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-light border-l-4 border-l-muted p-4 flex items-start gap-3">
                <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues + Suggestions */}
        <div className="grid md:grid-cols-2 gap-6">
          {["Issues", "Suggestions"].map((label) => (
            <div key={label} className="card-light space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-5 w-20" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" />
                  <Skeleton className={`h-4 ${i === 3 ? "w-3/4" : "w-full"}`} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Buyer Simulator */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
          <div className="grid md:grid-cols-3 gap-6">
            {["Buyer Questions", "Potential Concerns", "Suggestions"].map((label) => (
              <div key={label} className="card-light space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-28" />
                </div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" />
                    <Skeleton className={`h-4 ${i === 3 ? "w-4/5" : "w-full"}`} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !pitch) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error instanceof Error ? error.message : "Pitch not found"}
        </div>
        <Button variant="outline" asChild className="rounded-xl gap-2">
          <Link href="/">
            <ChevronLeft className="w-4 h-4" />
            Back to Generate Pitch
          </Link>
        </Button>
      </div>
    );
  }

  const simulationData = pitch.buyerSimulation ?? null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Pitch Result
          </h1>
          <p className="text-muted-foreground mt-2">
            {pitch.productName} → {pitch.retailer}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => regenerateMutation.mutate()}
            disabled={isRegenerating}
            variant="outline"
            className="rounded-xl gap-2"
          >
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </Button>
          <Button variant="outline" asChild className="rounded-xl gap-2">
            <Link href="/">
              <ChevronLeft className="w-4 h-4" />
              Generate another pitch
            </Link>
          </Button>
        </div>
      </div>

      {regenerateMutation.isError && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {regenerateMutation.error instanceof Error
            ? regenerateMutation.error.message
            : "Regeneration failed"}
        </div>
      )}

      {isRegenerating && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Regenerating pitch…</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI is crafting a new version with the latest product data
            </p>
          </div>
          <div className="ml-auto flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      )}

      <div className={`space-y-8 transition-opacity duration-500 ${isRegenerating ? "opacity-30 pointer-events-none" : ""}`}>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-navy space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Pitch Result</h2>
          <span className="badge-retailer">{pitch.retailer}</span>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
            Positioning
          </h3>
          <p className="text-sm leading-relaxed opacity-90">{pitch.positioning}</p>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
            Talking Points
          </h3>
          <ul className="space-y-2">
            {pitch.talkingPoints?.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm opacity-90">
                <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
            Suggested Pitch
          </h3>
          <p className="text-sm leading-relaxed opacity-90 italic">
            &quot;{pitch.suggestedPitch}&quot;
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
          <CheckCheck className="w-5 h-5 text-primary" /> Readiness Checklist
        </h2>
        {pitch.readiness && pitch.readiness.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pitch.readiness.map((item, i) => {
              const isOk = item.status === "ok";
              const isWarning = item.status === "warning";
              return (
                <div
                  key={i}
                  className={`card-light flex items-start gap-3 p-4 border-l-4 ${
                    isOk
                      ? "border-l-green-500"
                      : isWarning
                        ? "border-l-yellow-500"
                        : "border-l-destructive"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {isOk ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : isWarning ? (
                      <CircleAlert className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="card-light space-y-3">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> Issues
          </h3>
          <ul className="space-y-2">
            {pitch.issues?.map((issue, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
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
            {pitch.suggestions?.map((s, i) => (
              <li
                key={i}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Retail Buyer Simulator
        </h2>
        <p className="text-muted-foreground text-sm">
          How a {pitch.retailer} buyer might respond to this pitch
        </p>

        {simulationData ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-light space-y-3">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Buyer Questions
              </h3>
              <ul className="space-y-2">
                {simulationData.questions.map((q, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-light space-y-3">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" /> Potential Concerns
              </h3>
              <ul className="space-y-2">
                {simulationData.concerns.map((c, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-light space-y-3">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-secondary" /> Suggestions
              </h3>
              <ul className="space-y-2">
                {simulationData.suggestions.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </motion.div>
      </div>
    </div>
  );
}
