import Link from "next/link";

export const metadata = {
  title: "功能介绍 - 零配件生产销售管理系统",
  description: "baojia.bond 零配件生产销售管理系统功能介绍：13 个业务模块、完整业务流转与通用能力说明。",
};

// 13 个功能模块
const MODULES: { name: string; path: string; ability: string; tag: string }[] = [
  { name: "采购单管理", path: "/", ability: "新建采购单、按供应商/产品/日期搜索、查看/编辑/打印/删除", tag: "采购单列表" },
  { name: "产品库", path: "/products", ability: "新增产品，按编号/名称/规格搜索；分类筛选", tag: "型材 / 板材 / 物料 / 组件" },
  { name: "供应商", path: "/suppliers", ability: "新增/编辑/删除供应商，按名称/联系人搜索", tag: "供应商档案" },
  { name: "库存管理", path: "/inventory", ability: "新建入库、新建出库、库存汇总、入库/出库记录", tag: "入出库台账" },
  { name: "委外加工", path: "/outsourcing", ability: "新建委外加工单、按供应商搜索、导出、打印", tag: "委外单据" },
  { name: "送货单管理", path: "/delivery", ability: "新建送货单、按客户/日期搜索、导出开票明细/发票模板", tag: "已对账 / 未对账 / 部分对账" },
  { name: "订单管理", path: "/orders", ability: "新建订单、按客户/日期搜索、批量操作", tag: "草稿 / 已确认 / 生产中 / 已发货 / 已完成 / 已取消" },
  { name: "报价单管理", path: "/quote", ability: "新建报价单、按客户/单号/供方搜索、打印", tag: "报价单据" },
  { name: "对账单管理", path: "/reconciliation", ability: "新建对账单、导出对账单、按客户搜索", tag: "草稿 / 已确认 / 已结清" },
  { name: "购销合同管理", path: "/contract", ability: "新建合同", tag: "合同档案" },
  { name: "客户管理", path: "/customers", ability: "新增客户、按名称/联系人搜索、编辑/删除", tag: "客户档案" },
  { name: "公司信息管理", path: "/companies", ability: "新增公司、按名称/联系人搜索、编辑/删除", tag: "公司档案" },
  { name: "汇总表", path: "/customer-account", ability: "月报/季报/年报/自定义；按客户或按产品汇总", tag: "统计报表" },
];

const FLOW: { step: string; title: string; desc: string }[] = [
  {
    step: "01",
    title: "基础档案",
    desc: "先建好「产品库」（型材 / 板材 / 物料 / 组件）、「供应商」「客户」「公司信息」等基础数据。",
  },
  {
    step: "02",
    title: "采购与生产",
    desc: "通过「采购单管理」下采购单，外协工序走「委外加工」，物料进出由「库存管理」的入库 / 出库与库存汇总把控。",
  },
  {
    step: "03",
    title: "销售闭环",
    desc: "对外报价用「报价单管理」，成交后转「订单管理」（带完整生命周期状态），签订「购销合同」，发货时生成「送货单」（含对账状态标记与开票明细导出）。",
  },
  {
    step: "04",
    title: "财务对账",
    desc: "周期末用「对账单管理」与客户核对（草稿 → 已确认 → 已结清），并通过「汇总表」按客户或产品生成月 / 季 / 年统计报表。",
  },
];

const HIGHLIGHTS: { title: string; desc: string }[] = [
  { title: "单据全生命周期", desc: "订单、对账单等均带状态机，便于跟踪进度。" },
  { title: "打印 / 导出一体化", desc: "几乎每个业务单据都提供「打印」链接（如 /print/purchase/...、/print/delivery/...），并支持导出 Excel / 发票模板。" },
  { title: "检索与筛选", desc: "各列表普遍支持关键词搜索 + 日期 + 状态下拉筛选，送货单、订单等还支持勾选批量操作。" },
  { title: "轻量上手", desc: "登录页「一键演示账号」即可完整体验，适合先做业务验证再决定是否注册使用。" },
];

