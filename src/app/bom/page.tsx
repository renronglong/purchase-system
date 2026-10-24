"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { deliveryProducts, type DeliveryProduct } from "@/lib/delivery-seed-data";

const KEYS = { BOM: "aluminum_bom_components" };

interface BomSub {
  id: string;
  qty: number;
  price: number;
  remark: string;
}

// 主产品 id -> 子配件列表
type BomMap = Record<string, BomSub[]>;

function loadBom(): BomMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEYS.BOM);
    return raw ? (JSON.parse(raw) as BomMap) : {};
  } catch {
    return {};
  }
}

export default function BomPage() {
  const [bom, setBom] = useState<BomMap>({});
  const [mainSearch, setMainSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 子配件添加面板
  const [subDialogOpen, setSubDialogOpen] = useState(false);
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => { setBom(loadBom()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(KEYS.BOM, JSON.stringify(bom)); }, [bom]);

  const mainCandidates = useMemo(() => {
    const q = mainSearch.toLowerCase();
    return deliveryProducts.filter(p =>
      !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q)
    );
  }, [mainSearch]);

  const mainProduct: DeliveryProduct | undefined = deliveryProducts.find(p => p.id === selectedId);

  const subCandidates = useMemo(() => {
    const q = subSearch.toLowerCase();
    const added = mainProduct ? (bom[mainProduct.id] || []).map(s => s.id) : [];
    return deliveryProducts.filter(p => {
      if (added.includes(p.id)) return false;
      return !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q);
    });
  }, [subSearch, mainProduct, bom]);

  const mainSubs = useMemo(() => {
    if (!mainProduct) return [];
    return (bom[mainProduct.id] || [])
      .map(s => ({ sub: deliveryProducts.find(p => p.id === s.id), ...s }))
      .filter(x => x.sub);
  }, [mainProduct, bom]);

  const addSub = useCallback((p: DeliveryProduct) => {
    if (!mainProduct) return;
    setBom(prev => {
      const list = prev[mainProduct.id] || [];
      if (list.some(s => s.id === p.id)) return prev;
      return { ...prev, [mainProduct.id]: [...list, { id: p.id, qty: 1, price: p.unitPrice || 0, remark: "" }] };
    });
  }, [mainProduct]);

  const removeSub = useCallback((subId: string) => {
    if (!mainProduct) return;
    setBom(prev => {
      const list = (prev[mainProduct.id] || []).filter(s => s.id !== subId);
      return { ...prev, [mainProduct.id]: list };
    });
  }, [mainProduct]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">BOM 表 · 产品子件明细</h1>
      <p className="text-sm text-slate-500 mb-6">选择主产品，从产品信息中逐个添加物料，维护产品子件清单</p>

      {/* 主产品选择 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">主产品：</span>
          {mainProduct ? (
            <span className="text-sm text-slate-700">
              <span className="font-mono text-xs text-slate-500">{mainProduct.code}</span>
              <span className="mx-2">·</span>{mainProduct.name}
              <span className="ml-2 text-xs text-slate-400">{mainProduct.spec}</span>
            </span>
          ) : (
            <span className="text-sm text-slate-400">请选择主产品</span>
          )}
          <input
            value={mainSearch}
            onChange={(e) => setMainSearch(e.target.value)}
            placeholder="搜索主产品（编号/名称/规格）…"
            className="ml-auto w-64 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="max-h-44 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2 font-medium text-slate-600">编号</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">名称</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">规格</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">表面处理</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">单位</th>
              </tr>
            </thead>
            <tbody>
              {mainCandidates.slice(0, 50).map(p => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedId === p.id ? "bg-blue-50/50" : ""}`}
                >
                  <td className="px-4 py-1.5 font-mono text-xs text-slate-500">{p.code}</td>
                  <td className="px-4 py-1.5">{p.name}</td>
                  <td className="px-4 py-1.5 text-slate-500">{p.spec}</td>
                  <td className="px-4 py-1.5 text-slate-500">{p.surface || "-"}</td>
                  <td className="px-4 py-1.5 text-slate-500">{p.unit || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 物料明细录入表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-800">物料明细</span>
          <button
            onClick={() => setSubDialogOpen(v => !v)}
            disabled={!mainProduct}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ＋ 新增物料
          </button>
        </div>

        {/* 新增物料面板：从产品信息中选 */}
        {subDialogOpen && mainProduct && (
          <div className="border-b border-slate-200 p-3 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-2">
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="搜索产品（编号/名称/规格）点击即可加入…"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button onClick={() => setSubDialogOpen(false)} className="text-sm text-slate-500 hover:underline">关闭</button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-1.5 font-medium text-slate-600">编号</th>
                    <th className="text-left px-3 py-1.5 font-medium text-slate-600">名称</th>
                    <th className="text-left px-3 py-1.5 font-medium text-slate-600">规格</th>
                    <th className="text-left px-3 py-1.5 font-medium text-slate-600">表面处理</th>
                    <th className="text-left px-3 py-1.5 font-medium text-slate-600">单位</th>
                  </tr>
                </thead>
                <tbody>
                  {subCandidates.slice(0, 50).map(p => (
                    <tr key={p.id} onClick={() => addSub(p)}
                      className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/40">
                      <td className="px-3 py-1.5 font-mono text-xs text-slate-500">{p.code}</td>
                      <td className="px-3 py-1.5">{p.name}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.spec}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.surface || "-"}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.unit || "-"}</td>
                    </tr>
                  ))}
                  {subCandidates.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-400">无匹配产品或已全部添加</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 物料明细表 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-center px-4 py-2.5 w-12 font-medium">序号</th>
                <th className="text-left px-4 py-2.5 font-medium">物料编号</th>
                <th className="text-left px-4 py-2.5 font-medium">产品名称</th>
                <th className="text-left px-4 py-2.5 font-medium">规格</th>
                <th className="text-left px-4 py-2.5 font-medium">表面处理</th>
                <th className="text-left px-4 py-2.5 font-medium">单位</th>
                <th className="text-left px-4 py-2.5 font-medium">材质</th>
                <th className="text-right px-4 py-2.5 w-24 font-medium">单价（元）</th>
                <th className="text-center px-4 py-2.5 w-20 font-medium">用量</th>
                <th className="text-right px-4 py-2.5 w-28 font-medium">总价格</th>
                <th className="text-left px-4 py-2.5 w-32 font-medium">备注</th>
                <th className="text-center px-4 py-2.5 w-10 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {mainSubs.map(({ sub, qty, price, remark }, idx) => sub ? (
                <tr key={sub.id} className={`border-b border-slate-100 ${idx % 2 ? "bg-slate-50/40" : ""}`}>
                  <td className="text-center px-4 py-2 text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-600">{sub.code}</td>
                  <td className="px-4 py-2 font-medium text-slate-800">{sub.name}</td>
                  <td className="px-4 py-2 text-slate-600">{sub.spec}</td>
                  <td className="px-4 py-2 text-slate-600">{sub.surface || "-"}</td>
                  <td className="px-4 py-2 text-slate-500">{sub.unit || "-"}</td>
                  <td className="px-4 py-2 text-slate-500">-</td>
                  <td className="px-4 py-2 text-right text-slate-700">¥{price.toFixed(2)}</td>
                  <td className="px-4 py-2 text-center">
                    <input type="number" min={0} step="any" value={qty}
                      onChange={(e) => !mainProduct ? null : setBom(prev => ({ ...prev, [mainProduct.id]: (prev[mainProduct.id]||[]).map(x => x.id===sub.id ? { ...x, qty: Number(e.target.value) } : x) }))}
                      className="w-16 border border-slate-200 rounded px-1.5 py-0.5 text-center text-sm focus:outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800">¥{((qty||0)*(price||0)).toFixed(2)}</td>
                  <td className="px-4 py-2">{remark || ""}</td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => removeSub(sub.id)} className="text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ) : null)}
              {mainSubs.length === 0 && (
                <tr><td colSpan={12} className="text-center py-10 text-slate-400">
                  {mainProduct ? "暂无物料，点击右上「＋ 新增物料」从产品信息中添加" : "请先选择主产品"}
                </td></tr>
              )}
            </tbody>
            {mainSubs.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium text-slate-800">
                  <td className="px-4 py-2.5">总计</td>
                  <td className="px-4 py-2.5" colSpan={8}></td>
                  <td className="px-4 py-2.5 text-right">¥{mainSubs.reduce((s,x)=>s+(x.qty||0)*(x.price||0),0).toFixed(2)}</td>
                  <td className="px-4 py-2.5" colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* 操作按钮区 */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-200">
          <button
            onClick={() => setSubDialogOpen(true)}
            disabled={!mainProduct}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40"
          >新增物料</button>
          <button
            onClick={() => { setSubDialogOpen(false); setSubSearch(""); }}
            className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
          >取消</button>
          <span className="ml-auto text-xs text-slate-400">
            {mainProduct && mainSubs.length > 0 ? `共 ${mainSubs.length} 项 · 已自动保存` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}