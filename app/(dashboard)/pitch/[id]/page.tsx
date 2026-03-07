"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  HelpCircle,
  ShieldAlert,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPitch, pitchesQueryKey } from "@/lib/api/pitches";
import { simulateBuyer } from "@/lib/api/simulate-buyer";

export default function PitchResultPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: pitch, isLoading, error } = useQuery({
    queryKey: [...pitchesQueryKey, id],
    queryFn: () => fetchPitch(id!),
    enabled: !!id,
  });

  const simulateMutation = useMutation({ mutationFn: simulateBuyer });

  useEffect(() => {
    if (
      !pitch?.productId ||
      !pitch?.retailer ||
      !pitch?.positioning ||
      !pitch?.suggestedPitch
    )
      return;
    simulateMutation.reset();
    simulateMutation.mutate({
      productId: pitch.productId,
      retailer: pitch.retailer,
      pitch: {
        positioning: pitch.positioning,
        talkingPoints: pitch.talkingPoints ?? [],
        suggestedPitch: pitch.suggestedPitch,
      },
    });
  }, [pitch?.id]);

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="card-light space-y-4 p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
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

  const scoreColor =
    pitch.fitScore >= 80
      ? "badge-score-high"
      : pitch.fitScore >= 50
        ? "badge-score-mid"
        : "badge-score-low";

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
        <Button variant="outline" asChild className="rounded-xl gap-2">
          <Link href="/">
            <ChevronLeft className="w-4 h-4" />
            Generate another pitch
          </Link>
        </Button>
      </div>

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
        className="grid md:grid-cols-3 gap-6"
      >
        <div className="card-light flex flex-col items-center justify-center py-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Fit Score
          </p>
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold ${scoreColor}`}
          >
            {pitch.fitScore}
          </div>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />{" "}
            {pitch.fitScore >= 80
              ? "Strong fit"
              : pitch.fitScore >= 50
                ? "Moderate fit"
                : "Challenges"}
          </p>
        </div>
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

        {simulateMutation.isPending ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-light space-y-3 p-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[75%]" />
              </div>
            ))}
          </div>
        ) : simulateMutation.isError ? (
          <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
            {simulateMutation.error instanceof Error
              ? simulateMutation.error.message
              : "Failed to run simulation"}
          </div>
        ) : simulateMutation.data ? (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-light space-y-3">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" /> Buyer Questions
              </h3>
              <ul className="space-y-2">
                {simulateMutation.data.questions.map((q, i) => (
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
                {simulateMutation.data.concerns.map((c, i) => (
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
                {simulateMutation.data.suggestions.map((s, i) => (
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
  );
}