function SectionTitle({ index, title, onDark = false }: { index: string; title: string; onDark?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={
          onDark
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-sky-700"
            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-xs font-bold text-white"
        }
      >
        {index}
      </span>
      <h2 className={onDark ? "text-lg font-bold text-white" : "text-lg font-bold text-slate-800"}>{title}</h2>
    </div>
  );
}

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-50 to-white">
      {/* 顶部 */}
      <header className="border-b border-sky-100 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
            baojia.bond 零配件生产销售管理系统
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              返回登录
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              进入系统
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20 pt-10">
        {/* 标题区 */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl">
            零配件生产销售管理系统 —— 功能介绍
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            面向零配件（金属加工类）企业的 生产 + 销售一体化管理系统，覆盖从「采购 → 委外加工 → 库存 → 销售报价 / 订单 / 合同 → 送货 → 对账」的完整链路。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-200">13 个业务模块</span>
            <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-200">Web 端 · 响应式布局</span>
            <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-200">单据全生命周期</span>
            <span className="rounded-full bg-white px-3 py-1 text-sky-700 ring-1 ring-sky-200">打印 / 导出</span>
          </div>
        </div>

        {/* 一、系统定位 */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <SectionTitle index="一" title="系统定位" />
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p>
              baojia.bond 是一套面向零配件（金属加工类）企业的 生产 + 销售一体化管理系统，网址{" "}
              <a href="https://www.baojia.bond/" className="text-blue-600 underline decoration-blue-200 hover:decoration-blue-500">
                https://www.baojia.bond/
              </a>
              。
            </p>
            <p>
              产品库默认按 <b className="text-slate-700">型材 / 板材 / 物料 / 组件</b> 四类组织，明显贴合铝型材、钣金等金属零配件加工企业的日常业务场景，覆盖从「采购 → 委外加工 → 库存 → 销售报价 / 订单 / 合同 → 送货 → 对账」的完整链路。
            </p>
            <p>
              系统为 Web 端单页应用（SPA），响应式布局，所有单据均支持在线 <b className="text-slate-700">打印 / 导出</b>，并带有状态流转管理。
            </p>
          </div>
        </section>

        {/* 二、演示账号登录方式 */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <SectionTitle index="二" title="演示账号登录方式" />
          <p className="mb-3 text-sm text-slate-600">登录页（首页）提供两种入口：</p>
          <ul className="space-y-2.5 text-sm leading-relaxed text-slate-600">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>
                <b className="text-slate-700">一键填入演示账号，体验完整功能</b>：点击后自动填入演示账号并可直接登录，无需记忆账号密码，是体验系统最快的方式。
              </span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
              <span>
                <b className="text-slate-700">密码登录 / 邮箱验证码登录</b>：分别支持账号密码、邮箱验证码两种认证方式；另有「忘记密码」「注册」入口。
              </span>
            </li>
          </ul>
          <div className="mt-4 rounded-lg bg-sky-50 px-4 py-3 text-xs leading-relaxed text-slate-600 ring-1 ring-sky-100">
            演示账号信息（系统自动填充）：邮箱 <b className="font-mono text-slate-800">longge2623@agent.qq.com</b>，用户名 <b className="font-mono text-slate-800">longge2623</b>。正式使用前建议自行注册独立账号。
          </div>
        </section>

        {/* 三、功能模块总览 */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <SectionTitle index="三" title="功能模块总览（13 个）" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-3 py-2 font-medium">模块</th>
                  <th className="px-3 py-2 font-medium">路径</th>
                  <th className="px-3 py-2 font-medium">核心能力</th>
                  <th className="px-3 py-2 font-medium">典型状态 / 分类</th>
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m.name} className="border-b border-slate-100 align-top last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5 font-medium text-slate-800">{m.name}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs text-blue-600">{m.path}</td>
                    <td className="px-3 py-2.5 text-slate-600">{m.ability}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{m.tag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 四、典型业务流转 */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <SectionTitle index="四" title="典型业务流转" />
          <p className="mb-4 text-sm text-slate-600">系统把一条零配件生意的主线拆成了可串联的模块：</p>
          <ol className="space-y-3">
            {FLOW.map((f) => (
              <li key={f.step} className="flex gap-3 rounded-lg bg-sky-50/60 p-3 ring-1 ring-sky-100">
                <span className="mt-0.5 font-mono text-xs font-bold text-sky-500">{f.step}</span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{f.title}</div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 五、通用能力与体验亮点 */}
        <section className="mb-10 rounded-xl bg-white p-6 shadow-sm ring-1 ring-sky-100">
          <SectionTitle index="五" title="通用能力与体验亮点" />
          <div className="grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="rounded-lg bg-slate-50/80 p-3.5 ring-1 ring-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">✓</span>
                  {h.title}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 六、小结 */}
        <section className="rounded-xl bg-sky-600 p-6 text-white shadow-sm">
          <SectionTitle index="六" title="小结" onDark />
          <p className="text-sm leading-relaxed text-sky-50">
            baojia.bond 是一套针对金属零配件（型材 / 钣金）加工贸易企业的轻量级 ERP 式管理系统，模块划分清晰、单据闭环完整、上手成本低，适合中小加工厂用它把采购、库存、销售、对账搬到线上统一管理。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/login"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              一键体验演示账号
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              注册独立账号
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        baojia.bond 零配件生产销售管理系统 · 功能介绍
      </footer>
    </div>
  );
}
