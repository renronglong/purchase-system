"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ProductSearchSelect from "@/components/product-search-select";
import {
  supplierStore,
  purchaseOrderStore,
  type Product,
  type Supplier,
  type PurchaseOrder,
  type PurchaseOrderItem,
} from "@/lib/store";

// 库存记录类型
interface InventoryRecord {
  id: string;
  type: "inbound" | "outbound"; // 入库/出库
  orderType?: "profile" | "plate"; // 单据类型：型材/板材，默认 profile
  productCode: string;
  productName: string;
  spec: string;
  surface: string;
  material?: string; // 材质（板材）
  quantity: number;
  unit: string;
  piecesPerSheet?: number; // 单张数量（板材）
  actualOutput?: number; // 实际数量（板材）
  bladeCount?: number; // 总刀数（板材）
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
  material?: string;
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

  // 最近采购单（按创建时间倒序，最多10条）
  const getRecentOrders = (): PurchaseOrder[] => {
    return purchaseOrderStore
      .getAll()
      .slice()
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
      .slice(0, 10);
  };

  useEffect(() => {
    if (keyword.trim().length >= 1) {
      const all = purchaseOrderStore.getAll();
      const kw = keyword.toLowerCase();
      const found = all.filter(
        (o) => o.orderNo.toLowerCase().includes(kw) || o.supplierName.toLowerCase().includes(kw)
      );
      setResults(found.slice(0, 10));
      setIsOpen(found.length > 0);
    } else if (isOpen) {
      // 无关键词且下拉打开时，显示最近采购单
      setResults(getRecentOrders());
    }
    setSelectedIndex(-1);
  }, [keyword, isOpen]);

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

