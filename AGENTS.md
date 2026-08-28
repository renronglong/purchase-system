# AGENTS.md - 铝型材采购管理系统

## 项目概览
铝型材采购管理 Web 系统，用于管理铝型材产品的采购订单、产品库、供应商、委外加工单、送货单和对帐单。纯前端应用，数据存储在 localStorage。

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- localStorage 数据持久化（无后端）

## 目录结构
```
src/
├── app/
│   ├── layout.tsx              # 根布局（侧边栏导航）
│   ├── page.tsx                # 首页 - 采购单列表
│   ├── globals.css             # 全局样式
│   ├── purchase/[id]/
│   │   ├── page.tsx            # 采购单新建/编辑
│   │   └── detail/page.tsx     # 采购单详情
│   ├── products/page.tsx       # 采购产品库管理
│   ├── suppliers/page.tsx      # 供应商管理
│   ├── outsourcing/page.tsx    # 委外加工单管理
│   ├── delivery/page.tsx       # 送货单管理
│   ├── reconciliation/page.tsx # 对帐单管理
│   ├── customers/page.tsx      # 客户管理
│   └── print/
│       ├── purchase/[id]/page.tsx  # 采购单打印页
│       ├── delivery/[id]/page.tsx  # 送货单打印页
│       └── reconciliation/[id]/page.tsx  # 对帐单打印页
├── components/
│   ├── sidebar.tsx             # 侧边栏导航
│   ├── product-search-select.tsx  # 产品搜索下拉组件
│   └── ui/                     # shadcn/ui 组件
└── lib/
    ├── store.ts                # 数据持久化层（localStorage CRUD）
    ├── seed-data.ts            # 预置数据（346条采购产品 + 12家供应商）
    ├── delivery-seed-data.ts   # 送货模块预置数据（50客户 + 455产品 + 164送货单）
    └── utils.ts                # 工具函数
```

## 核心模块
1. **采购单管理**：新建/编辑/查看/删除/打印采购单，支持按供应商/日期/产品搜索
2. **采购产品库**：346条预置产品数据，支持增删改查和搜索
3. **供应商管理**：12家预置供应商，支持增删改查
4. **委外加工单**：类似采购单结构，含工序和单价字段
5. **送货单管理**：新建/编辑/删除/打印送货单，支持按客户/日期/对帐状态搜索
6. **对帐单管理**：按客户汇总送货单明细，支持拉取明细/手动添加/打印，含金额大写转换
7. **客户管理**：50家预置客户，支持增删改查
8. **打印功能**：A4格式采购单/送货单/对帐单打印，含公司抬头和签收栏

## 关键文件
- `src/lib/store.ts` - 数据模型定义和 localStorage CRUD 操作（含版本号机制），包含 reconciliationStore
- `src/lib/seed-data.ts` - 预置采购产品/供应商数据
- `src/lib/delivery-seed-data.ts` - 预置送货模块数据（客户/产品/送货单）
- `src/components/product-search-select.tsx` - 产品搜索下拉组件（支持键盘导航）

## 数据版本管理
- localStorage 使用版本号机制（STORAGE_VERSION），升级版本号可强制刷新所有用户缓存
- 当前版本：v8

## 开发命令
- `pnpm dev` - 启动开发服务
- `pnpm build` - 构建生产版本
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查
