import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";
import { product } from "./product";

export type BuyerSimulation = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
};

export type ReadinessStatus = "ok" | "warning" | "missing";

export type ReadinessItem = {
  label: string;
  status: ReadinessStatus;
  note: string;
};

export const pitch = pgTable("pitch", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  retailer: text().notNull(),
  focus: text().notNull(),
  positioning: text().notNull(),
  talkingPoints: jsonb("talking_points").$type<string[]>().notNull(),
  suggestedPitch: text("suggested_pitch").notNull(),
  readiness: jsonb("readiness").$type<ReadinessItem[]>(),
  issues: jsonb("issues").$type<string[]>().notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  buyerSimulation: jsonb("buyer_simulation").$type<BuyerSimulation>(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const pitchRelations = relations(pitch, ({ one }) => ({
  user: one(user),
  product: one(product),
}));
