# AGENTS.md - 铝型材采购管理系统

## 项目概览
铝型材采购管理 Web 系统，用于管理铝型材产品的采购订单、产品库、供应商和委外加工单。纯前端应用，数据存储在 localStorage。

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
│   ├── products/page.tsx       # 产品库管理
│   ├── suppliers/page.tsx      # 供应商管理
│   ├── outsourcing/page.tsx    # 委外加工单管理
│   └── print/purchase/[id]/page.tsx  # 采购单打印页
├── components/
│   ├── sidebar.tsx             # 侧边栏导航
│   ├── product-search-select.tsx  # 产品搜索下拉组件
│   └── ui/                     # shadcn/ui 组件
└── lib/
    ├── store.ts                # 数据持久化层（localStorage CRUD）
    ├── seed-data.ts            # 预置数据（98条产品 + 12家供应商）
    └── utils.ts                # 工具函数
```

## 核心模块
1. **采购单管理**：新建/编辑/查看/删除/打印采购单，支持按供应商/日期/产品搜索
2. **产品库管理**：98条预置产品数据，支持增删改查和搜索
3. **供应商管理**：12家预置供应商，支持增删改查
4. **委外加工单**：类似采购单结构，含工序和单价字段
5. **打印功能**：A4格式采购单打印，含公司抬头和签收栏

## 关键文件
- `src/lib/store.ts` - 数据模型定义和 localStorage CRUD 操作
- `src/lib/seed-data.ts` - 预置产品/供应商数据
- `src/components/product-search-select.tsx` - 产品搜索下拉组件（支持键盘导航）

## 开发命令
- `pnpm dev` - 启动开发服务
- `pnpm build` - 构建生产版本
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查
