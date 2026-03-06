import { relations } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const product = pgTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  category: text().notNull(),
  description: text().notNull(),
  /** Key selling points for pitches (e.g. "100% USDA Organic", "35% higher antioxidants") */
  keySellingPoints: jsonb("key_selling_points")
    .$type<string[]>()
    .default([])
    .notNull(),
  /** Certifications (e.g. "USDA Organic", "Non-GMO") */
  certifications: jsonb("certifications")
    .$type<string[]>()
    .default([])
    .notNull(),
  /** Velocity or performance data (e.g. "$42/linear foot/week in natural channel") */
  velocityData: text("velocity_data"),
  /** Packaging / sustainability notes for retailer alignment */
  packagingSustainability: text("packaging_sustainability"),
  /** Price positioning (e.g. "Premium", "Mid-tier", "Value") */
  pricePositioning: text("price_positioning"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productRelations = relations(product, ({ one }) => ({
  user: one(user),
}));
