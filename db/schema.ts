import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Example table – add your own schema here
export const example = pgTable("example", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;
