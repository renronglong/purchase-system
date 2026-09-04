"use client";

import { useState, useEffect, useCallback } from "react";

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
    referenceNo: "",
    operator: "",
    remark: "",
  });

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
      referenceNo: "",
      operator: "",
      remark: "",
    });
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
      referenceNo: record.referenceNo,
      operator: record.operator,
      remark: record.remark,
    });
    setView("form");
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
      // 编辑现有记录
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
              referenceNo: formData.referenceNo,
              operator: formData.operator,
              remark: formData.remark,
            }
          : r
      );
    } else {
      // 新建记录
      const newRecord: InventoryRecord = {
        id: genRecordNo(records, formType),
        type: formType,
        productCode: formData.productCode,
        productName: formData.productName,
        spec: formData.spec,
        surface: formData.surface,
        quantity: qty,
        unit: formData.unit,
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

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                产品编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="如：YL-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                产品名称
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                规格
              </label>
              <input
                type="text"
                value={formData.spec}
                onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                表面处理
              </label>
              <input
                type="text"
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                数量 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                单位
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="条">条</option>
                <option value="支">支</option>
                <option value="根">根</option>
                <option value="件">件</option>
                <option value="kg">kg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                关联单据号
              </label>
              <input
                type="text"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="采购单号或送货单号"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                操作员
              </label>
              <input
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-400">
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
