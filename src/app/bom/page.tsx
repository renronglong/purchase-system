"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { deliveryProducts, type DeliveryProduct } from "@/lib/delivery-seed-data";
import { productStore } from "@/lib/store";

const KEYS = { BOM: "aluminum_bom_components" };

interface BomSub {
  id: string;
  qty: number;
  price: number;   // 单价（元），可改
  remark: string;  // 备注
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

  // 材质：从产品库按名称匹配（产品信息目录本身无材质字段）
  const materialMap = useMemo(() => {
    const m = new Map<string, string>();
    productStore.getAll().forEach(p => {
      if (p.material && !m.get(p.name)) m.set(p.name, p.material);
    });
    return m;
  }, []);

  useEffect(() => { setBom(loadBom()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(KEYS.BOM, JSON.stringify(bom)); }, [bom]);

  // 主产品候选（产品信息目录）
  const mainCandidates = useMemo(() => {
    const q = mainSearch.toLowerCase();
    return deliveryProducts.filter(p =>
      !q || p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q)
    );
  }, [mainSearch]);

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
      .map(s => ({ sub: deliveryProducts.find(p => p.id === s.id), ...s }))
      .filter(x => x.sub);
  }, [mainProduct, bom]);

  const totalPrice = useMemo(
    () => mainSubs.reduce((sum, x) => sum + (x.qty || 0) * (x.price || 0), 0),
    [mainSubs]
  );

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

  const patchSub = useCallback((subId: string, patch: Partial<Pick<BomSub, "qty" | "price" | "remark">>) => {
    if (!mainProduct) return;
    setBom(prev => ({
      ...prev,
      [mainProduct.id]: (prev[mainProduct.id] || []).map(s => s.id === subId ? { ...s, ...patch } : s),
    }));
  }, [mainProduct]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">BOM 表 · 产品子件组成</h1>
      <p className="text-sm text-slate-500 mb-6">先选主产品，再从产品信息逐个添加子配件，自动核算用料成本</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                  <th className="text-left px-3 py-2 font-medium text-slate-600">编号</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">名称</th>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">规格</th>
                </tr>
              </thead>
              <tbody>
                {mainCandidates.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedId === p.id ? "bg-blue-50/50" : ""}`}
                  >
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{p.code}</td>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2 text-slate-500">{p.spec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右：主产品信息 + 逐个添加子配件 */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3">
            <div className="text-sm font-semibold text-slate-800 mb-2">
              ② 添加子配件（主产品：{mainProduct ? `${mainProduct.code} · ${mainProduct.name} ${mainProduct.spec}` : "未选"})
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
          {mainProduct && (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <th className="text-left px-3 py-2 font-medium text-slate-600">编号</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">名称</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">规格</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">材质</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">单价</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {subCandidates.slice(0, 50).map(p => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-mono text-xs text-slate-500">{p.code}</td>
                      <td className="px-3 py-1.5">{p.name}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.spec}</td>
                      <td className="px-3 py-1.5 text-slate-500">{materialMap.get(p.name) || "-"}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.unitPrice ? `¥${p.unitPrice}` : "-"}</td>
                      <td className="px-3 py-1.5 text-center">
                        <button onClick={() => addSub(p)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">添加</button>
                      </td>
                    </tr>
                  ))}
                  {subCandidates.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-400">{mainProduct && (bom[mainProduct.id]||[]).length === deliveryProducts.length ? "所有产品已全部加入" : "无匹配子配件"}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* BOM 成本核算表（参考 Excel 格式） */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* 顶部产品基础信息行 */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/50">
          <div className="px-4 py-2 border-r border-slate-200">
            <span className="text-xs text-slate-500 mr-2">产品编号</span>
            <span className="text-sm font-semibold text-slate-800">{mainProduct?.code || "—"}</span>
          </div>
          <div className="px-4 py-2 border-r border-slate-200">
            <span className="text-xs text-slate-500 mr-2">产品名称</span>
            <span className="text-sm font-semibold text-slate-800">{mainProduct?.name || "—"}</span>
          </div>
          <div className="px-4 py-2 border-r border-slate-200">
            <span className="text-xs text-slate-500 mr-2">规格尺寸</span>
            <span className="text-sm font-semibold text-slate-800">{mainProduct?.spec || "—"}</span>
          </div>
          <div className="px-4 py-2">
            <span className="text-xs text-slate-500 mr-2">材质</span>
            <span className="text-sm font-semibold text-slate-800">{mainProduct ? (materialMap.get(mainProduct.name) || "—") : "—"}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="text-center px-3 py-2.5 w-12 font-medium">序号</th>
                <th className="text-left px-3 py-2.5 font-medium">产品编号</th>
                <th className="text-left px-3 py-2.5 font-medium">规格尺寸 mm</th>
                <th className="text-left px-3 py-2.5 font-medium">产品名称</th>
                <th className="text-center px-3 py-2.5 w-14 font-medium">单位</th>
                <th className="text-left px-3 py-2.5 font-medium">材质</th>
                <th className="text-right px-3 py-2.5 w-24 font-medium">单价（元）</th>
                <th className="text-left px-3 py-2.5 font-medium">表面处理</th>
                <th className="text-center px-3 py-2.5 w-20 font-medium">用量</th>
                <th className="text-right px-3 py-2.5 w-24 font-medium">总价格</th>
                <th className="text-left px-3 py-2.5 w-32 font-medium">备注</th>
                <th className="text-center px-3 py-2.5 w-10 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {mainSubs.map(({ sub, qty, price, remark }, idx) => sub ? (
                <tr key={sub.id} className={`border-b border-slate-100 ${idx % 2 ? "bg-slate-50/40" : ""}`}>
                  <td className="text-center px-3 py-2 text-slate-400">{idx + 1}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">{sub.code}</td>
                  <td className="px-3 py-2 text-slate-600">{sub.spec}</td>
                  <td className="px-3 py-2 font-medium text-slate-800">{sub.name}</td>
                  <td className="px-3 py-2 text-center text-slate-500">{sub.unit || "-"}</td>
                  <td className="px-3 py-2 text-slate-600">{materialMap.get(sub.name) || "-"}</td>
                  <td className="px-3 py-2 text-right">
                    <input type="number" min={0} step="0.01" value={price}
                      onChange={(e) => patchSub(sub.id, { price: Number(e.target.value) })}
                      className="w-20 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 text-right text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-500">{sub.surface || "-"}</td>
                  <td className="px-3 py-2 text-center">
                    <input type="number" min={0} step="any" value={qty}
                      onChange={(e) => patchSub(sub.id, { qty: Number(e.target.value) })}
                      className="w-16 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 text-center text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-slate-800">¥{((qty || 0) * (price || 0)).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <input type="text" value={remark}
                      onChange={(e) => patchSub(sub.id, { remark: e.target.value })}
                      placeholder="—"
                      className="w-full border border-transparent hover:border-slate-300 focus:border-blue-500 rounded px-1.5 py-0.5 text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => removeSub(sub.id)} className="text-red-400 hover:text-red-600">✕</button>
                  </td>
                </tr>
              ) : null)}
              {mainSubs.length === 0 && (
                <tr><td colSpan={12} className="text-center py-10 text-slate-400">
                  {mainProduct ? "尚未添加子配件，请在右上从产品信息中逐个点击「添加」" : "请先在左侧选择主产品"}
                </td></tr>
              )}
            </tbody>
            {mainSubs.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium text-slate-800">
                  <td className="px-3 py-2.5" colSpan={1}>总计</td>
                  <td className="px-3 py-2.5" colSpan={8}></td>
                  <td className="px-3 py-2.5 text-right">¥{totalPrice.toFixed(2)}</td>
                  <td className="px-3 py-2.5" colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {mainProduct && mainSubs.length > 0 && (
        <div className="mt-2 text-xs text-slate-400">共 {mainSubs.length} 个子配件 · 合计 ¥{totalPrice.toFixed(2)} · 已自动保存</div>
      )}
    </div>
  );
}