-- ============================================================
-- 数据服务端化：RLS 行级安全策略
-- 在 drizzle migration 建表之后执行（或放入 migration 尾部）。
-- 每张业务表：启用 RLS + 按 auth.uid() = user_id 隔离。
-- 说明：服务端 Route Handler 使用 service_role 绕过 RLS；
--       直接对表查询时（如后台 SQL / 客户端 anon key）遵循此策略。
-- ============================================================

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['products','suppliers','purchase_orders','outsourcing_orders',
                          'delivery_customers','delivery_companies','delivery_products',
                          'delivery_notes','components','reconciliation_orders',
                          'sales_orders','quotations','customer_accounts','companies'];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "%1$s_own_row" ON %1$I;', tbl);
    EXECUTE format(
      'CREATE POLICY "%1$s_own_row" ON %1$I
         USING (auth.uid() = user_id)
         WITH CHECK (auth.uid() = user_id);',
      tbl
    );
  END LOOP;
END $$;
