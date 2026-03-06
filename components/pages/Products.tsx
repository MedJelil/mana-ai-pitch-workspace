"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  keySellingPoints: string[];
  certifications: string[];
  velocityData: string | null;
  packagingSustainability: string | null;
  pricePositioning: string | null;
  createdAt: string;
  updatedAt: string;
}

const defaultForm = {
  name: "",
  category: "",
  description: "",
  keySellingPoints: "" as string,
  certifications: "" as string,
  velocityData: "",
  packagingSustainability: "",
  pricePositioning: "",
};

function parseList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async () => {
    if (!form.name?.trim() || !form.category?.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim() || "",
          keySellingPoints: parseList(form.keySellingPoints),
          certifications: parseList(form.certifications),
          velocityData: form.velocityData.trim() || null,
          packagingSustainability: form.packagingSustainability.trim() || null,
          pricePositioning: form.pricePositioning.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add product");
      }
      const created = await res.json();
      setProducts((prev) => [created, ...prev]);
      setForm(defaultForm);
      setModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog for better pitches</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <div className="card-light flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No products yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add products with details like certifications and velocity data so AI can generate stronger pitches.</p>
          <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Add your first product
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-light hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                  <span className="badge-retailer mt-1">{p.category}</span>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                  {p.certifications?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.certifications.slice(0, 2).join(", ")}
                      {p.certifications.length > 2 ? "…" : ""}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => !submitting && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-popover rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Add Product</h2>
                <button
                  type="button"
                  onClick={() => !submitting && setModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="text-sm font-medium text-foreground">Name *</label>
                  <input
                    placeholder="e.g. Organic Açaí Bowl Mix"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category *</label>
                  <input
                    placeholder="e.g. Bowls, Beverages, Snacks"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    placeholder="Short product description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Key selling points</label>
                  <textarea
                    placeholder="One per line or comma-separated"
                    value={form.keySellingPoints}
                    onChange={(e) => setForm({ ...form, keySellingPoints: e.target.value })}
                    rows={2}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">e.g. 100% USDA Organic, 35% higher antioxidants</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Certifications</label>
                  <input
                    placeholder="e.g. USDA Organic, Non-GMO"
                    value={form.certifications}
                    onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Velocity / performance data</label>
                  <input
                    placeholder="e.g. $42/linear foot/week in natural channel"
                    value={form.velocityData}
                    onChange={(e) => setForm({ ...form, velocityData: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Packaging / sustainability</label>
                  <input
                    placeholder="e.g. Carbon-neutral packaging, recyclable"
                    value={form.packagingSustainability}
                    onChange={(e) => setForm({ ...form, packagingSustainability: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Price positioning</label>
                  <input
                    placeholder="e.g. Premium, Value, Mid-tier"
                    value={form.pricePositioning}
                    onChange={(e) => setForm({ ...form, pricePositioning: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button
                onClick={handleAdd}
                disabled={!form.name?.trim() || !form.category?.trim() || submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding…
                  </span>
                ) : (
                  "Add Product"
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
