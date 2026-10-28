import { pgTable, uuid, jsonb, timestamp, index } from "drizzle-orm/pg-core";

/**
 * 数据服务端化 schema
 *
 * 设计说明：
 * - 所有业务表采用「通用 jsonb」结构：id + user_id + data(jsonb 存完整实体) + 时间戳。
 *   原因：14 个现有模块的实体结构差异大且含嵌套 items，逐字段建模成本高、易破坏现有功能；
 *   用 jsonb 完整保留原 localStorage 里的实体（含全部字段与嵌套 items），又满足按账号隔离。
 * - user_id: uuid 外键 auth.users，作为 RLS 行级隔离键。
 * - data: jsonb，值为原 store.ts 实体（含 id、嵌套 items、创建更新时间等）。
 */
function commonColumns() {
  return {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => authUsers.id),
    data: jsonb("data").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  };
}

/** Supabase 托管的 auth.users 表大纲（仅用于外键引用，不建表） */
export const authUsers = pgTable("auth.users", {
  id: uuid("id").primaryKey(),
});

// —— 12 个业务集合 ——
export const products = pgTable(
  "products",
  {
    ...commonColumns(),
  },
  (t) => [index("products_user_idx").on(t.user_id)],
);

export const suppliers = pgTable(
  "suppliers",
  {
    ...commonColumns(),
  },
  (t) => [index("suppliers_user_idx").on(t.user_id)],
);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    ...commonColumns(),
  },
  (t) => [index("purchase_orders_user_idx").on(t.user_id)],
);

export const outsourcingOrders = pgTable(
  "outsourcing_orders",
  {
    ...commonColumns(),
  },
  (t) => [index("outsourcing_orders_user_idx").on(t.user_id)],
);

export const deliveryCustomers = pgTable(
  "delivery_customers",
  {
    ...commonColumns(),
  },
  (t) => [index("delivery_customers_user_idx").on(t.user_id)],
);

export const deliveryCompanies = pgTable(
  "delivery_companies",
  {
    ...commonColumns(),
  },
  (t) => [index("delivery_companies_user_idx").on(t.user_id)],
);

export const deliveryProducts = pgTable(
  "delivery_products",
  {
    ...commonColumns(),
  },
  (t) => [index("delivery_products_user_idx").on(t.user_id)],
);

export const deliveryNotes = pgTable(
  "delivery_notes",
  {
    ...commonColumns(),
  },
  (t) => [index("delivery_notes_user_idx").on(t.user_id)],
);

export const components = pgTable(
  "components",
  {
    ...commonColumns(),
  },
  (t) => [index("components_user_idx").on(t.user_id)],
);

export const reconciliationOrders = pgTable(
  "reconciliation_orders",
  {
    ...commonColumns(),
  },
  (t) => [index("reconciliation_user_idx").on(t.user_id)],
);

export const salesOrders = pgTable(
  "sales_orders",
  {
    ...commonColumns(),
  },
  (t) => [index("sales_orders_user_idx").on(t.user_id)],
);

export const quotations = pgTable(
  "quotations",
  {
    ...commonColumns(),
  },
  (t) => [index("quotations_user_idx").on(t.user_id)],
);

// —— 客户往来 + 公司信息 ——
export const customerAccounts = pgTable(
  "customer_accounts",
  {
    ...commonColumns(),
  },
  (t) => [index("customer_accounts_user_idx").on(t.user_id)],
);

export const companies = pgTable(
  "companies",
  {
    ...commonColumns(),
  },
  (t) => [index("companies_user_idx").on(t.user_id)],
);

/** 全部业务表，供迁移 / RLS 生成 / 通用 CRUD 遍历 */
export const allTables = {
  products,
  suppliers,
  purchaseOrders,
  outsourcingOrders,
  deliveryCustomers,
  deliveryCompanies,
  deliveryProducts,
  deliveryNotes,
  components,
  reconciliationOrders,
  salesOrders,
  quotations,
  customerAccounts,
  companies,
};