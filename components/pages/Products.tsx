"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
}

const initialProducts: Product[] = [
  { id: 1, name: "Organic Açaí Bowl Mix", category: "Bowls", description: "Sustainably harvested açaí blend with banana and berries" },
  { id: 2, name: "Cold-Pressed Green Juice", category: "Beverages", description: "Kale, spinach, cucumber, celery, and lemon" },
  { id: 3, name: "Vegan Protein Bar", category: "Snacks", description: "Plant-based protein with dark chocolate and almonds" },
  { id: 4, name: "Coconut Water Blend", category: "Beverages", description: "Pure coconut water with pineapple and mango" },
  { id: 5, name: "Superfood Smoothie Pack", category: "Smoothies", description: "Pre-portioned smoothie packs with adaptogens" },
  { id: 6, name: "Hemp Seed Granola", category: "Snacks", description: "Crunchy granola with hemp seeds and honey" },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "" });

  const handleAdd = () => {
    if (!form.name || !form.category) return;
    setProducts([...products, { id: Date.now(), ...form }]);
    setForm({ name: "", category: "", description: "" });
    setModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-2">Manage your product catalog</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

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
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-popover rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Add Product</h2>
                <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Button onClick={handleAdd} disabled={!form.name || !form.category} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5">
                Add Product
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
