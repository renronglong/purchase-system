"use client";

import { useState, useEffect, useCallback } from "react";
import { customerAccountStore, type CustomerAccountRecord } from "@/lib/store";
import { deliveryCustomerStore } from "@/lib/store";

export default function CustomerAccountPage() {
  const [records, setRecords] = useState<CustomerAccountRecord[]>([]);
  const [searchCustomer, setSearchCustomer] = useState("");

  // 明细弹窗
  const [detailCustomer, setDetailCustomer] = useState<string | null>(null);

  // 录入表单
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
    setRecords(customerAccountStore.getAll());
  }, []);
  useEffect(() => { load(); }, [load]);

  // ---------- 汇总计算：按客户聚合 ----------
  const summary = allCustomers
    .map(c => {
      const recs = records.filter(r => r.customer === c);
      const income = recs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
      const expense = recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
      const balance = income - expense;
      const lastDate = recs.length ? recs.map(r => r.date).sort((a, b) => b.localeCompare(a))[0] : "";
      return { customer: c, income, expense, balance, count: recs.length, lastDate };
    })
    .filter(s => s.count > 0 && (!searchCustomer || s.customer.toLowerCase().includes(searchCustomer.toLowerCase())))
    .sort((a, b) => a.customer.localeCompare(b.customer));

  const totalIncome = summary.reduce((s, x) => s + x.income, 0);
  const totalExpense = summary.reduce((s, x) => s + x.expense, 0);
  const netBalance = totalIncome - totalExpense;

  // ---------- 录入 ----------
  const openNew = (presetCustomer?: string) => {
    setEditId(null);
    setDate(new Date().toISOString().slice(0, 10));
    setCustomer(presetCustomer || "");
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
    const existingCustomers = deliveryCustomerStore.getAll();
    if (!existingCustomers.find(c => c.name === customer)) {
      deliveryCustomerStore.add({ name: customer, address: "", contact: "", phone: "", taxNo: "", legalPerson: "", email: "", paymentTerms: "" });
    }
    const data = { date, customer, type, amount, remark, relatedOrderNo };
    if (editId) {
      customerAccountStore.update(editId, data);
    } else {
      customerAccountStore.add(data);
    }
    setShowForm(false);
    load();
  };

  const handleDeleteCustomer = (name: string) => {
    if (confirm(`确定要删除客户「${name}」的全部往来记录吗？`)) {
      customerAccountStore.getAll().filter(r => r.customer === name).forEach(r => customerAccountStore.remove(r.id));
      load();
      setDetailCustomer(null);
    }
  };

  const detailRecords = detailCustomer
    ? records.filter(r => r.customer === detailCustomer).sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">客户往来记录</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          新增记录
        </button>
      </div>

      {/* 汇总概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">应收合计（收入）</div>
          <div className="text-2xl font-bold font-mono text-emerald-600">¥{totalIncome.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">应付合计（支出）</div>
          <div className="text-2xl font-bold font-mono text-red-600">¥{totalExpense.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-xs text-slate-500 mb-1">净结余</div>
          <div className={`text-2xl font-bold font-mono ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>¥{netBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input type="text" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} placeholder="搜索客户名称" className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>

      {/* 汇总表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">客户名称</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">应收（收入）</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">应付（支出）</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">结余</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">笔数</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">最近往来日期</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {summary.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">暂无往来记录</td></tr>
            ) : summary.map(s => (
              <tr key={s.customer} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium">{s.customer}</td>
                <td className="px-4 py-2.5 text-right font-mono text-emerald-600">{s.income.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-red-600">{s.expense.toFixed(2)}</td>
                <td className={`px-4 py-2.5 text-right font-mono font-semibold ${s.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{s.balance.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-center font-mono text-slate-500">{s.count}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{s.lastDate || '-'}</td>
                <td className="px-4 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setDetailCustomer(s.customer)} className="text-blue-600 hover:text-blue-800 text-xs">明细</button>
                    <button onClick={() => handleDeleteCustomer(s.customer)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">共 {summary.length} 个客户有往来记录</div>

      {/* 录入表单 */}
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

      {/* 明细弹窗 */}
      {detailCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">{detailCustomer}</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  {(() => {
                    const recs = records.filter(r => r.customer === detailCustomer);
                    const inc = recs.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
                    const exp = recs.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
                    return `应收 ¥${inc.toFixed(2)} · 应付 ¥${exp.toFixed(2)} · 结余 ¥${(inc - exp).toFixed(2)} · 共 ${recs.length} 笔`;
                  })()}
                </div>
              </div>
              <button onClick={() => setDetailCustomer(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-medium text-slate-600">日期</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">类型</th>
                    <th className="text-right px-3 py-2 font-medium text-slate-600">金额</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">关联订单</th>
                    <th className="text-left px-3 py-2 font-medium text-slate-600">备注</th>
                    <th className="text-center px-3 py-2 font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {detailRecords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-400">无记录</td></tr>
                  ) : detailRecords.map(r => (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">{r.date}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${r.type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                          {r.type === 'income' ? '收入' : '支出'}
                        </span>
                      </td>
                      <td className={`px-3 py-2 text-right font-mono font-medium ${r.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {r.type === 'income' ? '+' : '-'}{r.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500">{r.relatedOrderNo || '-'}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{r.remark || '-'}</td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => { openEdit(r); setDetailCustomer(null); }} className="text-amber-600 hover:text-amber-800 text-xs mr-2">编辑</button>
                        <button onClick={() => {
                          if (confirm('确定删除此记录吗？')) { customerAccountStore.remove(r.id); load(); }
                        }} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-200 flex justify-end">
              <button onClick={() => { setDetailCustomer(null); openNew(detailCustomer); }} className="px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">为此客户新增记录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}