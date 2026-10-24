"use client";

import { useMemo, useState, useEffect, useCallback, Fragment, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { deliveryNoteStore, purchaseOrderStore, type DeliveryNote, type PurchaseOrder } from "@/lib/store";

type TimeMode = "month" | "season" | "year" | "custom";
type ViewMode = "sales" | "purchase";

function seasonLabel(season: string): string {
  const [y, q] = season.split("-");
  return `${y}年 第${q}季度`;
}

export default function CustomerSummaryPage() {
  const [notes, setNotes] = useState<DeliveryNote[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);

  // 视角
  const [viewMode, setViewMode] = useState<ViewMode>("sales");

  // 时间维度
  const [timeMode, setTimeMode] = useState<TimeMode>("month");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [season, setSeason] = useState(() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-${q}`;
  });
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // 条件：主体（客户/供应商）/ 产品（多选）
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // 筛选区搜索框（客户/供应商、产品）
  const [entitySearch, setEntitySearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // 明细展开
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    setNotes(deliveryNoteStore.getAll());
    setOrders(purchaseOrderStore.getAll());
  }, []);
  useEffect(() => { load(); }, [load]);

  // 销售可选客户 / 采购可选供应商 / 产品（去重）
  const allCustomers = useMemo(() =>
    Array.from(new Set(notes.map(n => n.customer))).filter(Boolean).sort((a, b) => a.localeCompare(b)), [notes]);

  const allSuppliers = useMemo(() =>
    Array.from(new Set(orders.map(o => o.supplierName))).filter(Boolean).sort((a, b) => a.localeCompare(b)), [orders]);

  const allProducts = useMemo(() => {
    const set = new Set<string>();
    notes.forEach(n => n.items.forEach(it => set.add(`${it.productName}${it.spec ? " " + it.spec : ""}`)));
    orders.forEach(o => o.items.forEach(it => set.add(`${it.productName}${it.spec ? " " + it.spec : ""}`)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes, orders]);

  // 时间筛选
  const inRange = (date: string): boolean => {
    if (!date) return false;
    switch (timeMode) {
      case "month": return date.slice(0, 7) === month;
      case "season": {
        const m = parseInt(date.slice(5, 7), 10);
        const y = date.slice(0, 4);
        const [sy, sq] = season.split("-");
        if (y !== sy) return false;
        const q = Math.floor((m - 1) / 3) + 1;
        return String(q) === sq;
      }
      case "year": return date.slice(0, 4) === year;
      case "custom": return date >= startDate && date <= endDate;
      default: return false;
    }
  };

  // ---- 销售明细行（送货单）----
  const salesRows = useMemo(() => {
    const rows: { entity: string; productKey: string; productName: string; spec: string; unit: string; qty: number; amount: number }[] = [];
    notes.forEach(n => {
      if (!inRange(n.date)) return;
      if (selectedCustomers.length > 0 && !selectedCustomers.includes(n.customer)) return;
      n.items.forEach(it => {
        const pk = `${it.productName}${it.spec ? " " + it.spec : ""}`;
        if (selectedProducts.length > 0 && !selectedProducts.includes(pk)) return;
        rows.push({
          entity: n.customer,
          productKey: pk,
          productName: it.productName,
          spec: it.spec || "",
          unit: it.unit || "",
          qty: it.qty || 0,
          amount: typeof it.amount === "number" ? it.amount : (it.qty * it.unitPrice || 0),
        });
      });
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, timeMode, month, season, year, startDate, endDate, selectedCustomers, selectedProducts]);

  // ---- 采购明细行（采购单，按数量/重量汇总，无金额）----
  const purchaseRows = useMemo(() => {
    const rows: { entity: string; productKey: string; productName: string; spec: string; unit: string; qty: number; weight: number }[] = [];
    orders.forEach(o => {
      if (!inRange(o.orderDate)) return;
      if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(o.supplierName)) return;
      o.items.forEach(it => {
        const pk = `${it.productName}${it.spec ? " " + it.spec : ""}`;
        if (selectedProducts.length > 0 && !selectedProducts.includes(pk)) return;
        rows.push({
          entity: o.supplierName,
          productKey: pk,
          productName: it.productName,
          spec: it.spec || "",
          unit: it.unit || "",
          qty: it.quantity || 0,
          weight: it.totalWeight || 0,
        });
      });
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, timeMode, month, season, year, startDate, endDate, selectedSuppliers, selectedProducts]);

  // 汇总行的统一类型（销售有 amount，采购有 weight，均含 unit）
  type SummaryRow = { entity: string; productKey: string; productName: string; spec: string; unit: string; qty: number; amount: number; weight: number };
  const rows: SummaryRow[] = viewMode === "sales"
    ? salesRows.map(r => ({ ...r, weight: 0 }))
    : purchaseRows.map(r => ({ ...r, amount: 0 }));

  // 按主体（客户/供应商）聚合
  const entitySummary = useMemo(() => {
    const map = new Map<string, { entity: string; qty: number; amount: number; weight: number; productCount: number; rows: SummaryRow[] }>();
    rows.forEach(r => {
      if (!map.has(r.entity)) map.set(r.entity, { entity: r.entity, qty: 0, amount: 0, weight: 0, productCount: 0, rows: [] });
      const e = map.get(r.entity)!;
      e.qty += r.qty;
      if (viewMode === "sales") e.amount += r.amount || 0;
      else e.weight += r.weight || 0;
      if (!e.rows.find(x => x.productKey === r.productKey)) e.productCount++;
      e.rows.push(r);
    });
    const arr = Array.from(map.values());
    arr.sort((a, b) => (viewMode === "sales" ? b.amount - a.amount : b.weight - a.weight));
    return arr;
  }, [rows, viewMode]);

  const totalQty = entitySummary.reduce((s, x) => s + x.qty, 0);

  const toggleEntity = (e: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e); else next.add(e);
      return next;
    });
  };

  const toggleSelect = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) setList(list.filter(v => v !== value));
    else setList([...list, value]);
  };

  const selectedEntities = viewMode === "sales" ? selectedCustomers : selectedSuppliers;
  const setSelectedEntities: Dispatch<SetStateAction<string[]>> = viewMode === "sales" ? setSelectedCustomers : setSelectedSuppliers;
  const allEntities = viewMode === "sales" ? allCustomers : allSuppliers;
  const entityLabel = viewMode === "sales" ? "客户" : "供应商";

  const timeLabel = timeMode === "month" ? month : timeMode === "season" ? seasonLabel(season) : timeMode === "year" ? year : `${startDate} ~ ${endDate}`;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">客户往来记录 · 汇总表</h1>

      {/* 视角切换 */}
      <div className="flex gap-8 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={viewMode === "sales"} onChange={() => setViewMode("sales")} className="accent-blue-600" />
          <span className="text-sm font-medium text-slate-700">销售汇总（按客户）</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={viewMode === "purchase"} onChange={() => setViewMode("purchase")} className="accent-blue-600" />
          <span className="text-sm font-medium text-slate-700">采购汇总（按供应商）</span>
        </label>
      </div>

      {/* 时间维度 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1 bg-slate-100 rounded-md p-1">
            {([["month", "月报表"], ["season", "季报表"], ["year", "年报表"], ["custom", "自定义"]] as [TimeMode, string][]).map(([mode, label]) => (
              <button key={mode} onClick={() => setTimeMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${timeMode === mode ? "bg-white text-blue-600 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {timeMode === "month" && (
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          )}
          {timeMode === "season" && (
            <select value={season} onChange={(e) => setSeason(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md">
              {(() => { const opts: ReactNode[] = []; for (let y = new Date().getFullYear() - 2; y <= new Date().getFullYear() + 1; y++) for (let q = 1; q <= 4; q++) opts.push(<option key={`${y}-${q}`} value={`${y}-${q}`}>{`${y}年Q${q}`}</option>); return opts; })()}
            </select>
          )}
          {timeMode === "year" && (
            <select value={year} onChange={(e) => setYear(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md">
              {(() => { const opts: ReactNode[] = []; for (let y = new Date().getFullYear() - 3; y <= new Date().getFullYear() + 1; y++) opts.push(<option key={y} value={String(y)}>{y}年</option>); return opts; })()}
            </select>
          )}
          {timeMode === "custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <span className="text-slate-400">至</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
            </div>
          )}
        </div>

        {/* 主体 / 产品 多选条件（送货单式：搜索框 + 表格） */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-200 p-2">
              <input
                type="text"
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                placeholder={`搜索${entityLabel}`}
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              />
              <button
                onClick={() => { setEntitySearch(""); setSelectedEntities([]); }}
                className="text-xs text-blue-500 hover:underline whitespace-nowrap">清空</button>
            </div>
            <div className="max-h-44 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-center px-4 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={allEntities.length > 0 && allEntities.every(c => selectedEntities.includes(c))}
                        onChange={() => setSelectedEntities(allEntities.every(c => selectedEntities.includes(c)) ? [] : allEntities)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title={`全选/取消全选${entityLabel}`}
                      />
                    </th>
                    <th className="text-center px-2 py-2 w-10 font-medium text-slate-600">序号</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">{entityLabel}名称</th>
                  </tr>
                </thead>
                <tbody>
                  {allEntities.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-slate-400">暂无{entityLabel}</td></tr>
                  ) : allEntities.filter(c => !entitySearch || c.toLowerCase().includes(entitySearch.toLowerCase())).map((c, idx) => {
                    const isSel = selectedEntities.includes(c);
                    return (
                      <tr key={c} onClick={() => toggleSelect(selectedEntities, setSelectedEntities, c)}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer ${isSel ? "bg-blue-50/40" : ""}`}>
                        <td className="text-center px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelect(selectedEntities, setSelectedEntities, c)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-2 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 truncate">{c}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selectedEntities.length > 0 && (
              <div className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500">
                已选 {selectedEntities.length} 个，<button onClick={() => setSelectedEntities([])} className="text-blue-500 hover:underline">清空全部</button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-200 p-2">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="搜索产品名称/规格"
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              />
              <button
                onClick={() => { setProductSearch(""); setSelectedProducts([]); }}
                className="text-xs text-blue-500 hover:underline whitespace-nowrap">清空</button>
            </div>
            <div className="max-h-44 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-center px-4 py-2 w-10">
                      <input
                        type="checkbox"
                        checked={allProducts.length > 0 && allProducts.every(p => selectedProducts.includes(p))}
                        onChange={() => setSelectedProducts(allProducts.every(p => selectedProducts.includes(p)) ? [] : allProducts)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        title="全选/取消全选产品"
                      />
                    </th>
                    <th className="text-center px-2 py-2 w-10 font-medium text-slate-600">序号</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">产品名称 / 规格</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-slate-400">暂无产品</td></tr>
                  ) : allProducts.filter(p => !productSearch || p.toLowerCase().includes(productSearch.toLowerCase())).map((p, idx) => {
                    const isSel = selectedProducts.includes(p);
                    return (
                      <tr key={p} onClick={() => toggleSelect(selectedProducts, setSelectedProducts, p)}
                        className={`border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer ${isSel ? "bg-blue-50/40" : ""}`}>
                        <td className="text-center px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={isSel}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelect(selectedProducts, setSelectedProducts, p)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="text-center px-2 py-2.5 text-xs text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 truncate">{p}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {selectedProducts.length > 0 && (
              <div className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500">
                已选 {selectedProducts.length} 个，<button onClick={() => setSelectedProducts([])} className="text-blue-500 hover:underline">清空全部</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 汇总概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">统计区间</div>
          <div className="text-sm font-bold text-slate-800">{timeLabel}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">{entityLabel}数</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{entitySummary.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">总数量</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalQty.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">{viewMode === "sales" ? "总金额" : "总重量"}</div>
          <div className={`text-2xl font-bold font-mono ${viewMode === "sales" ? "text-emerald-600" : "text-slate-800"}`}>
            {viewMode === "sales" ? "¥" + (entitySummary.reduce((s, x) => s + x.amount, 0)).toFixed(2) : (entitySummary.reduce((s, x) => s + x.weight, 0)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* 汇总表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600 w-8"></th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">{entityLabel}</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">产品种类</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">数量</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">{viewMode === "sales" ? "金额" : "重量"}</th>
            </tr>
          </thead>
          <tbody>
            {entitySummary.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">该区间暂无{viewMode === "sales" ? "销售" : "采购"}汇总数据</td></tr>
            ) : entitySummary.map(s => {
              const isExpanded = expanded.has(s.entity);
              return (
                <Fragment key={s.entity}>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer" onClick={() => toggleEntity(s.entity)}>
                  <td className="px-4 py-2.5 text-slate-400">{isExpanded ? "▾" : "▸"}</td>
                  <td className="px-4 py-2.5 font-medium">{s.entity}</td>
                  <td className="px-4 py-2.5 text-center font-mono text-slate-500">{s.productCount}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{s.qty.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${viewMode === "sales" ? "text-emerald-600" : "text-slate-800"}`}>
                    {viewMode === "sales" ? "¥" + s.amount.toFixed(2) : s.weight.toFixed(2)}
                  </td>
                </tr>
                {isExpanded && (
                  s.rows.map((r, idx) => (
                    <tr key={`${s.entity}-${idx}-${r.productKey}`} className="bg-slate-50/50 border-b border-slate-100">
                      <td className="px-4 py-1.5"></td>
                      <td className="px-4 py-1.5 pl-10 text-slate-600">{r.productName}{r.spec ? ` ${r.spec}` : ""}</td>
                      <td className="px-4 py-1.5 text-center text-xs text-slate-400">{r.unit}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-xs text-slate-500">{r.qty.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right font-mono text-xs text-slate-600">
                        {viewMode === "sales" ? "¥" + ((r as any).amount || 0).toFixed(2) : ((r as any).weight || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        按{entityLabel}汇总 {entitySummary.length} 项 · 明细可展开 · {timeLabel}
      </div>
    </div>
  );
}