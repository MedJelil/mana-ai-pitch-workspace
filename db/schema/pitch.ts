import { relations } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";
import { product } from "./product";

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
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const pitchRelations = relations(pitch, ({ one }) => ({
  user: one(user),
  product: one(product),
}));
