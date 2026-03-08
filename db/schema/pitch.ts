import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";
import { product } from "./product";

export type BuyerSimulation = {
  questions: string[];
  concerns: string[];
  suggestions: string[];
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
  fitScore: integer("fit_score").notNull(),
  issues: jsonb("issues").$type<string[]>().notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  /** Cached buyer simulation — null until the simulation is first run. */
  buyerSimulation: jsonb("buyer_simulation").$type<BuyerSimulation>(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const pitchRelations = relations(pitch, ({ one }) => ({
  user: one(user),
  product: one(product),
}));
