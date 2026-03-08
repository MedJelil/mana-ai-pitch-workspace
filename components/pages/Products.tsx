"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Package,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  productsQueryKey,
  type Product,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/lib/api/products";

// The 5 optional fields the AI uses to improve pitches
const COMPLETENESS_FIELDS: { key: keyof Product; label: string }[] = [
  { key: "keySellingPoints", label: "Key selling points" },
  { key: "certifications", label: "Certifications" },
  { key: "velocityData", label: "Velocity data" },
  { key: "packagingSustainability", label: "Packaging / sustainability" },
  { key: "pricePositioning", label: "Price positioning" },
];

function completenessCount(p: Product): number {
  return COMPLETENESS_FIELDS.filter(({ key }) => {
    const v = p[key];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
}

const defaultForm = {
  name: "",
  category: "",
  description: "",
  keySellingPoints: "",
  certifications: "",
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

function productToForm(p: Product) {
  return {
    name: p.name,
    category: p.category,
    description: p.description,
    keySellingPoints: p.keySellingPoints.join(", "),
    certifications: p.certifications.join(", "),
    velocityData: p.velocityData ?? "",
    packagingSustainability: p.packagingSustainability ?? "",
    pricePositioning: p.pricePositioning ?? "",
  };
}

export type { Product };

export default function Products() {
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
  });

  const addMutation = useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setForm(defaultForm);
      setModalOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) =>
      updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setForm(defaultForm);
      setEditingProduct(null);
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setConfirmDeleteId(null);
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isEditing = !!editingProduct;
  const submitting = addMutation.isPending || editMutation.isPending;

  const openAdd = () => {
    setEditingProduct(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm(productToForm(p));
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditingProduct(null);
    setForm(defaultForm);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.category.trim()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      keySellingPoints: parseList(form.keySellingPoints),
      certifications: parseList(form.certifications),
      velocityData: form.velocityData.trim() || null,
      packagingSustainability: form.packagingSustainability.trim() || null,
      pricePositioning: form.pricePositioning.trim() || null,
    };
    if (isEditing && editingProduct) {
      editMutation.mutate({ id: editingProduct.id, input: payload });
    } else {
      addMutation.mutate(payload);
    }
  };

  const errorMessage =
    error?.message ??
    addMutation.error?.message ??
    editMutation.error?.message ??
    deleteMutation.error?.message ??
    null;

  const productToDelete = confirmDeleteId
    ? products.find((p) => p.id === confirmDeleteId)
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog for better pitches
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card-light p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card-light flex flex-col items-center justify-center py-16 text-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground mb-2">No products yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add products with details like certifications and velocity data so
            AI can generate stronger pitches.
          </p>
          <Button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Add your first product
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => {
            const filled = completenessCount(p);
            const total = COMPLETENESS_FIELDS.length;
            const isComplete = filled === total;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-light hover:shadow-md transition-shadow group flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {p.name}
                    </h3>
                    <span className="badge-retailer mt-1">{p.category}</span>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {p.description || (
                        <span className="italic opacity-60">
                          No description
                        </span>
                      )}
                    </p>
                    {p.certifications?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {p.certifications.slice(0, 2).join(", ")}
                        {p.certifications.length > 2 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Completeness bar */}
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      AI data completeness
                    </span>
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${
                        isComplete
                          ? "text-green-600"
                          : filled >= 3
                            ? "text-yellow-600"
                            : "text-destructive"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {filled}/{total}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {COMPLETENESS_FIELDS.map(({ key, label }) => {
                      const v = p[key];
                      const isFilled = Array.isArray(v) ? v.length > 0 : !!v;
                      return (
                        <div
                          key={key}
                          title={`${label}: ${isFilled ? "✓" : "missing"}`}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            isFilled ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                      );
                    })}
                  </div>
                  {filled < total && (
                    <p className="text-xs text-muted-foreground">
                      Missing:{" "}
                      {COMPLETENESS_FIELDS.filter(({ key }) => {
                        const v = p[key];
                        return Array.isArray(v) ? v.length === 0 : !v;
                      })
                        .map(({ label }) => label)
                        .join(", ")}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-1 items-end">
                  <div className="flex w-full items-center gap-2 pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-popover rounded-2xl p-6 w-full max-w-lg shadow-xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">
                  {isEditing ? "Edit Product" : "Add Product"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Name *
                  </label>
                  <input
                    placeholder="e.g. Organic Açaí Bowl Mix"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Category *
                  </label>
                  <input
                    placeholder="e.g. Bowls, Beverages, Snacks"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Description
                  </label>
                  <textarea
                    placeholder="Short product description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={2}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Key selling points
                  </label>
                  <textarea
                    placeholder="One per line or comma-separated"
                    value={form.keySellingPoints}
                    onChange={(e) =>
                      setForm({ ...form, keySellingPoints: e.target.value })
                    }
                    rows={2}
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    e.g. 100% USDA Organic, 35% higher antioxidants
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Certifications
                  </label>
                  <input
                    placeholder="e.g. USDA Organic, Non-GMO"
                    value={form.certifications}
                    onChange={(e) =>
                      setForm({ ...form, certifications: e.target.value })
                    }
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Velocity / performance data
                  </label>
                  <input
                    placeholder="e.g. $42/linear foot/week in natural channel"
                    value={form.velocityData}
                    onChange={(e) =>
                      setForm({ ...form, velocityData: e.target.value })
                    }
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Packaging / sustainability
                  </label>
                  <input
                    placeholder="e.g. Carbon-neutral packaging, recyclable"
                    value={form.packagingSustainability}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        packagingSustainability: e.target.value,
                      })
                    }
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Price positioning
                  </label>
                  <input
                    placeholder="e.g. Premium, Value, Mid-tier"
                    value={form.pricePositioning}
                    onChange={(e) =>
                      setForm({ ...form, pricePositioning: e.target.value })
                    }
                    className="w-full mt-1 bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {(addMutation.error || editMutation.error) && (
                <p className="text-sm text-destructive">
                  {addMutation.error?.message ?? editMutation.error?.message}
                </p>
              )}

              <Button
                onClick={handleSubmit}
                disabled={
                  !form.name.trim() || !form.category.trim() || submitting
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isEditing ? "Saving…" : "Adding…"}
                  </span>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Add Product"
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4"
            onClick={() =>
              !deleteMutation.isPending && setConfirmDeleteId(null)
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-popover rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Delete product?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>{productToDelete.name}</strong> and all its pitches
                    will be permanently deleted.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => deleteMutation.mutate(confirmDeleteId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
