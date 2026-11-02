-- ============================================================
-- 把真实账号的业务数据复制到演示账号
--   源账号（真实数据）：longge2623@agent.qq.com
--   目标账号（演示用）：3074409285@qq.com
-- 在 Supabase SQL Editor 里按 1 → 2 → 3 的顺序执行
-- ============================================================


-- ------------------------------------------------------------
-- 第 1 步：先看清楚两边的账号和数据量（只读，不改任何东西）
--   逐表统计（一眼看出哪张表有数据、目标账号里已经有多少）
SELECT 'products' AS tbl, count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')) AS src_rows,
                          count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) AS dst_rows FROM public.products
UNION ALL SELECT 'suppliers',              count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.suppliers
UNION ALL SELECT 'companies',              count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.companies
UNION ALL SELECT 'purchase_orders',        count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.purchase_orders
UNION ALL SELECT 'outsourcing_orders',     count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.outsourcing_orders
UNION ALL SELECT 'delivery_customers',     count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_customers
UNION ALL SELECT 'delivery_companies',     count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_companies
UNION ALL SELECT 'delivery_products',      count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_products
UNION ALL SELECT 'delivery_notes',         count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_notes
UNION ALL SELECT 'components',             count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.components
UNION ALL SELECT 'sales_orders',           count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.sales_orders
UNION ALL SELECT 'quotations',             count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.quotations
UNION ALL SELECT 'reconciliation_orders',  count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.reconciliation_orders
UNION ALL SELECT 'customer_accounts',      count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.customer_accounts;


-- ------------------------------------------------------------
-- 第 2 步：复制（会先清空演示账号在这 14 张表里的现有数据！）
--   · 只复制 longge2623@agent.qq.com 的行，其它账号的数据不受影响
--   · 主键重新生成，不会和源账号冲突
--   · 业务 id 存在 data(jsonb) 里，原样保留，单据之间关联不会断
--   · 可重复执行，每次都是「清空目标 + 重新复制」
-- ------------------------------------------------------------
DO $$
DECLARE
  src_uid uuid;
  dst_uid uuid;
  t text;
  has_data boolean;
  n int;
  total int := 0;
  tables text[] := ARRAY[
    'products', 'suppliers', 'companies',
    'purchase_orders', 'outsourcing_orders',
    'delivery_customers', 'delivery_companies', 'delivery_products', 'delivery_notes',
    'components', 'sales_orders', 'quotations', 'reconciliation_orders', 'customer_accounts'
  ];
BEGIN
  SELECT id INTO src_uid FROM auth.users WHERE email = 'longge2623@agent.qq.com';
  SELECT id INTO dst_uid FROM auth.users WHERE email = '3074409285@qq.com';

  IF src_uid IS NULL THEN RAISE EXCEPTION '找不到源账号 longge2623@agent.qq.com'; END IF;
  IF dst_uid IS NULL THEN RAISE EXCEPTION '找不到目标账号 3074409285@qq.com'; END IF;
  IF src_uid = dst_uid THEN RAISE EXCEPTION '源账号和目标账号是同一个，已中止'; END IF;

  FOREACH t IN ARRAY tables LOOP
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'data'
    ) INTO has_data;

    -- 清空目标账号在該表的旧数据
    EXECUTE format('DELETE FROM public.%I WHERE user_id = $1', t) USING dst_uid;

    IF has_data THEN
      EXECUTE format(
        'INSERT INTO public.%I (id, user_id, data, created_at, updated_at)
         SELECT gen_random_uuid(), $1, data, created_at, updated_at
         FROM public.%I WHERE user_id = $2',
        t, t
      ) USING dst_uid, src_uid;
    ELSE
      EXECUTE format(
        'INSERT INTO public.%I (id, user_id, created_at, updated_at)
         SELECT gen_random_uuid(), $1, created_at, updated_at
         FROM public.%I WHERE user_id = $2',
        t, t
      ) USING dst_uid, src_uid;
    END IF;

    GET DIAGNOSTICS n = ROW_COUNT;
    total := total + n;
    RAISE NOTICE '% : 复制 % 行', t, n;
  END LOOP;

  RAISE NOTICE '===== 全部完成，共复制 % 行 =====', total;
END $$;


-- ------------------------------------------------------------
-- 第 3 步：核对结果（源和目标的每张表行数应该一致）
-- ------------------------------------------------------------
SELECT 'products' AS tbl, count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')) AS src, count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) AS dst FROM public.products
UNION ALL SELECT 'suppliers',             count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.suppliers
UNION ALL SELECT 'companies',             count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.companies
UNION ALL SELECT 'purchase_orders',       count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.purchase_orders
UNION ALL SELECT 'outsourcing_orders',    count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.outsourcing_orders
UNION ALL SELECT 'delivery_customers',    count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_customers
UNION ALL SELECT 'delivery_companies',    count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_companies
UNION ALL SELECT 'delivery_products',     count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_products
UNION ALL SELECT 'delivery_notes',        count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.delivery_notes
UNION ALL SELECT 'components',            count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.components
UNION ALL SELECT 'sales_orders',          count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.sales_orders
UNION ALL SELECT 'quotations',            count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.quotations
UNION ALL SELECT 'reconciliation_orders', count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.reconciliation_orders
UNION ALL SELECT 'customer_accounts',     count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='longge2623@agent.qq.com')), count(*) FILTER (WHERE user_id = (SELECT id FROM auth.users WHERE email='3074409285@qq.com')) FROM public.customer_accounts;
