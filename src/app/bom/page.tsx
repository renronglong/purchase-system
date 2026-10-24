"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { deliveryProducts, type DeliveryProduct } from "@/lib/delivery-seed-data";

const KEYS = { BOM: "aluminum_bom_components" };

interface BomSub {
  id: string;
  qty: number;
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
  const [subSearch, setSubSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => { setBom(loadBom()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(KEYS.BOM, JSON.stringify(bom)); }, [bom]);

  // 主产品候选（产品信息目录）
  const mainCandidates = useMemo(() => {
    const q = mainSearch.toLowerCase();
    return deliveryProducts.filter(p =>
      !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q)
    );
  }, [mainSearch]);

  // 当前主产品
  const mainProduct: DeliveryProduct | undefined = deliveryProducts.find(p => p.id === selectedId);

  // 子配件候选（排除已加入当前 BOM 的）
  const subCandidates = useMemo(() => {
    const q = subSearch.toLowerCase();
    const added = mainProduct ? (bom[mainProduct.id] || []).map(s => s.id) : [];
    return deliveryProducts.filter(p => {
      if (added.includes(p.id)) return false;
      return !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q);
    });
  }, [subSearch, mainProduct, bom]);

  // 已加入子配件明细
  const mainSubs = useMemo(() => {
    if (!mainProduct) return [];
    return (bom[mainProduct.id] || [])
      .map(s => ({ sub: deliveryProducts.find(p => p.id === s.id), qty: s.qty }))
      .filter(x => x.sub);
  }, [mainProduct, bom]);

  const addSub = useCallback((p: DeliveryProduct) => {
    if (!mainProduct) return;
    setBom(prev => {
      const list = prev[mainProduct.id] || [];
      if (list.some(s => s.id === p.id)) return prev;
      return { ...prev, [mainProduct.id]: [...list, { id: p.id, qty: 1 }] };
    });
  }, [mainProduct]);

  const removeSub = useCallback((subId: string) => {
    if (!mainProduct) return;
    setBom(prev => {
      const list = (prev[mainProduct.id] || []).filter(s => s.id !== subId);
      return { ...prev, [mainProduct.id]: list };
    });
  }, [mainProduct]);

  const setQty = useCallback((subId: string, qty: number) => {
    if (!mainProduct) return;
    setBom(prev => ({
      ...prev,
      [mainProduct.id]: (prev[mainProduct.id] || []).map(s => s.id === subId ? { ...s, qty } : s),
    }));
  }, [mainProduct]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">BOM 表 · 产品子件组成</h1>
          <p className="text-sm text-slate-500 mt-1">先选主产品，再从产品信息里逐个添加子配件</p>
        </div>
        <span className="text-xs text-slate-400">共 {deliveryProducts.length} 个产品可作主产品/子配件</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 左：主产品选择 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-800 mb-2">① 选择主产品</div>
            <input
              value={mainSearch}
              onChange={(e) => setMainSearch(e.target.value)}
              placeholder="按编号 / 名称 / 规格搜索主产品…"
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <th className="text-left px-4 py-2 font-medium text-slate-600">编号</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">名称</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">规格</th>
                </tr>
              </thead>
              <tbody>
                {mainCandidates.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedId === p.id ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-slate-500">{p.code}</td>
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-slate-500">{p.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右：当前主产品的子配件管理 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              ② 主产品：{mainProduct ? `${mainProduct.code} · ${mainProduct.name} ${mainProduct.spec}` : "（请先在左侧选择主产品）"}
            </div>
            {mainProduct && (
              <input
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="按编号 / 名称 / 规格搜索子配件，点「添加」逐个加入…"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            )}
          </div>

          {/* 子配件候选：一个一个加 */}
          {mainProduct && (
            <div className="max-h-40 overflow-y-auto border-b border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <th className="text-left px-4 py-2 font-medium text-slate-600">编号</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">名称</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">规格</th>
                    <th className="text-left px-4 py-2 font-medium text-slate-600">单位</th>
                    <th className="text-center px-4 py-2 font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {subCandidates.slice(0, 50).map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-1.5 font-mono text-xs text-slate-500">{p.code}</td>
                      <td className="px-4 py-1.5">{p.name}</td>
                      <td className="px-4 py-1.5 text-slate-500">{p.spec}</td>
                      <td className="px-4 py-1.5 text-slate-500">{p.unit || "-"}</td>
                      <td className="px-4 py-1.5 text-center">
                        <button onClick={() => addSub(p)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">添加</button>
                      </td>
                    </tr>
                  ))}
                  {subCandidates.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-6 text-slate-400">{deliveryProducts.filter(p => (bom[mainProduct.id]||[]).some(s=>s.id===p.id)).length === deliveryProducts.length ? "所有产品已全部加入子配件" : "无匹配子配件"}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 已加入子配件表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-center px-4 py-2.5 w-12 font-medium text-slate-600">序号</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">子件编号</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">子件名称</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">规格</th>
                  <th className="text-left px-4 py-2.5 font-medium text-slate-600">表面处理</th>
                  <th className="text-center px-4 py-2.5 w-16 font-medium text-slate-600">单位</th>
                  <th className="text-center px-4 py-2.5 w-20 font-medium text-slate-600">用量</th>
                  <th className="text-center px-4 py-2.5 w-10 font-medium text-slate-600"></th>
                </tr>
              </thead>
              <tbody>
                {mainSubs.map(({ sub, qty }, idx) => sub ? (
                  <tr key={sub.id} className="border-b border-slate-100">
                    <td className="text-center px-4 py-2.5 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{sub.code}</td>
                    <td className="px-4 py-2.5">{sub.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{sub.spec}</td>
                    <td className="px-4 py-2.5 text-slate-500">{sub.surface || "-"}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500">{sub.unit || "-"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <input type="number" min={0} step="any" value={qty}
                        onChange={(e) => setQty(sub.id, Number(e.target.value))}
                        className="w-16 border border-slate-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => removeSub(sub.id)} className="text-red-400 hover:text-red-600">✕</button>
                    </td>
                  </tr>
                ) : null)}
                {mainSubs.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-slate-400">
                    {mainProduct ? "尚未添加子配件，请在上方从产品信息中点击「添加」" : "请先在左侧选择主产品"}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          {mainProduct && mainSubs.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 text-xs text-slate-500">
              共 {mainSubs.length} 个子配件 · 已自动保存
            </div>
          )}
        </div>
      </div>
    </div>
  );
}