"use client";

import { useState, useEffect, useCallback } from "react";
import { productStore, supplierStore, type Product } from "@/lib/store";
import AddDialog from "@/components/add-dialog";

const BOM_KEY = "aluminum_product_bom";
// 成品的一条组件明细：完全照送货单明细表结构
type BomItem = {
  id: string;          // 行唯一 id
  materialCode: string; // 物料编号（关联产品库）
  productName: string;  // 产品名称
  spec: string;         // 规格
  surface: string;      // 表面处理
  unit: string;         // 单位
  qty: number;          // 数量
  unitPrice: number;    // 单价
  amount: number;       // 金额
  remark: string;       // 备注
};
// 产品编号 -> 组件明细列表
type ProductBomMap = Record<string, BomItem[]>;

function loadProductBom(): ProductBomMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BOM_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // 只保留符合「BomItem 对象数组」格式的数据；旧数据（如 string[]）一律清零
    const clean: ProductBomMap = {};
    for (const key of Object.keys(parsed)) {
      const v = parsed[key];
      if (Array.isArray(v) && v.every(x => x && typeof x === "object" && typeof (x as BomItem).materialCode === "string")) {
        clean[key] = v as BomItem[];
      }
    }
    return clean;
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

  // BOM（组件）配置，作为新增/编辑弹窗的第三个 tab：完全照送货单明细表
  const [productBom, setProductBom] = useState<ProductBomMap>({});
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [hideBomPrices, setHideBomPrices] = useState(false);

  const genBomItemId = () => Math.random().toString(36).slice(2, 10);
  const emptyBomItem = (): BomItem => ({ id: genBomItemId(), materialCode: "", productName: "", spec: "", surface: "", unit: "", qty: 0, unitPrice: 0, amount: 0, remark: "" });

  useEffect(() => { setProductBom(loadProductBom()); }, []);
  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem(BOM_KEY, JSON.stringify(productBom)); }, [productBom]);

  // 切换产品时同步该产品的组件
  useEffect(() => {
    setBomItems(formData.id ? (productBom[formData.id] || []) : [emptyBomItem()]);
  }, [formData.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 更新某一行的字段；输入物料编号时自动从产品库带出名称/规格
  const updateBomItem = (idx: number, field: keyof BomItem, value: string | number) => {
    setBomItems(prev => {
      const next = prev.map(it => ({ ...it }));
      const item = next[idx];
      (item as Record<string, unknown>)[field] = value;
      if (field === "materialCode") {
        const prod = products.find(p => p.id === value);
        if (prod) { item.materialCode = prod.id; item.productName = prod.name; item.spec = prod.spec; }
      } else if (field === "productName") {
        const prod = products.find(p => p.name === value);
        if (prod) { item.materialCode = prod.id; item.spec = prod.spec; }
      } else if (field === "spec") {
        const prod = products.find(p => p.spec === value);
        if (prod) { item.productName = prod.name; }
      }
      if (field === "qty" || field === "unitPrice") {
        item.amount = Math.round(item.qty * item.unitPrice * 100) / 100;
      }
      return next;
    });
  };

  const addBomItem = () => setBomItems(prev => [...prev, emptyBomItem()]);
  const removeBomItem = (idx: number) => { if (bomItems.length <= 1) return; setBomItems(prev => prev.filter((_, i) => i !== idx)); };

  const bomTotalAmount = bomItems.reduce((s, i) => s + i.amount, 0);

  const saveBom = () => {
    if (formData.id) {
      const valid = bomItems.filter(i => i.materialCode || i.productName);
      setProductBom(prev => ({ ...prev, [formData.id]: valid }));
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

  // 组件（BOM）tab 内容：完全照送货单明细表
  const bomTabContent = (
    <div className="overflow-x-auto">
      <table className="w-full text-xs min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-2 py-2 font-medium text-slate-600 w-8">序号</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-32">物料编号</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-28">产品名称</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-28">规格</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-20">表面处理</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-12">单位</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-16">数量</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-16">单价</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-20">金额</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-24">备注</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-8">操作</th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
              <td className="px-2 py-1"><input type="text" value={item.materialCode} onChange={(e) => updateBomItem(idx, "materialCode", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" placeholder="物料编号" list="bom-product-list" /></td>
              <td className="px-2 py-1"><input type="text" value={item.productName} onChange={(e) => updateBomItem(idx, "productName", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-product-name-list" /></td>
              <td className="px-2 py-1"><input type="text" value={item.spec} onChange={(e) => updateBomItem(idx, "spec", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-product-spec-list" /></td>
              <td className="px-2 py-1"><input type="text" value={item.surface} onChange={(e) => updateBomItem(idx, "surface", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
              <td className="px-2 py-1"><input type="text" value={item.unit} onChange={(e) => updateBomItem(idx, "unit", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
              <td className="px-2 py-1"><input type="number" value={item.qty || ""} onChange={(e) => updateBomItem(idx, "qty", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
              <td className="px-2 py-1">{hideBomPrices ? <span className="text-slate-400">***</span> : <input type="number" step="0.01" value={item.unitPrice || ""} onChange={(e) => updateBomItem(idx, "unitPrice", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" />}</td>
              <td className="px-2 py-1 text-right font-mono font-medium">{hideBomPrices ? "***" : item.amount.toFixed(2)}</td>
              <td className="px-2 py-1"><input type="text" value={item.remark} onChange={(e) => updateBomItem(idx, "remark", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
              <td className="px-2 py-1 text-center">
                <button onClick={() => removeBomItem(idx)} className="text-red-400 hover:text-red-600">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t border-slate-200">
            <td colSpan={8} className="px-2 py-2 text-right font-medium text-slate-600">合计金额</td>
            <td className="px-2 py-2 text-right font-mono font-bold text-blue-600">{hideBomPrices ? "***" : bomTotalAmount.toFixed(2)}</td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>

      {/* 产品库 datalist 提示 */}
      <datalist id="bom-product-list">
        {products.map(p => <option key={p.id} value={p.id} label={`${p.name || ""} ${p.spec || ""}`.trim()} />)}
      </datalist>
      <datalist id="bom-product-name-list">
        {Array.from(new Set(products.map(p => p.name).filter(Boolean))).map(n => <option key={n} value={n} />)}
      </datalist>
      <datalist id="bom-product-spec-list">
        {Array.from(new Set(products.map(p => p.spec).filter(Boolean))).map(s => <option key={s} value={s} />)}
      </datalist>

      <div className="flex gap-2 mt-4">
        <button onClick={addBomItem} className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">+ 添加行</button>
        <button onClick={() => setHideBomPrices(!hideBomPrices)} className={`px-3 py-1.5 text-xs rounded-md border ${hideBomPrices ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
          {hideBomPrices ? "显示价格" : "隐藏价格"}
        </button>
        <button onClick={saveBom} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
      </div>
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
