"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
} from "lucide-react";

type PitchRecord = {
  id: string;
  productId: string;
  productName: string;
  retailer: string;
  focus: string;
  fitScore: number;
  createdAt: string;
  positioning?: string;
  talkingPoints?: string[];
  suggestedPitch?: string;
  issues?: string[];
  suggestions?: string[];
};

function scoreClass(score: number) {
  if (score >= 80) return "badge-score-high";
  if (score >= 50) return "badge-score-mid";
  return "badge-score-low";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function PitchHistory() {
  const [pitches, setPitches] = useState<PitchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pitches");
        if (!res.ok) throw new Error("Failed to load pitches");
        const data = await res.json();
        if (!cancelled) setPitches(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Pitch History
          </h1>
          <p className="text-muted-foreground mt-2">
            Review past pitches and scores
          </p>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
          Pitch History
        </h1>
        <p className="text-muted-foreground mt-2">
          Review past pitches and scores
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {pitches.length === 0 ? (
        <div className="card-light flex flex-col items-center justify-center py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No pitches yet</p>
          <p className="text-sm text-muted-foreground">
            Generate a pitch from the home page and it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pitches.map((pitch, i) => (
            <motion.div
              key={pitch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-light overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === pitch.id ? null : pitch.id)
                }
                className="w-full flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-muted/30 transition-colors text-left p-4 sm:p-0 sm:px-6 sm:py-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">
                    {pitch.productName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="badge-retailer">{pitch.retailer}</span>
                    <span className="badge-retailer">{pitch.focus}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />{" "}
                      {formatDate(pitch.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <span className={scoreClass(pitch.fitScore)}>
                    <TrendingUp className="w-3 h-3 mr-1" /> {pitch.fitScore}
                  </span>
                  {expandedId === pitch.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === pitch.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 sm:px-6 sm:pb-6 space-y-4 text-sm">
                      {pitch.positioning && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Positioning
                          </h4>
                          <p className="text-muted-foreground">
                            {pitch.positioning}
                          </p>
                        </div>
                      )}
                      {pitch.talkingPoints &&
                        pitch.talkingPoints.length > 0 && (
                          <div>
                            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                              Talking points
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {pitch.talkingPoints.map((pt, j) => (
                                <li key={j}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      {pitch.suggestedPitch && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Suggested pitch
                          </h4>
                          <p className="text-muted-foreground italic">
                            &quot;{pitch.suggestedPitch}&quot;
                          </p>
                        </div>
                      )}
                      {pitch.issues && pitch.issues.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Issues
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {pitch.issues.map((iss, j) => (
                              <li key={j}>{iss}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pitch.suggestions && pitch.suggestions.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                            Suggestions
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {pitch.suggestions.map((s, j) => (
                              <li key={j}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
