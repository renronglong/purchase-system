"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProductSearchSelect from "@/components/product-search-select";
import {
  supplierStore,
  purchaseOrderStore,
  deliveryNoteStore,
  type Product,
  type Supplier,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "@/lib/store";

// 库存记录类型
interface InventoryRecord {
  id: string;
  type: "inbound" | "outbound"; // 入库/出库
  productCode: string;
  productName: string;
  spec: string;
  surface: string;
  quantity: number;
  unit: string;
  supplierName: string; // 供应商
  referenceNo: string; // 关联单据号（采购单号/送货单号）
  operator: string; // 操作员
  remark: string;
  createdAt: string;
}

// 库存汇总
interface InventorySummary {
  productCode: string;
  productName: string;
  spec: string;
  surface: string;
  unit: string;
  inboundQty: number;
  outboundQty: number;
  currentQty: number;
}

const STORAGE_KEY = "inventory_records_local";

// 表面处理选项（来自送货单真实数据）
const SURFACE_OPTIONS = [
  "", "喷涂", "拉丝", "本色", "白色", "砂白", "砂纹白", "砂银",
  "银白", "铁灰", "氧化砂银", "氧化雾银", "氧化黑色", "镀彩锌", "镀白锌",
];

// 从 localStorage 加载
function loadRecords(): InventoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 保存到 localStorage
function saveRecords(records: InventoryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 生成单号
function genRecordNo(records: InventoryRecord[], type: "inbound" | "outbound"): string {
  const prefix = type === "inbound" ? "IN" : "OUT";
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const todayRecords = records.filter(
    (r) => r.id.startsWith(prefix + today)
  );
  const maxSeq = todayRecords.reduce((max, r) => {
    const seq = parseInt(r.id.slice(-3), 10);
    return seq > max ? seq : max;
  }, 0);
  return `${prefix}${today}${String(maxSeq + 1).padStart(3, "0")}`;
}

// 供应商搜索选择组件
function SupplierSearchSelect({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (supplier: Supplier | null) => void;
}) {
  const [keyword, setKeyword] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Supplier[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setKeyword(value); }, [value]);

  useEffect(() => {
    if (keyword.length >= 1) {
      const all = supplierStore.getAll();
      const kw = keyword.toLowerCase();
      const found = all.filter((s) => s.name.toLowerCase().includes(kw) || s.contact.toLowerCase().includes(kw));
      setResults(found.slice(0, 20));
      setIsOpen(found.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (supplier: Supplier) => {
    setKeyword(supplier.name);
    setIsOpen(false);
    onSelect(supplier);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter" && selectedIndex >= 0) { e.preventDefault(); handleSelect(results[selectedIndex]); }
    else if (e.key === "Escape") { setIsOpen(false); }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => { setKeyword(e.target.value); if (e.target.value === "") onSelect(null); }}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="输入供应商名称搜索"
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {results.map((supplier, idx) => (
            <div
              key={supplier.id}
              onClick={() => handleSelect(supplier)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${idx === selectedIndex ? "bg-blue-50" : ""}`}
            >
              {supplier.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 采购单搜索选择组件
function PurchaseOrderSearchSelect({
  onSelect,
}: {
  onSelect: (order: PurchaseOrder | null) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<PurchaseOrder[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (keyword.length >= 2) {
      const all = purchaseOrderStore.getAll();
      const kw = keyword.toLowerCase();
      const found = all.filter(
        (o) => o.orderNo.toLowerCase().includes(kw) || o.supplierName.toLowerCase().includes(kw)
      );
      setResults(found.slice(0, 10));
      setIsOpen(found.length > 0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [keyword]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (order: PurchaseOrder) => {
    setKeyword(order.orderNo);
    setIsOpen(false);
    onSelect(order);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter" && selectedIndex >= 0) { e.preventDefault(); handleSelect(results[selectedIndex]); }
    else if (e.key === "Escape") { setIsOpen(false); }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="输入采购单号或供应商名称搜索"
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-auto">
          {results.map((order, idx) => (
            <div
              key={order.id}
              onClick={() => handleSelect(order)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 ${idx === selectedIndex ? "bg-blue-50" : ""}`}
            >
              <span className="font-mono text-blue-600">{order.orderNo}</span>
              <span className="ml-2 text-slate-700">{order.supplierName}</span>
              <span className="ml-2 text-slate-400">{order.items.length}项</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [activeTab, setActiveTab] = useState<"summary" | "inbound" | "outbound">("summary");

  // 表单状态
  const [formType, setFormType] = useState<"inbound" | "outbound">("inbound");
  const [editingRecord, setEditingRecord] = useState<InventoryRecord | null>(null);
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    spec: "",
    surface: "",
    quantity: "",
    unit: "条",
    supplierName: "",
    referenceNo: "",
    operator: "",
    remark: "",
  });
  const [productSearchKey, setProductSearchKey] = useState("");

  // 关联采购单状态
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // 加载数据
  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  // 保存数据
  const saveData = useCallback((newRecords: InventoryRecord[]) => {
    saveRecords(newRecords);
    setRecords(newRecords);
  }, []);

  // 新建入库/出库
  const handleNew = (type: "inbound" | "outbound") => {
    setFormType(type);
    setEditingRecord(null);
    setFormData({
      productCode: "",
      productName: "",
      spec: "",
      surface: "",
      quantity: "",
      unit: "条",
      supplierName: "",
      referenceNo: "",
      operator: "",
      remark: "",
    });
    setProductSearchKey("");
    setSelectedOrder(null);
    setView("form");
  };

  // 编辑记录
  const handleEdit = (record: InventoryRecord) => {
    setFormType(record.type);
    setEditingRecord(record);
    setFormData({
      productCode: record.productCode,
      productName: record.productName,
      spec: record.spec,
      surface: record.surface,
      quantity: String(record.quantity),
      unit: record.unit,
      supplierName: record.supplierName || "",
      referenceNo: record.referenceNo,
      operator: record.operator,
      remark: record.remark,
    });
    setProductSearchKey(record.productCode);
    setSelectedOrder(null);
    setView("form");
  };

  // 从产品库选中产品后自动填充
  const handleProductSelect = (product: Product | null) => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        productCode: product.id,
        productName: product.name,
        spec: product.spec,
      }));
    }
  };

  // 选择采购单后，自动填充供应商和单号
  const handleOrderSelect = (order: PurchaseOrder | null) => {
    setSelectedOrder(order);
    if (order) {
      setFormData((prev) => ({
        ...prev,
        referenceNo: order.orderNo,
        supplierName: order.supplierName,
      }));
    }
  };

  // 点击采购单中的某行产品，自动填充产品信息
  const handleOrderItemClick = (item: PurchaseOrderItem) => {
    setFormData((prev) => ({
      ...prev,
      productCode: item.productCode,
      productName: item.productName,
      spec: item.spec,
      surface: item.surfaceTreatment,
      quantity: String(item.quantity),
      unit: item.unit,
    }));
    setProductSearchKey(item.productCode);
  };

  // 保存记录
  const handleSubmit = () => {
    if (!formData.productCode || !formData.quantity) {
      alert("请填写产品编号和数量");
      return;
    }

    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      alert("数量必须是大于0的数字");
      return;
    }

    let newRecords: InventoryRecord[];

    if (editingRecord) {
      newRecords = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              productCode: formData.productCode,
              productName: formData.productName,
              spec: formData.spec,
              surface: formData.surface,
              quantity: qty,
              unit: formData.unit,
              supplierName: formData.supplierName,
              referenceNo: formData.referenceNo,
              operator: formData.operator,
              remark: formData.remark,
            }
          : r
      );
    } else {
      const newRecord: InventoryRecord = {
        id: genRecordNo(records, formType),
        type: formType,
        productCode: formData.productCode,
        productName: formData.productName,
        spec: formData.spec,
        surface: formData.surface,
        quantity: qty,
        unit: formData.unit,
        supplierName: formData.supplierName,
        referenceNo: formData.referenceNo,
        operator: formData.operator,
        remark: formData.remark,
        createdAt: new Date().toISOString(),
      };
      newRecords = [newRecord, ...records];
    }

    saveData(newRecords);
    setView("list");
  };

  // 删除记录
  const handleDelete = (id: string) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    const newRecords = records.filter((r) => r.id !== id);
    saveData(newRecords);
  };

  // 计算库存汇总
  const getInventorySummary = (): InventorySummary[] => {
    const map = new Map<string, InventorySummary>();

    records.forEach((r) => {
      const key = `${r.productCode}-${r.spec}-${r.surface}`;
      if (!map.has(key)) {
        map.set(key, {
          productCode: r.productCode,
          productName: r.productName,
          spec: r.spec,
          surface: r.surface,
          unit: r.unit,
          inboundQty: 0,
          outboundQty: 0,
          currentQty: 0,
        });
      }
      const summary = map.get(key)!;
      if (r.type === "inbound") {
        summary.inboundQty += r.quantity;
        summary.currentQty += r.quantity;
      } else {
        summary.outboundQty += r.quantity;
        summary.currentQty -= r.quantity;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.productCode.localeCompare(b.productCode));
  };

  const summary = getInventorySummary();

  // 表单页
  if (view === "form") {
    const recordNo = editingRecord?.id || genRecordNo(records, formType);
    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {formType === "inbound" ? "入库单" : "出库单"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">单号：{recordNo}</p>
          </div>
          <button
            onClick={() => setView("list")}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            ← 返回列表
          </button>
        </div>

        {/* 关联采购单区域（仅入库单显示） */}
        {formType === "inbound" && !editingRecord && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <span className="text-sm font-medium text-blue-900">关联采购单</span>
              <span className="text-xs text-blue-600 ml-2">选择后自动带出供应商和产品信息</span>
            </div>
            <PurchaseOrderSearchSelect onSelect={handleOrderSelect} />

            {/* 采购单产品明细列表 */}
            {selectedOrder && selectedOrder.items.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-blue-700 mb-2">
                  采购单 {selectedOrder.orderNo} 的产品明细（点击行填充到表单）：
                </p>
                <div className="bg-white rounded border border-blue-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">产品编号</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">产品名称</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">规格</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">表面处理</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">数量</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-blue-800">单位</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {selectedOrder.items.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => handleOrderItemClick(item)}
                          className={`cursor-pointer hover:bg-blue-50 ${
                            formData.productCode === item.productCode && formData.spec === item.spec
                              ? "bg-blue-100"
                              : ""
                          }`}
                        >
                          <td className="px-3 py-2 text-xs text-slate-900 font-mono">{item.productCode}</td>
                          <td className="px-3 py-2 text-xs text-slate-700">{item.productName}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{item.spec}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">{item.surfaceTreatment}</td>
                          <td className="px-3 py-2 text-xs text-right text-slate-900">{item.quantity}</td>
                          <td className="px-3 py-2 text-xs text-center text-slate-600">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 产品编号 - 关联产品库搜索 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                产品编号 <span className="text-red-500">*</span>
              </label>
              <ProductSearchSelect
                value={productSearchKey}
                onChange={handleProductSelect}
                placeholder="输入编号/名称搜索产品库"
              />
            </div>
            {/* 产品名称 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                产品名称
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                placeholder="选择产品后自动填充"
              />
            </div>
            {/* 规格 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                规格
              </label>
              <input
                type="text"
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50"
                placeholder="选择产品后自动填充"
              />
            </div>
            {/* 表面处理 - 下拉选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                表面处理（颜色）
              </label>
              <select
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {SURFACE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || "-- 请选择 --"}
                  </option>
                ))}
              </select>
            </div>
            {/* 供应商 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                供应商
              </label>
              <SupplierSearchSelect
                value={formData.supplierName}
                onSelect={(supplier) =>
                  setFormData({ ...formData, supplierName: supplier?.name || "" })
                }
              />
            </div>
            {/* 数量 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                step="0.01"
              />
            </div>
            {/* 单位 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                单位
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="条">条</option>
                <option value="支">支</option>
                <option value="根">根</option>
                <option value="件">件</option>
                <option value="kg">kg</option>
              </select>
            </div>
            {/* 关联单据号 - 下拉选择（采购单+送货单） */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                关联单据号
              </label>
              <input
                type="text"
                list="reference-no-list"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="点击选择或手动输入"
              />
              <datalist id="reference-no-list">
                <option value="" disabled>-- 选择单据 --</option>
                {(() => {
                  const orders = purchaseOrderStore.getAll().map(o => o.orderNo);
                  const notes = deliveryNoteStore.getAll().map(n => n.noteNo);
                  return [...orders, ...notes].map(no => (
                    <option key={no} value={no} />
                  ));
                })()}
              </datalist>
            </div>
            {/* 操作员 - 下拉选择（历史记录+可手动输入） */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                操作员
              </label>
              <input
                type="text"
                list="operator-list"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="点击选择或手动输入"
              />
              <datalist id="operator-list">
                <option value="" disabled>-- 选择操作员 --</option>
                {(() => {
                  const existing = loadRecords().map(r => r.operator).filter(Boolean);
                  const unique = Array.from(new Set(existing));
                  return unique.map(name => (
                    <option key={name} value={name} />
                  ));
                })()}
              </datalist>
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button
              onClick={() => setView("list")}
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 列表页
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">库存管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleNew("inbound")}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            + 新建入库
          </button>
          <button
            onClick={() => handleNew("outbound")}
            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
          >
            + 新建出库
          </button>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="mb-4 border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "summary"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            库存汇总
          </button>
          <button
            onClick={() => setActiveTab("inbound")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "inbound"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            入库记录 ({records.filter((r) => r.type === "inbound").length})
          </button>
          <button
            onClick={() => setActiveTab("outbound")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "outbound"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            出库记录 ({records.filter((r) => r.type === "outbound").length})
          </button>
        </div>
      </div>

      {/* 库存汇总 */}
      {activeTab === "summary" && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">产品编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">产品名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">规格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">表面处理</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">入库数量</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">出库数量</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">当前库存</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600">单位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无库存数据
                  </td>
                </tr>
              ) : (
                summary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{item.productCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.spec}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.surface}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-600">
                      {item.inboundQty > 0 ? `+${item.inboundQty}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {item.outboundQty > 0 ? `-${item.outboundQty}` : "-"}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      item.currentQty > 0 ? "text-slate-900" : item.currentQty < 0 ? "text-red-600" : "text-slate-400"
                    }`}>
                      {item.currentQty}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{item.unit}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 入库/出库记录 */}
      {(activeTab === "inbound" || activeTab === "outbound") && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">单号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">产品编号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">产品名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">规格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">供应商</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">数量</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600">单位</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">关联单号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">操作员</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">时间</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.filter((r) => r.type === activeTab).length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无记录
                  </td>
                </tr>
              ) : (
                records
                  .filter((r) => r.type === activeTab)
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 font-mono">{record.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.productCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.productName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.spec}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.supplierName || "-"}</td>
                      <td className={`px-4 py-3 text-sm text-right font-medium ${
                        record.type === "inbound" ? "text-green-600" : "text-red-600"
                      }`}>
                        {record.type === "inbound" ? "+" : "-"}{record.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-slate-600">{record.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.referenceNo}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.operator}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(record.createdAt).toLocaleDateString("zh-CN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
