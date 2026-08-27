"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  deliveryNoteStore, deliveryCustomerStore, deliveryProductStore, previewDeliveryOrderNo,
  type DeliveryNote, type DeliveryNoteItem,
} from "@/lib/store";
import { deliveryCompanies } from "@/lib/delivery-seed-data";

function genItemId(): string { return Math.random().toString(36).slice(2, 10); }

function emptyItem(): DeliveryNoteItem {
  return { id: genItemId(), productCode: "", productName: "", spec: "", surface: "", unit: "", quantity: 0, length: 0, weightPerMeter: 0, weight: 0, unitPrice: 0, amount: 0, remark: "" };
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<DeliveryNote[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState("");
  const [company, setCompany] = useState(deliveryCompanies[0]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<DeliveryNoteItem[]>([emptyItem()]);
  const [remark, setRemark] = useState("");

  const customers = deliveryCustomerStore.getAll();

  const load = useCallback(() => {
    const all = deliveryNoteStore.getAll();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setOrders(all);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    if (searchCustomer && !o.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
    if (searchDate && !o.orderDate.includes(searchDate)) return false;
    if (searchStatus && o.reconcileStatus !== searchStatus) return false;
    return true;
  });

  const openNew = () => {
    setEditId(null);
    setOrderNo(previewDeliveryOrderNo());
    setCompany(deliveryCompanies[0]);
    setCustomerId(""); setCustomerName(""); setCustomerAddress(""); setCustomerContact(""); setCustomerPhone("");
    setOrderDate(new Date().toISOString().slice(0, 10));
    setItems([emptyItem()]); setRemark("");
    setShowForm(true);
  };

  const openEdit = (order: DeliveryNote) => {
    setEditId(order.id);
    setOrderNo(order.orderNo);
    setCompany(order.company);
    setCustomerId(order.customerId);
    setCustomerName(order.customerName);
    setCustomerAddress(order.customerAddress);
    setCustomerContact(order.customerContact);
    setCustomerPhone(order.customerPhone);
    setOrderDate(order.orderDate);
    setItems(order.items.length > 0 ? order.items : [emptyItem()]);
    setRemark(order.remark);
    setShowForm(true);
  };

  const handleCustomerChange = (cid: string) => {
    setCustomerId(cid);
    const c = customers.find(x => x.id === cid);
    if (c) { setCustomerName(c.name); setCustomerAddress(c.address); setCustomerContact(c.contact); setCustomerPhone(c.phone); }
  };

  const updateItem = (idx: number, field: keyof DeliveryNoteItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      if (field === "productCode" && typeof value === "string") {
        const prod = deliveryProductStore.getAll().find(p => p.id === value);
        if (prod) { item.productName = prod.name; item.spec = prod.spec; item.surface = prod.surface; item.unit = prod.unit; item.weightPerMeter = prod.weightPerMeter; item.unitPrice = prod.unitPrice; }
      }
      if (field === "quantity" || field === "length" || field === "productCode") {
        item.weight = item.weightPerMeter * (item.length / 1000) * item.quantity;
        item.amount = item.weight * item.unitPrice;
      }
      if (field === "unitPrice") {
        item.amount = item.weight * (typeof value === "number" ? value : item.unitPrice);
      }
      next[idx] = item;
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => { if (items.length <= 1) return; setItems(prev => prev.filter((_, i) => i !== idx)); };

  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  const totalAmount = items.reduce((s, i) => s + i.amount, 0);

  const handleSave = () => {
    if (!customerName) { alert("请选择客户"); return; }
    const valid = items.filter(i => i.productCode);
    if (valid.length === 0) { alert("请至少添加一条明细"); return; }
    const data = { company, customerId, customerName, customerAddress, customerContact, customerPhone, orderDate, items: valid, totalWeight: Math.round(totalWeight * 1000) / 1000, totalAmount: Math.round(totalAmount * 100) / 100, reconcileStatus: "未对帐", remark };
    if (editId) { deliveryNoteStore.update(editId, data); } else { deliveryNoteStore.add(data); }
    setShowForm(false); load();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此送货单吗？")) { deliveryNoteStore.remove(id); load(); }
  };

  const statusColor = (s: string) => s === "已对帐" ? "text-emerald-600 bg-emerald-50" : s === "部分对帐" ? "text-amber-600 bg-amber-50" : "text-slate-500 bg-slate-100";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">送货单管理</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          新建送货单
        </button>
      </div>

      {/* 新建/编辑表单 */}
      {showForm && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{editId ? "编辑送货单" : "新建送货单"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-xs text-slate-500 mb-1">单号</label>
              <input type="text" value={orderNo} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 font-mono text-blue-600 font-medium" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">发货公司</label>
              <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                {deliveryCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-500 mb-1">日期</label>
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">客户 <span className="text-red-500">*</span></label>
              <select value={customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                <option value="">请选择客户</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></div>
            <div><label className="block text-xs text-slate-500 mb-1">联系人</label>
              <input type="text" value={customerContact} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">电话</label>
              <input type="text" value={customerPhone} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" /></div>
            <div className="col-span-3"><label className="block text-xs text-slate-500 mb-1">地址</label>
              <input type="text" value={customerAddress} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" /></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-2 py-2 font-medium text-slate-600 w-8">序号</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-28">物料编号</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-24">名称</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-20">规格</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-20">表面处理</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-12">单位</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-16">数量</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-16">长度mm</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-20">重量KG</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-16">单价</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-20">金额</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-20">备注</th>
                  <th className="px-2 py-2 font-medium text-slate-600 w-8">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-2 py-1 text-center text-slate-500">{idx + 1}</td>
                    <td className="px-2 py-1"><input type="text" value={item.productCode} onChange={(e) => updateItem(idx, "productCode", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" placeholder="编号" /></td>
                    <td className="px-2 py-1 text-slate-600">{item.productName}</td>
                    <td className="px-2 py-1 text-slate-600">{item.spec}</td>
                    <td className="px-2 py-1 text-slate-600">{item.surface}</td>
                    <td className="px-2 py-1 text-slate-600">{item.unit}</td>
                    <td className="px-2 py-1"><input type="number" value={item.quantity || ""} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                    <td className="px-2 py-1"><input type="number" value={item.length || ""} onChange={(e) => updateItem(idx, "length", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                    <td className="px-2 py-1 text-right font-mono">{item.weight.toFixed(3)}</td>
                    <td className="px-2 py-1"><input type="number" step="0.01" value={item.unitPrice || ""} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                    <td className="px-2 py-1 text-right font-mono font-medium">{item.amount.toFixed(2)}</td>
                    <td className="px-2 py-1"><input type="text" value={item.remark} onChange={(e) => updateItem(idx, "remark", e.target.value)} className="w-full px-1 py-0.5 text-xs border border-slate-200 rounded" /></td>
                    <td className="px-2 py-1 text-center">
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan={8} className="px-2 py-2 text-right font-medium text-slate-600">合计</td>
                  <td className="px-2 py-2 text-right font-mono font-bold">{totalWeight.toFixed(3)}</td>
                  <td></td>
                  <td className="px-2 py-2 text-right font-mono font-bold text-blue-600">{totalAmount.toFixed(2)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-3">
            <label className="block text-xs text-slate-500 mb-1">备注</label>
            <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="备注信息" />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={addItem} className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">+ 添加行</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
          </div>
        </div>
      )}

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex gap-4 flex-wrap">
          <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="搜索客户" className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="w-40 px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          <select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} className="w-32 px-3 py-1.5 text-sm border border-slate-200 rounded-md">
            <option value="">全部状态</option>
            <option value="已对帐">已对帐</option>
            <option value="未对帐">未对帐</option>
            <option value="部分对帐">部分对帐</option>
          </select>
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">单号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">日期</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">发货公司</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">客户</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总重量(KG)</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总金额</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">对帐状态</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">暂无送货单</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-mono text-blue-600">{o.orderNo}</td>
                <td className="px-4 py-2.5">{o.orderDate}</td>
                <td className="px-4 py-2.5">{o.company}</td>
                <td className="px-4 py-2.5">{o.customerName}</td>
                <td className="px-4 py-2.5 text-right font-mono">{o.totalWeight.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono">{o.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-center"><span className={`inline-block px-2 py-0.5 text-xs rounded-full ${statusColor(o.reconcileStatus)}`}>{o.reconcileStatus}</span></td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(o)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                    <Link href={`/print/delivery/${o.id}`} target="_blank" className="text-emerald-600 hover:text-emerald-800 text-xs">打印</Link>
                    <button onClick={() => handleDelete(o.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">共 {filtered.length} 条记录</div>
    </div>
  );
}
