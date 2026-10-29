"use client";

import { useState, useEffect, useCallback } from "react";
import { productStore, supplierStore, deliveryProductStore, componentStore, purchaseOrderStore, quotationStore, salesOrderStore, deliveryCustomerStore, type Product, type DeliveryProduct, type Component, type ComponentItem } from "@/lib/store";
import AddDialog from "@/components/add-dialog";
import ImportDialog from "@/components/import-dialog";

// 物料明细行：从物料库挑的多条物料组成一个组件
type BomItem = ComponentItem;

// 与采购单页一致的材质选项
const materialOptions = ["普通铝板", "5052", "6063", "1060", "3003"];

function createEmptyProduct(): Product {
  return { id: "", name: "", spec: "", weightPerMeter: 0, material: "6063-T5", defaultSupplier: "", productType: "profile" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "profile" | "plate" | "delivery" | "component">("all");
  const [deliveryProducts, setDeliveryProducts] = useState<DeliveryProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Product>(createEmptyProduct());
  const [importOpen, setImportOpen] = useState(false);

  // 成品（DeliveryProduct）编辑状态
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryProduct | null>(null);
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);

  // 组件（独立物料清单）
  const [components, setComponents] = useState<Component[]>([]);
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [componentForm, setComponentForm] = useState<Component | null>(null);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [hideBomPrices, setHideBomPrices] = useState(false);

  const genBomItemId = () => Math.random().toString(36).slice(2, 10);
  const emptyBomItem = (): BomItem => ({ id: genBomItemId(), materialCode: "", productName: "", spec: "", surface: "", unit: "", qty: 0, unitPrice: 0, amount: 0, remark: "" });

  // 更新某一行的字段；输入物料编号时自动从物料库带出名称/规格/单价
  const updateBomItem = (idx: number, field: keyof BomItem, value: string | number) => {
    setBomItems(prev => {
      const next = prev.map(it => ({ ...it }));
      const item = next[idx];
      (item as Record<string, unknown>)[field] = value;
      if (field === "materialCode") {
        const prod = deliveryProducts.find(p => p.code === value);
        if (prod) { item.materialCode = prod.code; item.productName = prod.name; item.spec = prod.spec; item.surface = prod.surface; item.unit = prod.unit; item.unitPrice = prod.unitPrice || 0; }
      } else if (field === "productName") {
        const prod = deliveryProducts.find(p => p.name === value);
        if (prod) { item.materialCode = prod.code; item.spec = prod.spec; }
      } else if (field === "spec") {
        const prod = deliveryProducts.find(p => p.spec === value);
        if (prod) { item.productName = prod.name; }
      }
      // 任何字段变化后统一按 用量 × 单价 重算金额，避免金额滞留为 0
      const q = Number(item.qty) || 0;
      const p = Number(item.unitPrice) || 0;
      item.amount = Math.round(q * p * 100) / 100;
      return next;
    });
  };

  const addBomItem = () => setBomItems(prev => [...prev, emptyBomItem()]);
  const removeBomItem = (idx: number) => { if (bomItems.length <= 1) return; setBomItems(prev => prev.filter((_, i) => i !== idx)); };

  const bomTotalAmount = bomItems.reduce((s, i) => s + i.amount, 0);

  // 统一的产品保存：落库 + 关闭弹窗 + 刷新列表
  const saveProductAndClose = (data: Product) => {
    if (isAdding) {
      productStore.add(data);
    } else if (editingProduct) {
      productStore.update(editingProduct.id, data);
    }
    setDialogOpen(false);
    setIsAdding(false);
    setEditingProduct(null);
    loadProducts();
  };

  const loadProducts = useCallback(() => {
    setProducts(productStore.getAll());
    setDeliveryProducts(deliveryProductStore.getAll());
    setComponents(componentStore.getAll());
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
    // 编号查重：新增时若编号已存在，提示避免覆盖/重复
    if (isAdding && productStore.getAll().some(p => p.id === formData.id.trim())) {
      alert("产品编号已存在，请更换一个编号");
      return;
    }
    // 米重校验：必须为不小于 0 的数字
    const w = Number(formData.weightPerMeter);
    if (!Number.isFinite(w) || w < 0) {
      alert("米重必须为不小于 0 的数字");
      return;
    }
    saveProductAndClose({ ...formData, weightPerMeter: w });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setIsAdding(false);
    setEditingProduct(null);
  };

  // 删除产品前，扫描被哪些业务单据引用，避免产生悬空关联
  const findProductReferences = (productId: string): { module: string; count: number }[] => {
    const refs: { module: string; count: number }[] = [];
    const poCount = purchaseOrderStore.getAll().reduce(
      (n, o) => n + o.items.filter(i => i.productCode === productId).length, 0
    );
    if (poCount > 0) refs.push({ module: "采购单", count: poCount });
    const qCount = quotationStore.getAll().reduce(
      (n, q) => n + q.items.filter(i => i.productCode === productId).length, 0
    );
    if (qCount > 0) refs.push({ module: "报价单", count: qCount });
    const soCount = salesOrderStore.getAll().reduce(
      (n, o) => n + o.items.filter(i => i.materialCode === productId).length, 0
    );
    if (soCount > 0) refs.push({ module: "销售订单", count: soCount });
    return refs;
  };

  const handleDelete = (id: string) => {
    const refs = findProductReferences(id);
    if (refs.length > 0) {
      const detail = refs.map(r => `${r.module}(${r.count})`).join("、");
      if (!confirm(`该产品被以下单据引用：${detail}。删除后这些引用将变成无效关联，确定要删除吗？`)) return;
    } else {
      if (!confirm("确定要删除此产品吗？")) return;
    }
    productStore.remove(id);
    loadProducts();
  };

  const handleDeleteDelivery = (id: string) => {
    if (confirm("确定要删除此物料吗？该操作会影响送货单引用的产品。")) {
      deliveryProductStore.remove(id);
      loadProducts();
    }
  };

  const openEditDelivery = (product: DeliveryProduct) => {
    setDeliveryForm({ ...product });
    setIsAddingDelivery(false);
    setDeliveryDialogOpen(true);
  };

  // 新增成品：弹出一个带唯一 id 的空成品，供填写并配置组件 BOM
  const openAddDelivery = () => {
    const id = `deliv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    setDeliveryForm({ id, code: "", name: "", spec: "", surface: "", unit: "", weightPerMeter: 0, unitPrice: 0, customer: "" });
    setIsAddingDelivery(true);
    setBomItems([emptyBomItem()]);
    setDeliveryDialogOpen(true);
  };

  const handleSaveDelivery = () => {
    if (!deliveryForm) return;
    if (!deliveryForm.name) { alert("请填写物料名称"); return; }
    const dw = Number(deliveryForm.weightPerMeter);
    if (!Number.isFinite(dw) || dw < 0) { alert("米重必须为不小于 0 的数字"); return; }
    const payload = { ...deliveryForm };
    let saved: DeliveryProduct | undefined;
    try {
      if (isAddingDelivery) {
        saved = deliveryProductStore.add(payload);
      } else {
        saved = deliveryProductStore.update(deliveryForm.id, payload);
      }
    } catch (e) {
      alert("保存失败：" + (e instanceof Error ? e.message : String(e)));
      return;
    }
    if (!saved) { alert("保存失败：物料记录未找到"); return; }
    setDeliveryDialogOpen(false);
    setDeliveryForm(null);
    setIsAddingDelivery(false);
    setBomItems([]);
    loadProducts();
  };

  // 新增组件：独立的组件编号 + 从物料库挑多条明细组成
  const openAddComponent = () => {
    const id = `CMP_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    setComponentForm({ id, name: "", items: [], unitPrice: 0 });
    setIsAddingComponent(true);
    setBomItems([emptyBomItem()]);
    setComponentDialogOpen(true);
  };

  const openEditComponent = (c: Component) => {
    setComponentForm({ ...c, items: c.items || [] });
    setIsAddingComponent(false);
    setBomItems((c.items && c.items.length > 0) ? c.items.map(i => ({ ...i })) : [emptyBomItem()]);
    setComponentDialogOpen(true);
  };

  const handleSaveComponent = () => {
    if (!componentForm) return;
    if (!componentForm.name || !componentForm.id) { alert("请填写组件编号和名称"); return; }
    const valid = bomItems.filter(i => i.materialCode || i.productName);
    const total = valid.reduce((s, i) => s + (i.amount || 0), 0);
    const payload: Component = {
      ...componentForm,
      items: valid,
      unitPrice: Math.round(total * 100) / 100,
    };
    let saved: Component | undefined;
    try {
      if (isAddingComponent) {
        saved = componentStore.add(payload);
      } else {
        saved = componentStore.update(componentForm.id, payload);
      }
    } catch (e) {
      alert("保存失败：" + (e instanceof Error ? e.message : String(e)));
      return;
    }
    if (!saved) { alert("保存失败：组件记录未找到"); return; }
    setComponentDialogOpen(false);
    setComponentForm(null);
    setIsAddingComponent(false);
    setBomItems([]);
    loadProducts();
  };

  const handleDeleteComponent = (id: string) => {
    if (confirm("确定要删除此组件吗？")) {
      componentStore.remove(id);
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
            min="0"
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
              <input type="number" step="0.1" min="0" value={formData.plateWidth ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, plateWidth: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">厚度(mm)</label>
              <input type="number" step="0.1" min="0" value={formData.thickness ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, thickness: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">步距(mm)</label>
              <input type="number" step="0.1" min="0" value={formData.step ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, step: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">每张板数量</label>
              <input type="number" min="0" value={formData.piecesPerSheet ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, piecesPerSheet: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">重量(KG)</label>
              <input type="number" step="0.001" min="0" value={formData.weight ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">刀数</label>
              <input type="number" min="0" value={formData.bladeCount ?? ""} onChange={(e) => setFormData(prev => ({ ...prev, bladeCount: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
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
  // 单位/表面处理选项来源：物料库 + 组件库明细（有手动输入新值并保存后自动收录）
  const allSurfaceValues = [
    ...deliveryProducts.map(p => p.surface),
    ...components.flatMap(c => (c.items || []).map(i => i.surface)),
  ].filter(Boolean);
  const allUnitValues = [
    ...deliveryProducts.map(p => p.unit),
    ...components.flatMap(c => (c.items || []).map(i => i.unit)),
  ].filter(Boolean);
  const bomSurfaceOptions = Array.from(new Set(allSurfaceValues));
  const bomUnitOptions = Array.from(new Set(allUnitValues));
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
            <th className="px-2 py-2 font-medium text-slate-600 w-16">用量</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-16">单价</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-20">金额</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-24">备注</th>
            <th className="px-2 py-2 font-medium text-slate-600 w-8">操作</th>
          </tr>
        </thead>
        <tbody>
          {bomItems.map((item, idx) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="px-2 py-1 text-center text-slate-500">{idx}</td>
              <td className="px-2 py-1"><input type="text" value={item.materialCode} onChange={(e) => updateBomItem(idx, "materialCode", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" placeholder="物料编号" list="bom-product-list" /></td>
              <td className="px-2 py-1"><input type="text" value={item.productName} onChange={(e) => updateBomItem(idx, "productName", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-product-name-list" /></td>
              <td className="px-2 py-1"><input type="text" value={item.spec} onChange={(e) => updateBomItem(idx, "spec", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-product-spec-list" /></td>
              <td className="px-2 py-1">
                <input type="text" value={item.surface} onChange={(e) => updateBomItem(idx, "surface", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-surface-list" placeholder="—" />
              </td>
              <td className="px-2 py-1">
                <input type="text" value={item.unit} onChange={(e) => updateBomItem(idx, "unit", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" list="bom-unit-list" placeholder="—" />
              </td>
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
            <td colSpan={8} className="px-2 py-2 text-right font-medium text-slate-600">组件单价（合计金额）</td>
            <td className="px-2 py-2 text-right font-mono font-bold text-blue-600">{hideBomPrices ? "***" : bomTotalAmount.toFixed(2)}</td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>

      {/* 成品 datalist 提示 */}
      <datalist id="bom-product-list">
        {deliveryProducts.map(p => <option key={p.id} value={p.code || ""} label={`${p.name || ""} ${p.spec || ""}`.trim()} />)}
      </datalist>
      <datalist id="bom-product-name-list">
        {Array.from(new Set(deliveryProducts.map(p => p.name).filter(Boolean))).map(n => <option key={n} value={n} />)}
      </datalist>
      <datalist id="bom-product-spec-list">
        {Array.from(new Set(deliveryProducts.map(p => p.spec).filter(Boolean))).map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="bom-surface-list">
        {bomSurfaceOptions.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="bom-unit-list">
        {bomUnitOptions.map(u => <option key={u} value={u} />)}
      </datalist>

      <div className="flex gap-2 mt-4">
        <button onClick={addBomItem} className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">+ 添加行</button>
        <button onClick={() => setHideBomPrices(!hideBomPrices)} className={`px-3 py-1.5 text-xs rounded-md border ${hideBomPrices ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
          {hideBomPrices ? "显示价格" : "隐藏价格"}
        </button>
        <button onClick={handleSaveComponent} className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">产品库管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            批量导入
          </button>
          <button
          onClick={typeFilter === "delivery" ? openAddDelivery : typeFilter === "component" ? openAddComponent : openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {typeFilter === "delivery" ? "新增物料" : typeFilter === "component" ? "新增组件" : "新增产品"}
        </button>
        </div>
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
          {([{ key: "all", label: "全部" },
            { key: "profile", label: "型材" },
            { key: "plate", label: "板材" },
            { key: "delivery", label: "物料" },
            { key: "component", label: "组件" },
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
        {typeFilter === "component" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">组件编号</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">组件名称</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">组成物料</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-600">组件单价</th>
                <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {components.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">暂无组件数据</td></tr>
              ) : (
                components.filter(c =>
                  !search ||
                  c.id.toLowerCase().includes(search.toLowerCase()) ||
                  c.name.toLowerCase().includes(search.toLowerCase())
                ).map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono text-blue-600">{c.id}</td>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2">{(c.items || []).length > 0 ? `${(c.items || []).length} 项` : "-"}</td>
                    <td className="px-4 py-2 text-right font-mono">{c.unitPrice ? c.unitPrice.toFixed(2) : "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditComponent(c)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                        <button onClick={() => handleDeleteComponent(c.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : typeFilter === "delivery" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">物料编号</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">物料名称</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">规格</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">表面处理</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">单位</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-600">单价</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-600">所属客户</th>
                <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {deliveryProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">暂无物料数据</td>
                </tr>
              ) : (
                deliveryProducts.filter(p =>
                  !search ||
                  p.code.toLowerCase().includes(search.toLowerCase()) ||
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.spec.toLowerCase().includes(search.toLowerCase())
                ).map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-2 font-mono text-blue-600">{product.code || "-"}</td>
                    <td className="px-4 py-2">{product.name}</td>
                    <td className="px-4 py-2">{product.spec}</td>
                    <td className="px-4 py-2">{product.surface || "-"}</td>
                    <td className="px-4 py-2">{product.unit || "-"}</td>
                    <td className="px-4 py-2 text-right font-mono">{product.unitPrice ? product.unitPrice.toFixed(2) : "-"}</td>
                    <td className="px-4 py-2">{product.customer || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEditDelivery(product)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                        <button onClick={() => handleDeleteDelivery(product.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
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
                    <td className="px-4 py-2 text-right font-mono">{(() => { const w = product.weightPerMeter ?? product.weight; return w != null ? w.toFixed(3) : "-"; })()}</td>
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
        )}
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {typeFilter === "delivery" ? deliveryProducts.length : typeFilter === "component" ? components.length : filtered.length} 条{typeFilter === "delivery" ? "物料" : typeFilter === "component" ? "组件" : "产品"}记录
      </div>

      {deliveryDialogOpen && deliveryForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2" onClick={() => setDeliveryDialogOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{isAddingDelivery ? "新增物料" : "编辑物料"}</h2>
              <button onClick={() => setDeliveryDialogOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">物料编号</label>
                <input type="text" value={deliveryForm.code || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, code: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">物料名称 <span className="text-red-500">*</span></label>
                <input type="text" value={deliveryForm.name} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, name: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">规格</label>
                <input type="text" value={deliveryForm.spec || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, spec: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">表面处理</label>
                <input type="text" list="bom-surface-list" value={deliveryForm.surface || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, surface: e.target.value }))} placeholder="- 选择或输入 -" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">单位</label>
                <input type="text" list="bom-unit-list" value={deliveryForm.unit || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, unit: e.target.value }))} placeholder="- 选择或输入 -" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">米重(KG)</label>
                <input type="number" step="0.001" min="0" value={deliveryForm.weightPerMeter || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, weightPerMeter: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">单价</label>
                <input type="number" step="0.01" value={deliveryForm.unitPrice || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, unitPrice: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">所属客户</label>
                <select value={deliveryForm.customer || ""} onChange={(e) => setDeliveryForm(prev => ({ ...prev!, customer: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white">
                  <option value="">- 请选择 -</option>
                  {deliveryCustomerStore.getAll().map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setDeliveryDialogOpen(false)} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
              <button onClick={handleSaveDelivery} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      ) : null}

      {dialogOpen ? (
        <AddDialog
          title={isAdding ? "新增产品" : "编辑产品"}
          kind="product"
          onClose={closeDialog}
          onImported={loadProducts}
        >
          {form}
        </AddDialog>
      ) : null}

      {importOpen ? (
        <ImportDialog kind="product" onClose={() => setImportOpen(false)} onImported={loadProducts} />
      ) : null}

      {componentDialogOpen && componentForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2" onClick={() => setComponentDialogOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{isAddingComponent ? "新增组件" : "编辑组件"}</h2>
              <button onClick={() => setComponentDialogOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">组件编号 <span className="text-red-500">*</span></label>
                <input type="text" value={componentForm.id || ""} onChange={(e) => setComponentForm(prev => ({ ...prev!, id: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="如 CMP-001" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">组件名称 <span className="text-red-500">*</span></label>
                <input type="text" value={componentForm.name || ""} onChange={(e) => setComponentForm(prev => ({ ...prev!, name: e.target.value }))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="mb-3 text-sm font-medium text-slate-700">组成物料明细（从物料库挑选）</div>
              {bomTabContent}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
