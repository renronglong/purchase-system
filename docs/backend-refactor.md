# 数据服务端化 后端改造 — 交接文档

> 目标：把「零配件生产销售管理系统」从纯前端 localStorage 存储，改为服务端数据库 + 按账号隔离。
> 技术栈：Supabase Auth + Supabase Postgres + Drizzle ORM + Next.js Route Handlers + Postgres RLS。

## 一、当前进度（骨架已搭好，全部语法检查通过）

已完成（不依赖凭证的部分）：

| 模块 | 路径 | 说明 |
|---|---|---|
| 数据库 schema | `src/db/schema.ts` | 14 张通用 jsonb 表（id + user_id + data + 时间戳），user_id 外键 `auth.users`，带索引 |
| Drizzle 配置 | `drizzle.config.ts` | dialect=postgresql，读 `DATABASE_URL` |
| 服务端 Supabase 客户端 | `src/lib/supabase-server.ts` | service_role 客户端（绕过 RLS），`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` |
| 通用 CRUD 工厂 | `src/lib/api/crud.ts` | `makeCrud({table})` → GET/POST/PUT/DELETE；强制 user_id=auth.uid()，业务主键多重过滤 |
| 14 个 Route Handler | `src/app/api/<api>/route.ts` | 覆盖全部业务集合 |
| 前端 Supabase 客户端 | `src/lib/supabase-client.ts` | 浏览器端 Auth 客户端（anon key） |
| 前端 API 客户端 | `src/lib/api/client.ts` | 封装 GET/POST/PUT/DELETE，带 Bearer token |
| 认证改造 | `src/lib/auth-store.ts` + `auth-provider.tsx` + login/register 页 | 邮箱+密码 → Supabase Auth，token 同步 |
| 数据层桥接 | `src/lib/db-sync.ts` | 内存缓存 + 服务端拉取/回写，页面同步调用零改动 |
| RLS 策略 SQL | `scripts/rls.sql` + `scripts/schema.sql` | 建表 + 每表 RLS 隔离策略 |

Route 映射：`products / suppliers / purchase-orders / outsourcing-orders / delivery-customers / delivery-companies / delivery-products / delivery-notes / components / reconciliation-orders / sales-orders / quotations / customer-accounts / companies`（schema 中表名均为下划线复数）。

## 二、卡点：需要你提供 Supabase 项目凭证

Route Handler / Auth 真正跑起来需要以下环境变量（放到本地 `.env.local` 及 Vercel 后台）：

```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...   # 前端 Auth 用
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # 服务端 CRUD 用，仅服务端环境存在
DATABASE_URL=postgresql://...    # drizzle-kit 迁移用
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

你之前选择：**单独开新 Supabase 项目**（不动现有项目）、**不灌演示数据**、**尽量迁移现有 localStorage 数据**。

需要你在 supabase.com 后台新建项目后把上面这些 key 发我/填到 `.env.local`。

## 三、剩余步骤（拿到凭证后）

1. **运行迁移建表**：`pnpm dlx drizzle-kit generate && pnpm dlx drizzle-kit migrate`（或直接执行 schema 对应 SQL）。
2. **执行 RLS**：在 Supabase SQL Editor 运行 `scripts/rls.sql`。
3. **改造 Auth（登录/注册）**：
   - 前端 `src/lib/auth-store.ts`（当前是 localStorage mock）改为走 Supabase Auth。
   - 新增登录/注册 UI 对接 `supabase.auth.signUp/signInWithPassword / signOut / onAuthStateChange`。
   - 登录成功后把 `access_token` 写入 localStorage（key `sb-access-token`，与 `src/lib/api/client.ts` 对齐）。
4. **重写前端数据访问层**：`src/lib/store.ts` 各 store 的同步 `getAll/add/update/remove` 改为异步调用 `apiList/apiCreate/apiUpdate/apiDelete`；受影响页面由同步改 await（约 109 处调用点、16 个页面）。
5. **迁移存量 localStorage 数据**：写一个一次性迁移脚本，登录后读取旧 `u_<userId>_<key>` 前缀数据，POST 到对应 Route 落库。
6. **端到端验证**：换浏览器/换设备同一账号登录看到相同数据；账号 A 看不到账号 B 数据（RLS 生效）。

## 四、设计要点（防走偏）

- **user_id 一律取 token 的 auth.uid()，写入时强制覆盖**（`crud.ts` 中），绝不信任前端传的 user_id。
- **读取按 user_id 过滤**，配合 RLS 双保险实现按账号隔离。
- **实体主键业务 id 存在 `data->>id`**，行的物理主键是 `id`（uuid）；PUT/DELETE 用 `user_id + data->>id` 双键定位。
- **服务端走 service_role 绕过 RLS**，但强制账号校验；RLS 防止有人绕过 Route Handler 直连数据库。
- 采用通用 jsonb 而非逐字段建模，是为了**完整保留现有实体结构与嵌套 items**，避免破坏现有功能。

## 五、验证清单

- [ ] 单账号数据跨浏览器/设备可见
- [ ] 双账号隔离（B 看不到 A）
- [ ] 登录/注册/登出正常，token 刷新
- [ ] 12 模块增删改查全部回归
- [ ] 存量 localStorage 数据迁移到位