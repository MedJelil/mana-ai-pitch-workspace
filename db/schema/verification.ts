import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const verification = pgTable("verification", {
  id: uuid().primaryKey().defaultRandom(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", {
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", {
    mode: "date",
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
  })
    .defaultNow()
    .notNull(),
});
