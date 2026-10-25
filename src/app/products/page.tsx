"use client";

import { useState, useEffect, useCallback } from "react";
import { productStore, supplierStore, type Product } from "@/lib/store";
import AddDialog from "@/components/add-dialog";

const BOM_KEY = "aluminum_product_bom";
// 成品的一条组件明细：子配件产品 + 自动生成的组件编号/名称（可编辑）
type BomItem = { productId: string; compCode: string; compName: string };
// 产品编号 -> 组件明细列表
type ProductBomMap = Record<string, BomItem[]>;

function loadProductBom(): ProductBomMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BOM_KEY);
    return raw ? (JSON.parse(raw) as ProductBomMap) : {};
  } catch { return {}; }
}

// 与采购单页一致的材质选项
const materialOptions = ["普通铝板", "5052", "6063", "1060", "3003"];

function createEmptyProduct(): Product {
  return { id: "", name: "", spec: "", weightPerMeter: 0, material: "6063-T5", defaultSupplier: "", productType: "profile" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "profile" | "plate">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Product>(createEmptyProduct());

  // BOM（组件）配置，作为新增/编辑弹窗的第三个 tab
  const [productBom, setProductBom] = useState<ProductBomMap>({});
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [bomPickerOpen, setBomPickerOpen] = useState(false);
  const [bomSearch, setBomSearch] = useState("");

  useEffect(() => { setProductBom(loadProductBom()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(BOM_KEY, JSON.stringify(productBom)); }, [productBom]);

  // 切换产品时同步该产品的组件
  useEffect(() => {
    setBomSearch("");
    setBomItems(formData.id ? (productBom[formData.id] || []) : []);
  }, [formData.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 自动生成下一个组件编号（按行序）与默认名称
  const addBomItem = (p: Product) => {
    const n = bomItems.length + 1;
    const code = "子件" + String(n).padStart(2, "0");
    setBomItems(prev => [...prev, { productId: p.id, compCode: code, compName: p.name || p.spec }]);
  };

  const updateBomItem = (idx: number, field: "compCode" | "compName", value: string) => {
    setBomItems(prev => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  const removeBomItem = (idx: number) => {
    setBomItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      // 重新按行序生成编号，保持一致
      return next.map((it, i) => ({ ...it, compCode: "子件" + String(i + 1).padStart(2, "0") }));
    });
  };

  const saveBom = () => {
    if (formData.id) {
      setProductBom(prev => ({ ...prev, [formData.id]: bomItems }));
    }
  };

  const loadProducts = useCallback(() => {
    setProducts(productStore.getAll());
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = products.filter(p =>
    (typeFilter === "all" || (p.productType || "profile") === typeFilter) &&
    (p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.spec.toLowerCase().includes(search.toLowerCase()))
  );

  const openAdd = () => {
    setFormData(createEmptyProduct());
    setIsAdding(true);
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setFormData({ ...product });
    setIsAdding(false);
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.id) {
      alert("请填写产品编号和名称");
      return;
    }
    if (isAdding) {
      productStore.add(formData);
    } else if (editingProduct) {
      productStore.update(editingProduct.id, formData);
    }
    setDialogOpen(false);
    setIsAdding(false);
    setEditingProduct(null);
    loadProducts();
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setIsAdding(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此产品吗？")) {
      productStore.remove(id);
      loadProducts();
    }
  };

  const form = (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">产品编号 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
            disabled={!isAdding}
            placeholder={isAdding ? "如 TY-6001" : ""}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">产品类型</label>
          <select
            value={formData.productType || "profile"}
            onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value as "profile" | "plate" }))}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="profile">型材</option>
            <option value="plate">板材</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">产品名称 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">规格尺寸</label>
          <input
            type="text"
            value={formData.spec}
            onChange={(e) => setFormData(prev => ({ ...prev, spec: e.target.value }))}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">米重(KG/m)</label>
          <input
            type="number"
            step="0.001"
            value={formData.weightPerMeter || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, weightPerMeter: Number(e.target.value) }))}
            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">材质</label>
          <input list="material-options" value={formData.material || ""} onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))} placeholder="选择或输入材质" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <datalist id="material-options">
            {materialOptions.map(m => <option key={m} value={m} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">默认供应商</label>
          <input list="supplier-options" value={formData.defaultSupplier || ""} onChange={(e) => setFormData(prev => ({ ...prev, defaultSupplier: e.target.value }))} placeholder="选择或输入供应商" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          <datalist id="supplier-options">
            {supplierStore.getAll().map(s => <option key={s.id} value={s.name} />)}
          </datalist>
        </div>
        {(formData.productType || "profile") === "plate" ? (
          <>
            <div>
              <label className="block text-xs text-slate-500 mb-1">剪板宽度(mm)</label>
              <input type="number" step="0.1" value={formData.plateWidth ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, plateWidth: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">厚度(mm)</label>
              <input type="number" step="0.1" value={formData.thickness ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, thickness: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">步距(mm)</label>
              <input type="number" step="0.1" value={formData.step ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, step: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">每张板数量</label>
              <input type="number" value={formData.piecesPerSheet ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, piecesPerSheet: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">重量(KG)</label>
              <input type="number" step="0.001" value={formData.weight ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">刀数</label>
              <input type="number" value={formData.bladeCount ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, bladeCount: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </>
        ) : null}
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
        <button onClick={closeDialog} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
      </div>
    </>
  );

  // 组件（BOM）tab 内容：像送货单明细一样逐行添加子配件产品
  const bomTabContent = (
    <div>
      <table className="w-full text-sm mb-3">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <th className="text-center px-3 py-2 w-12 font-medium">序号</th>
            <th className="text-left px-3 py-2 font-medium">组件编号</th>
            <th className="text-left px-3 py-2 font-medium">组件名称</th>
            <th className="text-left px-3 py-2 font-medium">对应产品</th>
            <th className="text-left px-3 py-2 font-medium">规格</th>
            <th className="text-center px-3 py-2 w-10 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((it, idx) => {
            const p = products.find(x => x.id === it.productId);
            return (
              <tr key={idx} className="border-b border-slate-100">
                <td className="text-center px-3 py-2 text-slate-400">{idx + 1}</td>
                <td className="px-1 py-1.5">
                  <input value={it.compCode} onChange={(e) => updateBomItem(idx, "compCode", e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 focus:border-blue-500 focus:outline-none" />
                </td>
                <td className="px-1 py-1.5">
                  <input value={it.compName} onChange={(e) => updateBomItem(idx, "compName", e.target.value)}
                    className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-slate-700 focus:border-blue-500 focus:outline-none" />
                </td>
                <td className="px-3 py-2 font-mono text-xs text-slate-600">{p ? p.id : it.productId}</td>
                <td className="px-3 py-2 text-slate-500">{p?.spec || "-"}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => removeBomItem(idx)} className="text-red-400 hover:text-red-600">✕</button>
                </td>
              </tr>
            );
          })}
          {bomItems.length === 0 && (
            <tr><td colSpan={6} className="text-center py-8 text-slate-400">尚未添加组件，点击下方「添加组件」从产品库选择子配件</td></tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setBomPickerOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 border border-slate-300">
          <span className="text-base leading-none">＋</span> 添加组件
        </button>
        <button onClick={saveBom} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存组件</button>
        <span className="text-xs text-slate-400">组件将随产品编号保存，用于订单制作关联库存与采购</span>
      </div>

      {/* 产品选择弹层：从产品库（含手工录入）挑选子配件 */}
      {bomPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setBomPickerOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm font-medium text-slate-800">选择子配件产品（自动生成组件编号/名称，可改）</span>
              <button onClick={() => setBomPickerOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-3 border-b border-slate-100">
              <input value={bomSearch} onChange={(e) => setBomSearch(e.target.value)}
                placeholder="搜索产品编号、名称、规格…"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="text-left px-3 py-1.5 font-medium">产品编号</th>
                    <th className="text-left px-3 py-1.5 font-medium">名称</th>
                    <th className="text-left px-3 py-1.5 font-medium">规格</th>
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => {
                    const q = bomSearch.toLowerCase();
                    return !bomItems.some(x => x.productId === p.id) && (!q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q));
                  }).map(p => (
                    <tr key={p.id} onClick={() => { addBomItem(p); }}
                      className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/40">
                      <td className="px-3 py-1.5 font-mono text-xs text-slate-600">{p.id}</td>
                      <td className="px-3 py-1.5">{p.name}</td>
                      <td className="px-3 py-1.5 text-slate-500">{p.spec}</td>
                    </tr>
                  ))}
                  {products.filter(p => {
                    const q = bomSearch.toLowerCase();
                    return !bomItems.some(x => x.productId === p.id) && (!q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.spec.toLowerCase().includes(q));
                  }).length === 0 && (
                    <tr><td colSpan={3} className="text-center py-8 text-slate-400">
                      {products.length === 0 ? "产品库暂无产品" : "没有可添加的子配件（当前均已加入或搜索无匹配）"}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">产品库管理</h1>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新增产品
        </button>
      </div>

      {/* 搜索 + 类型筛选 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索产品编号、名称、规格..."
          className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <div className="flex gap-2 mt-3">
          {([
            { key: "all", label: "全部" },
            { key: "profile", label: "型材" },
            { key: "plate", label: "板材" },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={"px-3 py-1 text-sm rounded-full border " + (typeFilter === t.key ? "bg-blue-600 text-white border-blue-600" : "text-slate-600 border-slate-200 hover:bg-slate-100")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">类型</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">产品编号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">产品名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">规格尺寸</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">米重/重量(KG)</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">材质</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">默认供应商</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">暂无产品数据</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2">
                    <span className={"px-2 py-0.5 text-xs rounded-full " + ((product.productType || "profile") === "plate" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>
                      {(product.productType || "profile") === "plate" ? "板材" : "型材"}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-blue-600">{product.id}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.spec}</td>
                  <td className="px-4 py-2 text-right font-mono">{(product.weightPerMeter ?? product.weight ?? 0) ? ((product.weightPerMeter ?? product.weight ?? 0)).toFixed(3) : "-"}</td>
                  <td className="px-4 py-2">{product.material}</td>
                  <td className="px-4 py-2">{product.defaultSupplier}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => openEdit(product)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {filtered.length} 条产品记录
      </div>

      {dialogOpen ? (
        <AddDialog
          title={isAdding ? "新增产品" : "编辑产品"}
          kind="product"
          onClose={closeDialog}
          onImported={loadProducts}
          extraTab={{ key: "bom", label: "组件", content: bomTabContent }}
        >
          {form}
        </AddDialog>
      ) : null}
    </div>
  );
}
