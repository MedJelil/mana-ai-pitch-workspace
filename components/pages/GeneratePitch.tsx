"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronDown, CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = ["Organic Açaí Bowl Mix", "Cold-Pressed Green Juice", "Vegan Protein Bar", "Coconut Water Blend", "Superfood Smoothie Pack"];
const retailers = ["Whole Foods", "Walmart", "HEB", "Sam's Club"];
const focuses = ["Organic", "Premium", "Value"];

const samplePitch = {
  positioning: "Mana Foods' Organic Açaí Bowl Mix is the perfect addition to Whole Foods' premium health-conscious lineup. Sourced from sustainably harvested açaí berries in the Brazilian Amazon, our product delivers unmatched nutritional density with zero artificial additives — aligning perfectly with Whole Foods' commitment to clean, organic offerings.",
  talkingPoints: [
    "100% USDA Organic certified with transparent supply chain",
    "35% higher antioxidant content than leading competitors",
    "Shelf-stable format reduces shrink by 60% vs. frozen alternatives",
    "Strong velocity data: $42/linear foot/week in comparable natural retailers",
    "Supports Whole Foods' sustainability goals with carbon-neutral packaging",
  ],
  suggestedPitch: "We'd love to bring Mana's top-selling Açaí Bowl Mix to your stores. With proven velocity of $42/ft/week in natural channel and 100% organic certification, it's a perfect fit for your health-conscious shoppers. Our carbon-neutral packaging aligns with your sustainability commitments. Can we schedule a category review?",
  fitScore: 87,
  issues: ["Price point 15% above category average", "Limited brand awareness in Southwest region"],
  suggestions: [
    "Include introductory promo pricing for first 90 days",
    "Bundle with existing Mana products for cross-merchandising",
    "Leverage social media campaign targeting local Whole Foods shoppers",
  ],
};

export default function GeneratePitch() {
  const [product, setProduct] = useState("");
  const [retailer, setRetailer] = useState("");
  const [focus, setFocus] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1500);
  };

  const scoreColor = samplePitch.fitScore >= 80 ? "badge-score-high" : samplePitch.fitScore >= 50 ? "badge-score-mid" : "badge-score-low";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Generate Pitch</h1>
        <p className="text-muted-foreground mt-2">Create tailored retail pitches powered by AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-light space-y-5">
          <h2 className="font-display text-xl font-semibold text-foreground">Product Selection</h2>

          <SelectField label="Product" value={product} onChange={setProduct} options={products} placeholder="Select a product" />
          <SelectField label="Target Retailer" value={retailer} onChange={setRetailer} options={retailers} placeholder="Select retailer" />
          <SelectField label="Retailer Focus" value={focus} onChange={setFocus} options={focuses} placeholder="Select focus area" />

          <Button
            onClick={handleGenerate}
            disabled={!product || !retailer || !focus || loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base font-semibold"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                Generating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Pitch
              </span>
            )}
          </Button>
        </motion.div>

        {/* Result */}
        {showResult ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card-navy space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Pitch Result</h2>
              <span className="badge-retailer">{retailer}</span>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Positioning</h3>
              <p className="text-sm leading-relaxed opacity-90">{samplePitch.positioning}</p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Talking Points</h3>
              <ul className="space-y-2">
                {samplePitch.talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm opacity-90">
                    <CheckCircle2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Suggested Pitch</h3>
              <p className="text-sm leading-relaxed opacity-90 italic">&quot;{samplePitch.suggestedPitch}&quot;</p>
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

      {/* Evaluation */}
      {showResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid lg:grid-cols-3 gap-6">
          <div className="card-light flex flex-col items-center justify-center py-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Fit Score</p>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-bold ${scoreColor}`}>
              {samplePitch.fitScore}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Strong fit
            </p>
          </div>

          <div className="card-light space-y-3">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> Issues
            </h3>
            <ul className="space-y-2">
              {samplePitch.issues.map((issue, i) => (
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
              {samplePitch.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full mt-2 rounded-xl border-secondary text-secondary hover:bg-secondary/10">
              <Sparkles className="w-4 h-4 mr-2" /> Improve Pitch
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
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
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}
