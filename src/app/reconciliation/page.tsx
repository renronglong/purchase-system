"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  reconciliationStore, deliveryCustomerStore, deliveryNoteStore, previewReconciliationOrderNo,
  type ReconciliationOrder, type ReconciliationItem, type DeliveryNote,
} from "@/lib/store";

function genItemId(): string { return Math.random().toString(36).slice(2, 10); }

function emptyItem(): ReconciliationItem {
  return { id: genItemId(), deliveryNoteNo: "", deliveryDate: "", materialCode: "", productName: "", spec: "", surface: "", unit: "", qty: 0, unitPrice: 0, amount: 0 };
}

export default function ReconciliationPage() {
  const [orders, setOrders] = useState<ReconciliationOrder[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState("");
  const [customer, setCustomer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("草稿");
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<ReconciliationItem[]>([]);

  const customers = deliveryCustomerStore.getAll();

  const loadOrders = useCallback(() => {
    let list = reconciliationStore.getAll();
    if (searchCustomer) list = list.filter(o => o.customer.includes(searchCustomer));
    if (searchStatus) list = list.filter(o => o.status === searchStatus);
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setOrders(list);
  }, [searchCustomer, searchStatus]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const resetForm = () => {
    setEditId(null);
    setOrderNo("");
    setCustomer("");
    setStartDate("");
    setEndDate("");
    setStatus("草稿");
    setRemark("");
    setItems([]);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (order: ReconciliationOrder) => {
    setEditId(order.id);
    setOrderNo(order.orderNo);
    setCustomer(order.customer);
    setStartDate(order.startDate);
    setEndDate(order.endDate);
    setStatus(order.status);
    setRemark(order.remark);
    setItems(order.items.length > 0 ? order.items : []);
    setShowForm(true);
  };

  // 拉取明细：从该客户在日期范围内的送货单中提取明细
  const fetchItems = () => {
    if (!customer || !startDate || !endDate) {
      alert("请先选择客户和日期范围");
      return;
    }
    const notes = deliveryNoteStore.getAll().filter((n: DeliveryNote) => {
      return n.customer === customer && n.date >= startDate && n.date <= endDate;
    });
    const fetched: ReconciliationItem[] = [];
    for (const note of notes) {
      for (const di of note.items) {
        fetched.push({
          id: genItemId(),
          deliveryNoteNo: note.noteNo,
          deliveryDate: note.date,
          materialCode: di.materialCode,
          productName: di.productName,
          spec: di.spec,
          surface: di.surface,
          unit: di.unit,
          qty: di.qty,
          unitPrice: di.unitPrice,
          amount: di.amount,
        });
      }
    }
    fetched.sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));
    setItems(fetched);
  };

  const updateItem = (idx: number, field: keyof ReconciliationItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        item.amount = Math.round(item.qty * item.unitPrice * 100) / 100;
      }
      next[idx] = item;
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => { if (items.length <= 1) return; setItems(prev => prev.filter((_, i) => i !== idx)); };

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalAmount = items.reduce((s, i) => s + i.amount, 0);

  const handleSave = () => {
    if (!customer) { alert("请选择客户"); return; }
    if (!startDate || !endDate) { alert("请选择日期范围"); return; }
    const data = { customer, startDate, endDate, status, remark, items, totalQty, totalAmount };
    if (editId) {
      reconciliationStore.update(editId, data);
    } else {
      reconciliationStore.add(data);
    }
    setShowForm(false);
    resetForm();
    loadOrders();
  };

  const handleDelete = (id: string) => {
    if (!confirm("确定删除此对帐单？")) return;
    reconciliationStore.remove(id);
    loadOrders();
  };

  // 金额转大写
  const amountToChinese = (n: number): string => {
    if (n === 0) return "零元整";
    const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    const units = ["", "拾", "佰", "仟"];
    const bigUnits = ["", "万", "亿"];
    const intPart = Math.floor(n);
    const decPart = Math.round((n - intPart) * 100);
    const jiao = Math.floor(decPart / 10);
    const fen = decPart % 10;
    let result = "";
    let str = intPart.toString();
    let zeroFlag = false;
    for (let i = 0; i < str.length; i++) {
      const d = parseInt(str[i]);
      const pos = str.length - 1 - i;
      const unitIdx = pos % 4;
      const bigIdx = Math.floor(pos / 4);
      if (d === 0) {
        zeroFlag = true;
        if (unitIdx === 0 && bigUnits[bigIdx]) { result += bigUnits[bigIdx]; zeroFlag = false; }
      } else {
        if (zeroFlag) { result += "零"; zeroFlag = false; }
        result += digits[d] + units[unitIdx];
        if (unitIdx === 0 && bigUnits[bigIdx]) result += bigUnits[bigIdx];
      }
    }
    result += "元";
    if (jiao === 0 && fen === 0) { result += "整"; }
    else {
      if (jiao > 0) result += digits[jiao] + "角";
      else if (fen > 0) result += "零";
      if (fen > 0) result += digits[fen] + "分";
    }
    return result;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-slate-800">对帐单管理</h1>
        <button onClick={openCreate} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">新建对帐单</button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-4 mb-4">
        <input type="text" value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)} placeholder="搜索客户" className="px-3 py-1.5 text-sm border border-slate-200 rounded-md w-48" />
        <select value={searchStatus} onChange={e => setSearchStatus(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md">
          <option value="">全部状态</option>
          <option value="草稿">草稿</option>
          <option value="已确认">已确认</option>
          <option value="已结清">已结清</option>
        </select>
      </div>

      {/* 列表 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-left font-medium text-slate-600">对帐单编号</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">客户名称</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">日期范围</th>
              <th className="px-3 py-2 text-right font-medium text-slate-600">总金额</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">状态</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">创建时间</th>
              <th className="px-3 py-2 text-left font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">暂无对帐单数据</td></tr>
            )}
            {orders.map(order => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2 font-mono text-xs">{order.orderNo}</td>
                <td className="px-3 py-2">{order.customer}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{order.startDate} ~ {order.endDate}</td>
                <td className="px-3 py-2 text-right font-mono">{order.totalAmount.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${order.status === "已结清" ? "bg-green-100 text-green-700" : order.status === "已确认" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">{order.createdAt?.slice(0, 16).replace("T", " ")}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(order)} className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded">编辑</button>
                    <Link href={`/print/reconciliation/${order.id}`} target="_blank" className="px-2 py-0.5 text-xs text-green-600 hover:bg-green-50 rounded">打印</Link>
                    <button onClick={() => handleDelete(order.id)} className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建/编辑表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold">{editId ? "编辑对帐单" : "新建对帐单"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">对帐单编号</label>
                  <input type="text" value={editId ? orderNo : previewReconciliationOrderNo()} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">客户 <span className="text-red-500">*</span></label>
                  <input type="text" value={customer} onChange={e => setCustomer(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="客户名称" list="reconciliation-customer-list" />
                  <datalist id="reconciliation-customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">起始日期 <span className="text-red-500">*</span></label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">截止日期 <span className="text-red-500">*</span></label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                </div>
              </div>

              <div className="flex items-end gap-3">
                <button onClick={fetchItems} className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">拉取明细</button>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">状态</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                    <option value="草稿">草稿</option>
                    <option value="已确认">已确认</option>
                    <option value="已结清">已结清</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">备注</label>
                  <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="备注" />
                </div>
              </div>

              {/* 明细表格 */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-2 py-2 font-medium text-slate-600 w-8">序号</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-24">送货单号</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-20">送货日期</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-24">物料编号</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-24">产品名称</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-24">规格</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-16">表面处理</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-10">单位</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-16">数量</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-16">单价</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-20">金额</th>
                      <th className="px-2 py-2 font-medium text-slate-600 w-10">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr><td colSpan={12} className="px-2 py-6 text-center text-slate-400">请选择客户和日期范围后点击"拉取明细"，或手动添加</td></tr>
                    )}
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                        <td className="px-2 py-1"><input type="text" value={item.deliveryNoteNo} onChange={e => updateItem(idx, "deliveryNoteNo", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="date" value={item.deliveryDate} onChange={e => updateItem(idx, "deliveryDate", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="text" value={item.materialCode} onChange={e => updateItem(idx, "materialCode", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="text" value={item.productName} onChange={e => updateItem(idx, "productName", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="text" value={item.spec} onChange={e => updateItem(idx, "spec", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="text" value={item.surface} onChange={e => updateItem(idx, "surface", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="text" value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                        <td className="px-2 py-1"><input type="number" value={item.qty || ""} onChange={e => updateItem(idx, "qty", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded text-right" /></td>
                        <td className="px-2 py-1"><input type="number" step="0.01" value={item.unitPrice || ""} onChange={e => updateItem(idx, "unitPrice", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded text-right" /></td>
                        <td className="px-2 py-1 text-right font-mono">{item.amount.toFixed(2)}</td>
                        <td className="px-2 py-1 text-center"><button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 text-xs">删除</button></td>
                      </tr>
                    ))}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-50 border-t border-slate-300 font-medium">
                        <td colSpan={8} className="px-2 py-2 text-right text-xs">合计</td>
                        <td className="px-2 py-2 text-right font-mono text-xs">{totalQty}</td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 text-right font-mono text-xs text-blue-700">{totalAmount.toFixed(2)}</td>
                        <td className="px-2 py-2"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              <button onClick={addItem} className="px-3 py-1 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50">+ 添加明细行</button>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
              <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
