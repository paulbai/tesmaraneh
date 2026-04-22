import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

/** Order lifecycle. `pending` is created the moment the checkout is submitted;
 *  everything after that requires either a Flot webhook (`paid` / `failed`)
 *  or an admin action. */
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
]);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull().unique(),
    status: orderStatusEnum("status").notNull().default("pending"),

    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerAddress: text("customer_address").notNull(),
    customerCity: text("customer_city").notNull(),

    // Stored as whole units — no fractional Leones, no fractional USD (product
    // prices are already integer USD). Kept in the currency seen by the shopper.
    totalSll: integer("total_sll").notNull(),
    totalUsd: integer("total_usd").notNull(),
    itemCount: integer("item_count").notNull(),

    // Set by the Flot webhook once payment succeeds.
    flotPaymentId: text("flot_payment_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    statusIdx: index("orders_status_idx").on(t.status),
    createdIdx: index("orders_created_idx").on(t.createdAt),
    phoneIdx: index("orders_phone_idx").on(t.customerPhone),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    productCategory: text("product_category").notNull(),
    productCollection: text("product_collection").notNull(),

    size: text("size"),
    color: text("color"),
    quantity: integer("quantity").notNull(),
    unitPriceSll: integer("unit_price_sll").notNull(),
    unitPriceUsd: integer("unit_price_usd").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

/** Append-only status audit log. One row per transition. */
export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status").notNull(),
    changedBy: text("changed_by"), // admin email | 'system' | 'flot-webhook'
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    orderIdx: index("order_status_history_order_idx").on(t.orderId),
  })
);

/** Admin allowlist. Magic-link auth (Auth.js) will check email against this
 *  table. Seed row is inserted by the first migration. */
export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  addedBy: text("added_by"),
  addedAt: timestamp("added_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
