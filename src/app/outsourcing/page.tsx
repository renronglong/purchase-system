"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { outsourcingOrderStore, supplierStore, productStore, previewOutsourcingOrderNo, type OutsourcingOrder, type OutsourcingItem } from "@/lib/store";

function generateItemId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyItem(): OutsourcingItem {
  return {
    id: generateItemId(),
    productCode: "",
    productName: "",
    spec: "",
    quantity: 0,
    unit: "支",
    length: 0,
    process: "",
    weight: 0,
    unitPrice: 0,
    remark: "",
  };
}

export default function OutsourcingPage() {
  const [orders, setOrders] = useState<OutsourcingOrder[]>([]);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // 新建表单状态
  const [showForm, setShowForm] = useState(false);
  const [outsourcingOrderNo, setOutsourcingOrderNo] = useState("");
  const [company, setCompany] = useState("佛山市质稳五金有限公司");
  const [supplierId, setSupplierId] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [contact, setContact] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<OutsourcingItem[]>([createEmptyItem()]);

  const suppliers = supplierStore.getAll();

  const loadOrders = useCallback(() => {
    const all = outsourcingOrderStore.getAll();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setOrders(all);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (searchSupplier && !order.supplierName.toLowerCase().includes(searchSupplier.toLowerCase())) return false;
    if (searchDate && !order.orderDate.includes(searchDate)) return false;
    return true;
  });

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

  const updateItem = (index: number, field: keyof OutsourcingItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      // 自动计算重量
      if (field === "productCode" && typeof value === "string") {
        const product = productStore.getAll().find(p => p.id === value);
        if (product) {
          item.productName = product.name;
          item.spec = product.spec;
          item.weight = (product.weightPerMeter || 0) * (item.length / 1000) * item.quantity;
        }
      }
      if (field === "length" || field === "quantity") {
        const product = productStore.getAll().find(p => p.id === item.productCode);
        if (product) {
          item.weight = (product.weightPerMeter || 0) * (item.length / 1000) * item.quantity;
        }
      }
      next[index] = item;
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, createEmptyItem()]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.weight * item.unitPrice, 0);

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

    outsourcingOrderStore.add({
      company,
      supplierId,
      supplierName,
      contact,
      phone,
      address,
      orderDate,
      items: validItems,
      totalQuantity,
      totalWeight,
      totalPrice,
    });

    setShowForm(false);
    setItems([createEmptyItem()]);
    loadOrders();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此委外加工单吗？")) {
      outsourcingOrderStore.remove(id);
      loadOrders();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">委外加工单管理</h1>
        <button
          onClick={() => { if (!showForm) setOutsourcingOrderNo(previewOutsourcingOrderNo()); setShowForm(!showForm); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新建委外加工单
        </button>
      </div>

      {/* 新建表单 */}
      {showForm && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">新建委外加工单</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">单号</label>
              <input type="text" value={outsourcingOrderNo} readOnly
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 font-mono text-blue-600 font-medium" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">公司</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md"
              >
                <option>佛山市质稳五金有限公司</option>
                <option>佛山市碧利莱照明有限公司</option>
                <option>佛山市碧利金属制品有限公司</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">日期</label>
              <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">供应商 <span className="text-red-500">*</span></label>
              <select value={supplierId} onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                <option value="">请选择</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">联系人</label>
              <input type="text" value={contact} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">电话</label>
              <input type="text" value={phone} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">地址</label>
              <input type="text" value={address} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50" />
            </div>
          </div>

          {/* 明细表格 */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-2 py-2 font-medium text-slate-600">序号</th>
                  <th className="px-2 py-2 font-medium text-slate-600">产品编号</th>
                  <th className="px-2 py-2 font-medium text-slate-600">产品名称</th>
                  <th className="px-2 py-2 font-medium text-slate-600">规格尺寸</th>
                  <th className="px-2 py-2 font-medium text-slate-600">数量</th>
                  <th className="px-2 py-2 font-medium text-slate-600">单位</th>
                  <th className="px-2 py-2 font-medium text-slate-600">长度mm</th>
                  <th className="px-2 py-2 font-medium text-slate-600">工序</th>
                  <th className="px-2 py-2 font-medium text-slate-600">重量KG</th>
                  <th className="px-2 py-2 font-medium text-slate-600">单价</th>
                  <th className="px-2 py-2 font-medium text-slate-600">备注</th>
                  <th className="px-2 py-2 font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-2 py-1 text-center text-slate-500">{index + 1}</td>
                    <td className="px-2 py-1">
                      <input type="text" value={item.productCode}
                        onChange={(e) => updateItem(index, "productCode", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" placeholder="编号" />
                    </td>
                    <td className="px-2 py-1 text-slate-600">{item.productName}</td>
                    <td className="px-2 py-1 text-slate-600">{item.spec}</td>
                    <td className="px-2 py-1">
                      <input type="number" value={item.quantity || ""}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="text" value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="number" value={item.length || ""}
                        onChange={(e) => updateItem(index, "length", Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="text" value={item.process}
                        onChange={(e) => updateItem(index, "process", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" placeholder="工序" />
                    </td>
                    <td className="px-2 py-1 text-right font-mono">{item.weight.toFixed(2)}</td>
                    <td className="px-2 py-1">
                      <input type="number" step="0.01" value={item.unitPrice || ""}
                        onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                    </td>
                    <td className="px-2 py-1">
                      <input type="text" value={item.remark}
                        onChange={(e) => updateItem(index, "remark", e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded" />
                    </td>
                    <td className="px-2 py-1 text-center">
                      <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600">
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
                  <td colSpan={4} className="px-2 py-2 text-right font-medium text-slate-600">合计</td>
                  <td className="px-2 py-2 text-center font-bold">{totalQuantity}</td>
                  <td colSpan={3}></td>
                  <td className="px-2 py-2 text-right font-mono font-bold">{totalWeight.toFixed(2)}</td>
                  <td className="px-2 py-2 text-right font-mono font-bold">{totalPrice.toFixed(2)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-2 mt-3">
            <button onClick={addItem} className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
              + 添加行
            </button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
          </div>
        </div>
      )}

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex gap-4">
          <input type="text" value={searchSupplier} onChange={(e) => setSearchSupplier(e.target.value)}
            placeholder="搜索供应商" className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)}
            className="w-40 px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
        </div>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">单号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">日期</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">公司</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">供应商</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">明细数</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总数量</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总重量(KG)</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总金额</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-slate-400">暂无委外加工单</td></tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono text-blue-600">{order.orderNo}</td>
                  <td className="px-4 py-2.5">{order.orderDate}</td>
                  <td className="px-4 py-2.5">{order.company}</td>
                  <td className="px-4 py-2.5">{order.supplierName}</td>
                  <td className="px-4 py-2.5 text-right">{order.items.length}</td>
                  <td className="px-4 py-2.5 text-right">{order.totalQuantity}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{order.totalWeight.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{order.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">共 {filteredOrders.length} 条记录</div>
    </div>
  );
}