  const toggleOpen = () => {
    if (!isOpen) {
      setResults(keyword.trim() ? results : getRecentOrders());
    }
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && isOpen) { e.preventDefault(); setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1)); }
    else if (e.key === "ArrowUp" && isOpen) { e.preventDefault(); setSelectedIndex((prev) => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter") {
      if (selectedIndex >= 0) { e.preventDefault(); handleSelect(results[selectedIndex]); }
      else if (!isOpen) { setIsOpen(true); }
    }
    else if (e.key === "Escape") { setIsOpen(false); }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => { if (!isOpen) { setResults(getRecentOrders()); setIsOpen(true); } }}
        onKeyDown={handleKeyDown}
        placeholder="点击选择最近采购单，或输入单号/供应商搜索"
        className="w-full px-3 py-2 pr-9 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
      />
      <button
        type="button"
        onClick={toggleOpen}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {keyword.trim().length === 0 && (
            <div className="px-3 py-1.5 text-xs text-slate-400 bg-slate-50 border-b border-slate-100">最近采购单</div>
          )}
          {results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-slate-400 text-center">未找到匹配的采购单</div>
          ) : results.map((order, idx) => (
            <div
              key={order.id}
              onClick={() => handleSelect(order)}
              className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 flex items-center ${idx === selectedIndex ? "bg-blue-50" : ""}`}
            >
              <span className="font-mono text-blue-600">{order.orderNo}</span>
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                (order.orderType || "profile") === "plate"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {(order.orderType || "profile") === "plate" ? "板材" : "型材"}
              </span>
              <span className="ml-2 text-slate-700 truncate flex-1">{order.supplierName}</span>
              <span className="ml-2 text-slate-400 whitespace-nowrap">{order.items.length}项</span>
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
    orderType: "profile" as "profile" | "plate",
    productCode: "",
    productName: "",
    spec: "",
    surface: "",
    material: "",
    quantity: "",
    unit: "条",
    piecesPerSheet: "",
    actualOutput: "",
    bladeCount: "",
    supplierName: "",
    referenceNo: "",
    operator: "",
    remark: "",
  });
  const [productSearchKey, setProductSearchKey] = useState("");

  // 关联采购单状态
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const isPlate = formData.orderType === "plate";

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
      orderType: "profile",
      productCode: "",
      productName: "",
      spec: "",
      surface: "",
      material: "",
      quantity: "",
      unit: "条",
      piecesPerSheet: "",
      actualOutput: "",
      bladeCount: "",
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
      orderType: record.orderType || "profile",
      productCode: record.productCode,
      productName: record.productName,
      spec: record.spec,
      surface: record.surface,
      material: record.material || "",
      quantity: String(record.quantity),
      unit: record.unit,
      piecesPerSheet: record.piecesPerSheet ? String(record.piecesPerSheet) : "",
      actualOutput: record.actualOutput ? String(record.actualOutput) : "",
      bladeCount: record.bladeCount ? String(record.bladeCount) : "",
      supplierName: record.supplierName || "",
      referenceNo: record.referenceNo,
      operator: record.operator,
      remark: record.remark,
    });
    setProductSearchKey(record.productCode);
    setSelectedOrder(null);
    setView("form");
  };

  // 切换型材/板材模式
  const switchOrderType = (ot: "profile" | "plate") => {
    setFormData((prev) => ({
      ...prev,
      orderType: ot,
      surface: ot === "plate" ? "" : prev.surface,
      material: ot === "plate" ? prev.material : "",
      unit: ot === "plate" ? "张" : "条",
      piecesPerSheet: ot === "plate" ? prev.piecesPerSheet : "",
      actualOutput: ot === "plate" ? prev.actualOutput : "",
      bladeCount: ot === "plate" ? prev.bladeCount : "",
    }));
    if (ot === "profile") {
      setProductSearchKey("");
      setFormData((prev) => ({ ...prev, productCode: "", productName: "", spec: "" }));
    }
  };

  // 从产品库选中产品后自动填充
  const handleProductSelect = (product: any | null) => {
    if (product) {
      setFormData((prev) => {
        const next = {
          ...prev,
          productCode: product.id,
          productName: product.name,
          spec: product.spec,
        };
        // 板材产品：自动带出材质和板材参数
        if (product.productType === "plate" || (product.id && String(product.id).startsWith("PLT"))) {
          next.orderType = "plate";
          next.material = product.material || product.name || "";
          next.unit = "张";
          next.piecesPerSheet = product.piecesPerSheet ? String(product.piecesPerSheet) : "";
          next.bladeCount = product.bladeCount ? String(product.bladeCount) : "";
          next.surface = "";
        }
        return next;
      });
    }
  };

  // 选择采购单后，自动填充供应商和单号
  const handleOrderSelect = (order: PurchaseOrder | null) => {
    setSelectedOrder(order);
    if (order) {
      const ot = (order.orderType || "profile") as "profile" | "plate";
      setFormData((prev) => ({
        ...prev,
        orderType: ot,
        referenceNo: order.orderNo,
        supplierName: order.supplierName,
        unit: ot === "plate" ? "张" : prev.unit,
        surface: ot === "plate" ? "" : prev.surface,
      }));
    }
  };

  // 点击采购单中的某行产品，自动填充产品信息
  const handleOrderItemClick = (item: any) => {
    const plateItem = (selectedOrder?.orderType === "plate") ||
      (item.piecesPerSheet !== undefined && item.piecesPerSheet !== null);
    setFormData((prev) => ({
      ...prev,
      orderType: plateItem ? "plate" : "profile",
      productCode: item.productCode,
      productName: item.productName,
      spec: item.spec,
      surface: plateItem ? "" : item.surfaceTreatment,
      material: plateItem ? (item.material || "") : prev.material,
      quantity: plateItem
        ? String(item.sheetsCount || item.quantity || "")
        : String(item.quantity),
      unit: plateItem ? "张" : item.unit,
      piecesPerSheet: plateItem && item.piecesPerSheet ? String(item.piecesPerSheet) : "",
      actualOutput: plateItem && item.actualOutput ? String(item.actualOutput) : "",
      bladeCount: plateItem
        ? String((item.bladeCount || 0) * (item.sheetsCount || 0))
        : "",
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

    const plateExtra = isPlate
      ? {
          orderType: "plate" as const,
          surface: "",
          material: formData.material,
          piecesPerSheet: formData.piecesPerSheet ? Number(formData.piecesPerSheet) : undefined,
          actualOutput: formData.actualOutput ? Number(formData.actualOutput) : undefined,
          bladeCount: formData.bladeCount ? Number(formData.bladeCount) : undefined,
        }
      : { orderType: "profile" as const, surface: formData.surface, material: "" };

    if (editingRecord) {
      newRecords = records.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              ...plateExtra,
              productCode: formData.productCode,
              productName: formData.productName,
              spec: formData.spec,
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
        quantity: qty,
        unit: formData.unit,
        supplierName: formData.supplierName,
        referenceNo: formData.referenceNo,
        operator: formData.operator,
        remark: formData.remark,
        createdAt: new Date().toISOString(),
        ...plateExtra,
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
      const rType = r.orderType || "profile";
      const groupKey = rType === "plate"
        ? `${r.productCode}-${r.spec}-plate-${r.material || ""}`
        : `${r.productCode}-${r.spec}-${r.surface}`;
      if (!map.has(groupKey)) {
        map.set(groupKey, {
          productCode: r.productCode,
          productName: r.productName,
          spec: r.spec,
          surface: r.surface,
          material: r.material || "",
          unit: r.unit,
          inboundQty: 0,
          outboundQty: 0,
          currentQty: 0,
        });
      }
      const summary = map.get(groupKey)!;
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
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {formType === "inbound" ? "入库单" : "出库单"}
              {isPlate && (
                <span className="text-sm px-2 py-0.5 bg-orange-100 text-orange-700 rounded">板材</span>
              )}
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
                    <thead className={selectedOrder.orderType === "plate" ? "bg-orange-100" : "bg-blue-100"}>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">产品编号</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">规格</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800">
                          {selectedOrder.orderType === "plate" ? "材质" : "表面处理"}
                        </th>
                        {selectedOrder.orderType === "plate" ? (
                          <>
                            <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">订单数量</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">张数</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">实际数量</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">刀数</th>
                          </>
                        ) : (
                          <>
                            <th className="px-3 py-2 text-right text-xs font-medium text-blue-800">数量</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-blue-800">单位</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {selectedOrder.items.map((item: any) => (
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
                          <td className="px-3 py-2 text-xs text-slate-600">{item.spec}</td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {selectedOrder.orderType === "plate" ? (item.material || "-") : item.surfaceTreatment}
                          </td>
                          {selectedOrder.orderType === "plate" ? (
                            <>
                              <td className="px-3 py-2 text-xs text-right text-slate-900">{item.quantity}</td>
                              <td className="px-3 py-2 text-xs text-right font-medium text-orange-700">{item.sheetsCount}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-900">{item.actualOutput}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-600">{(item.bladeCount || 0) * (item.sheetsCount || 0)}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 text-xs text-right text-slate-900">{item.quantity}</td>
                              <td className="px-3 py-2 text-xs text-center text-slate-600">{item.unit}</td>
                            </>
                          )}
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
          {/* 类型切换 */}
          <div className="mb-5 flex items-center gap-2">
            <span className="text-sm text-slate-600">类型：</span>
            <button
              type="button"
              onClick={() => switchOrderType("profile")}
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                !isPlate
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              型材
            </button>
            <button
              type="button"
              onClick={() => switchOrderType("plate")}
              className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${
                isPlate
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
              }`}
            >
              板材
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* 产品编号 - 关联产品库搜索 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                产品编号 <span className="text-red-500">*</span>
              </label>
              <ProductSearchSelect
                value={productSearchKey}
                onChange={handleProductSelect}
                placeholder={isPlate ? "输入板材编号/名称搜索" : "输入编号/名称搜索产品库"}
                productType={isPlate ? "plate" : "profile"}
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
            {/* 表面处理 - 下拉选择（型材）；材质（板材） */}
            {isPlate ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  材质
                </label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-orange-50"
                  placeholder="如 5052、普通铝板"
                />
              </div>
            ) : (
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
            )}
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
                {isPlate ? "数量（张）" : "数量"} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 text-sm ${
                  isPlate ? "focus:ring-orange-500" : "focus:ring-blue-500"
                }`}
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
                className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 text-sm ${
                  isPlate ? "focus:ring-orange-500" : "focus:ring-blue-500"
                }`}
              >
                {isPlate ? (
                  <>
                    <option value="张">张</option>
                    <option value="件">件</option>
                    <option value="kg">kg</option>
                  </>
                ) : (
                  <>
                    <option value="条">条</option>
                    <option value="支">支</option>
                    <option value="根">根</option>
                    <option value="件">件</option>
                    <option value="kg">kg</option>
                  </>
                )}
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
                <option value="" disabled>-- 选择采购单 --</option>
                {purchaseOrderStore.getAll().map(o => (
                  <option key={o.orderNo} value={o.orderNo} />
                ))}
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
          {/* 板材参数只读信息 */}
          {isPlate && (
            <div className="mt-6 grid grid-cols-3 gap-4 bg-orange-50 border border-orange-200 rounded-md p-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">单张数量</label>
                <div className="text-sm font-mono text-slate-900">{formData.piecesPerSheet || "-"}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">实际数量</label>
                <div className="text-sm font-mono text-slate-900">{formData.actualOutput || "-"}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">总刀数</label>
                <div className="text-sm font-mono text-slate-900">{formData.bladeCount || "-"}</div>
              </div>
            </div>
          )}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">材质/表面处理</th>
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
                    <td className="px-4 py-3 text-sm text-slate-900 font-mono">{item.productCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.spec}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.material || item.surface || "-"}
                    </td>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">材质/表面</th>
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
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-400">
                    暂无记录
                  </td>
                </tr>
              ) : (
                records
                  .filter((r) => r.type === activeTab)
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900 font-mono">{record.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{record.productCode}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.productName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{record.spec}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {record.orderType === "plate"
                          ? (record.material || <span className="text-slate-300">-</span>)
                          : (record.surface || <span className="text-slate-300">-</span>)}
                      </td>
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
