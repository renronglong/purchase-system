"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  purchaseOrderStore, supplierStore, previewPurchaseOrderNo,
  type PurchaseOrder, type PurchaseOrderItem,
} from "@/lib/store";
import { purchasingCompanies, surfaceTreatments } from "@/lib/seed-data";
import ProductSearchSelect from "@/components/product-search-select";

type OrderType = "profile" | "plate";

const materialOptions = ["普通铝板", "5052", "6063", "1060", "3003"];

function generateItemId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyItem(orderType: OrderType = "profile"): PurchaseOrderItem {
  const base = {
    id: generateItemId(),
    productCode: "",
    productName: "",
    spec: "",
    length: 0,
    quantity: 0,
    unit: "支",
    weightPerMeter: 0,
    totalWeight: 0,
    surfaceTreatment: "",
    deliveryDate: "",
    remark: "",
  };
  if (orderType === "plate") {
    return {
      ...base,
      unit: "",
      material: "",
      sheetsCount: 0,
      piecesPerSheet: 0,
      actualOutput: 0,
      bladeCount: 0,
    };
  }
  return base;
}

function calcWeight(weightPerMeter: number, length: number, quantity: number): number {
  return weightPerMeter * (length / 1000) * quantity;
}

export default function PurchaseOrderFormPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isEdit = !!params.id && params.id !== "new";
  const orderId = params.id as string;

  // Determine order type from URL param or existing order
  const [orderType, setOrderType] = useState<OrderType>("profile");
  const [company, setCompany] = useState(purchasingCompanies[0]);
  const [orderNo, setOrderNo] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [maker, setMaker] = useState("易金兰");
  const [items, setItems] = useState<PurchaseOrderItem[]>([createEmptyItem()]);
  const [typeLocked, setTypeLocked] = useState(false); // lock type when editing

  const suppliers = supplierStore.getAll();

  const loadOrder = useCallback(() => {
    if (!isEdit) return;
    const order = purchaseOrderStore.getById(orderId);
    if (!order) return;
    const ot = (order.orderType || "profile") as OrderType;
    setOrderType(ot);
    setTypeLocked(true);
    setCompany(order.company);
    setOrderNo(order.orderNo);
    setSupplierId(order.supplierId);
    setSupplierName(order.supplierName);
    setContact(order.contact);
    setPhone(order.phone);
    setAddress(order.address);
    setOrderDate(order.orderDate);
    setMaker(order.maker || "");
    setItems(order.items.length > 0 ? order.items : [createEmptyItem(ot)]);
  }, [isEdit, orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!isEdit) {
      setOrderNo(previewPurchaseOrderNo());
      // Check URL param for initial order type
      const typeParam = searchParams.get("type");
      if (typeParam === "plate") {
        setOrderType("plate");
        setItems([createEmptyItem("plate")]);
      }
    }
  }, [isEdit, searchParams]);

  const handleSupplierChange = (sid: string) => {
    setSupplierId(sid);
    const s = suppliers.find(sup => sup.id === sid);
    if (s) {
      setSupplierName(s.name);
      setContact(s.contact);
      setPhone(s.phone);
      setAddress(s.address);
    }
  };

  const calcPlateFields = (item: PurchaseOrderItem): PurchaseOrderItem => {
    const orderQty = item.quantity || 0;
    const pps = item.piecesPerSheet || 0;
    if (pps > 0 && orderQty > 0) {
      const sc = Math.ceil(orderQty / pps);
      const ao = sc * pps;
      const perSheetBlade = item.bladeCount || 0;
      return { ...item, sheetsCount: sc, actualOutput: ao };
    }
    return item;
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (orderType === "profile") {
        item.totalWeight = calcWeight(item.weightPerMeter, item.length, item.quantity);
      } else if (orderType === "plate") {
        return next.map((it, i) => i === index ? calcPlateFields(item) : it);
      }
      next[index] = item;
      return next;
    });
  };

  const handleProductSelect = (index: number, product: any | null) => {
    if (!product) return;
    setItems(prev => {
      const next = [...prev];
      if (orderType === "plate") {
        // For plate: auto-fill plate-specific fields from product data
        let item: any = {
          ...next[index],
          productCode: product.id,
          productName: product.name,
          spec: product.spec,
          piecesPerSheet: product.piecesPerSheet || 0,
          bladeCount: product.bladeCount || 0,
        };
        // Recalculate based on existing quantity
        item = calcPlateFields(item);
        next[index] = item;
      } else {
        const item = {
          ...next[index],
          productCode: product.id,
          productName: product.name,
          spec: product.spec,
          weightPerMeter: product.weightPerMeter || 0,
        };
        item.totalWeight = calcWeight(item.weightPerMeter, item.length, item.quantity);
        next[index] = item;
      }
      return next;
    });
  };

  const handleOrderTypeChange = (newType: OrderType) => {
    if (typeLocked) return;
    setOrderType(newType);
    setItems([createEmptyItem(newType)]);
  };

  const addItem = () => {
    setItems(prev => [...prev, createEmptyItem(orderType)]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.totalWeight, 0);
  const totalSheets = items.reduce((sum, item) => sum + (item.sheetsCount || 0), 0);
  const totalActualOutput = items.reduce((sum, item) => sum + (item.actualOutput || 0), 0);

  const handleSave = () => {
    if (!supplierName) {
      alert("请选择供应商");
      return;
    }
    const validItems = items.filter(item => item.productCode);
    if (validItems.length === 0) {
      alert("请至少添加一条产品明细");
      return;
    }

    const orderData: any = {
      company,
      supplierId,
      supplierName,
      contact,
      phone,
      address,
      orderDate,
      maker,
      orderType,
      items: validItems,
      totalQuantity,
      totalWeight,
    };

    if (orderType === "plate") {
      orderData.totalSheets = totalSheets;
      orderData.totalActualOutput = totalActualOutput;
    }

    // 保存制单人到历史记录
    if (maker) {
      try {
        const history = JSON.parse(localStorage.getItem("print_maker_names") || "[]") as string[];
        const filtered = history.filter(n => n !== maker);
        filtered.unshift(maker);
        localStorage.setItem("print_maker_names", JSON.stringify(filtered.slice(0, 20)));
      } catch { /* ignore */ }
    }

    if (isEdit) {
      purchaseOrderStore.update(orderId, orderData);
    } else {
      purchaseOrderStore.add(orderData);
    }
    router.push("/");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          {isEdit ? "编辑采购单" : "新建采购单"}
          {orderType === "plate" && <span className="ml-2 text-sm px-2 py-0.5 bg-orange-100 text-orange-700 rounded">板材</span>}
          {orderType === "profile" && <span className="ml-2 text-sm px-2 py-0.5 bg-blue-100 text-blue-700 rounded">型材</span>}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>

      {/* 头部信息 */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">订单编号</label>
            <input
              type="text"
              value={orderNo}
              readOnly
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 font-mono text-blue-600 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">订单类型</label>
            <select
              value={orderType}
              onChange={(e) => handleOrderTypeChange(e.target.value as OrderType)}
              disabled={typeLocked}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
            >
              <option value="profile">型材</option>
              <option value="plate">板材</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">采购公司</label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {purchasingCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">制单日期</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">制单人</label>
            <input
              type="text"
              value={maker}
              onChange={(e) => setMaker(e.target.value)}
              list="maker-history-list"
              placeholder="输入制单人姓名"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <datalist id="maker-history-list">
              {(() => {
                try {
                  const names = JSON.parse(localStorage.getItem("print_maker_names") || "[]") as string[];
                  return names.map(n => <option key={n} value={n} />);
                } catch { return null; }
              })()}
            </datalist>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">供应商 <span className="text-red-500">*</span></label>
            <select
              value={supplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">请选择供应商</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">联系人</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">电话</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">地址</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50"
              readOnly
            />
          </div>
        </div>
      </div>

      {/* 明细表格 - 型材 */}
      {orderType === "profile" && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-xs min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-2 py-2 font-medium text-slate-600 w-10">序号</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-36">产品编号</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-24">产品名称</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-24">规格尺寸mm</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-20">长度mm</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-16">数量</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-14">单位</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-24">理论重量KG</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-28">表面处理</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-28">交货时间</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-32">备注</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-12">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 text-center text-slate-500">{index + 1}</td>
                  <td className="px-2 py-1.5">
                    <ProductSearchSelect
                      value={item.productCode}
                      onChange={(product) => handleProductSelect(index, product)}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-slate-600">{item.productName}</td>
                  <td className="px-2 py-1.5 text-slate-600">{item.spec}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.length || ""}
                      onChange={(e) => updateItem(index, "length", Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-slate-700">
                    {item.totalWeight.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={item.surfaceTreatment}
                      onChange={(e) => updateItem(index, "surfaceTreatment", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    >
                      <option value="">请选择</option>
                      {surfaceTreatments.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={item.deliveryDate}
                      onChange={(e) => updateItem(index, "deliveryDate", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.remark}
                      onChange={(e) => updateItem(index, "remark", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                      placeholder="备注"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={5} className="px-2 py-2 text-right text-sm font-medium text-slate-600">合计</td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-900">{totalQuantity}</td>
                <td className="px-2 py-2"></td>
                <td className="px-2 py-2 text-right font-mono font-bold text-slate-900">{totalWeight.toFixed(2)}</td>
                <td colSpan={4}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 明细表格 - 板材 */}
      {orderType === "plate" && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-xs min-w-[1200px]">
            <thead>
              <tr className="bg-orange-50 border-b border-orange-200">
                <th className="px-2 py-2 font-medium text-slate-600 w-10">序号</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-32">产品编号</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-20">材质</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-20">订单数量</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-16">张数</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-12">单位</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-32">规格尺寸</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-20">单张数量</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-20">实际数量</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-16">刀数</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-28">日期</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-28">备注</th>
                <th className="px-2 py-2 font-medium text-slate-600 w-10">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 text-center text-slate-500">{index + 1}</td>
                  <td className="px-2 py-1.5">
                    <ProductSearchSelect
                      value={item.productCode}
                      onChange={(product) => handleProductSelect(index, product)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={item.material || ""}
                      onChange={(e) => updateItem(index, "material", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    >
                      <option value="">请选择</option>
                      {materialOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center text-slate-600 font-mono">{item.sheetsCount || ""}</td>
                  <td className="px-2 py-1.5 text-center text-slate-600">张</td>
                  <td className="px-2 py-1.5 text-slate-600">{item.spec}</td>
                  <td className="px-2 py-1.5 text-center text-slate-600 font-mono">{item.piecesPerSheet || ""}</td>
                  <td className="px-2 py-1.5 text-center text-slate-600 font-mono">{item.actualOutput || ""}</td>
                  <td className="px-2 py-1.5 text-center text-slate-600 font-mono">{(item.bladeCount || 0) * (item.sheetsCount || 0) || ""}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={item.deliveryDate}
                      onChange={(e) => updateItem(index, "deliveryDate", e.target.value)}
                      className="w-full px-1 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={item.remark}
                      onChange={(e) => updateItem(index, "remark", e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500/30"
                      placeholder="备注"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-orange-50 border-t border-orange-200">
                <td colSpan={3} className="px-2 py-2 text-right text-sm font-medium text-slate-600">合计</td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-900">{items.reduce((s, it) => s + (it.quantity || 0), 0)}</td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-900">{totalSheets}</td>
                <td></td>
                <td></td>
                <td></td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-900">{totalActualOutput}</td>
                <td className="px-2 py-2 text-center font-mono font-bold text-slate-900">{items.reduce((s, it) => s + (it.bladeCount || 0) * (it.sheetsCount || 0), 0)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="mt-3">
        <button
          onClick={addItem}
          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md hover:opacity-80 ${
            orderType === "plate"
              ? "text-orange-600 border-orange-200 hover:bg-orange-50"
              : "text-blue-600 border-blue-200 hover:bg-blue-50"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          添加行
        </button>
      </div>
    </div>
  );
}
