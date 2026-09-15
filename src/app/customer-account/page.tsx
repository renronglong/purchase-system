"use client";

import { useState, useEffect, useCallback } from "react";
import { customerAccountStore, type CustomerAccountRecord } from "@/lib/store";
import { deliveryCustomerStore } from "@/lib/store";

export default function CustomerAccountPage() {
  const [records, setRecords] = useState<CustomerAccountRecord[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [customer, setCustomer] = useState("");
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState(0);
  const [remark, setRemark] = useState("");
  const [relatedOrderNo, setRelatedOrderNo] = useState("");

  const customers = deliveryCustomerStore.getAll();
  const accountCustomers = customerAccountStore.getCustomers();
  const allCustomers = Array.from(new Set([...customers.map(c => c.name), ...accountCustomers]));

  const load = useCallback(() => {
    const all = customerAccountStore.getAll();
    all.sort((a, b) => b.date.localeCompare(a.date));
    setRecords(all);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = records.filter(r => {
    if (searchCustomer && !r.customer.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
    if (searchDate && !r.date.includes(searchDate)) return false;
    return true;
  });

  const openNew = () => {
    setEditId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setCustomer("");
    setType('income');
    setAmount(0);
    setRemark("");
    setRelatedOrderNo("");
    setShowForm(true);
  };

  const openEdit = (record: CustomerAccountRecord) => {
    setEditId(record.id);
    setDate(record.date);
    setCustomer(record.customer);
    setType(record.type);
    setAmount(record.amount);
    setRemark(record.remark);
    setRelatedOrderNo(record.relatedOrderNo || "");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!customer) { alert("请填写客户名称"); return; }
    if (amount <= 0) { alert("请填写金额"); return; }
    
    const data = { date, customer, type, amount, remark, relatedOrderNo };
    if (editId) {
      customerAccountStore.update(editId, data);
    } else {
      customerAccountStore.add(data);
    }
    setShowForm(false);
    load();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此记录吗？")) {
      customerAccountStore.remove(id);
      load();
    }
  };

  // 计算每个客户的结余
  const customerBalances: Record<string, number> = {};
  allCustomers.forEach(c => {
    customerBalances[c] = customerAccountStore.getBalance(c);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">客户往来记录</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          新增记录
        </button>
      </div>

      {/* 客户结余概览 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <h3 className="text-sm font-medium text-slate-700 mb-3">客户结余概览</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {allCustomers.filter(c => customerBalances[c] !== 0).map(c => (
            <div key={c} className="bg-slate-50 rounded-md p-3">
              <div className="text-xs text-slate-500 truncate">{c}</div>
              <div className={`text-sm font-bold font-mono ${customerBalances[c] > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {customerBalances[c].toFixed(2)}
              </div>
            </div>
          ))}
          {allCustomers.filter(c => customerBalances[c] !== 0).length === 0 && (
            <div className="text-sm text-slate-400 col-span-full">暂无往来记录</div>
          )}
        </div>
      </div>

      {/* 表单 */}
      {showForm && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{editId ? "编辑记录" : "新增记录"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-xs text-slate-500 mb-1">日期</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">客户/供应商 <span className="text-red-500">*</span></label>
              <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="客户名称" list="account-customer-list" />
              <datalist id="account-customer-list">{allCustomers.map(c => <option key={c} value={c} />)}</datalist></div>
            <div><label className="block text-xs text-slate-500 mb-1">类型</label>
              <select value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select></div>
            <div><label className="block text-xs text-slate-500 mb-1">金额 <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="0.00" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">关联订单号</label>
              <input type="text" value={relatedOrderNo} onChange={(e) => setRelatedOrderNo(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="选填" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">备注</label>
              <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="选填" /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
          </div>
        </div>
      )}

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex gap-4 flex-wrap items-center">
          <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="搜索客户" className="flex-1 min-w-[180px] px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="w-40 px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">日期</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">客户/供应商</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">类型</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">金额</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">关联订单</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">备注</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">暂无记录</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5">{r.date}</td>
                <td className="px-4 py-2.5">{r.customer}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${r.type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                    {r.type === 'income' ? '收入' : '支出'}
                  </span>
                </td>
                <td className={`px-4 py-2.5 text-right font-mono font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {r.type === 'income' ? '+' : '-'}{r.amount.toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{r.relatedOrderNo || '-'}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{r.remark || '-'}</td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(r)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">
        共 {filtered.length} 条记录
      </div>
    </div>
  );
}
