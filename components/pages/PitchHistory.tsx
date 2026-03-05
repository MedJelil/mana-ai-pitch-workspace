"use client";

import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

const pitches = [
  { id: 1, product: "Organic Açaí Bowl Mix", retailer: "Whole Foods", focus: "Organic", score: 87, date: "2026-03-04" },
  { id: 2, product: "Cold-Pressed Green Juice", retailer: "HEB", focus: "Premium", score: 72, date: "2026-03-03" },
  { id: 3, product: "Vegan Protein Bar", retailer: "Walmart", focus: "Value", score: 91, date: "2026-03-02" },
  { id: 4, product: "Coconut Water Blend", retailer: "Sam's Club", focus: "Value", score: 65, date: "2026-03-01" },
  { id: 5, product: "Superfood Smoothie Pack", retailer: "Whole Foods", focus: "Premium", score: 83, date: "2026-02-28" },
  { id: 6, product: "Hemp Seed Granola", retailer: "HEB", focus: "Organic", score: 78, date: "2026-02-27" },
];

function scoreClass(score: number) {
  if (score >= 80) return "badge-score-high";
  if (score >= 50) return "badge-score-mid";
  return "badge-score-low";
}

export default function PitchHistory() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Pitch History</h1>
        <p className="text-muted-foreground mt-2">Review past pitches and scores</p>
      </div>

      <div className="space-y-4">
        {pitches.map((pitch, i) => (
          <motion.div
            key={pitch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-light flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{pitch.product}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="badge-retailer">{pitch.retailer}</span>
                <span className="badge-retailer">{pitch.focus}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" /> {pitch.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <span className={scoreClass(pitch.score)}>
                <TrendingUp className="w-3 h-3 mr-1" /> {pitch.score}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
