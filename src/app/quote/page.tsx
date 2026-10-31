"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { quotationStore, type Quotation } from "@/lib/store";

export default function QuotationListPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    const all = quotationStore.getAll();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setQuotes(all);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = quotes.filter(q =>
    q.customerName.toLowerCase().includes(search.toLowerCase()) ||
    q.quoteNo.toLowerCase().includes(search.toLowerCase()) ||
    q.supplierCompany.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此报价单吗？")) {
      quotationStore.remove(id);
      load();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">报价单管理</h1>
        <Link href="/quote/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新建报价单
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索客户名称、报价单号、供方公司..."
          className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">报价单编号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">客户名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">供方公司</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">报价日期</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">明细数</th>
              <th className="sticky right-0 z-10 bg-slate-50 text-center px-4 py-2.5 font-medium text-slate-600 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">暂无报价单数据</td></tr>
            ) : (
              filtered.map(q => (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono text-blue-600">{q.quoteNo}</td>
                  <td className="px-4 py-2">{q.customerName}</td>
                  <td className="px-4 py-2">{q.supplierCompany}</td>
                  <td className="px-4 py-2">{q.quoteDate}</td>
                  <td className="px-4 py-2 text-right font-mono">{q.items.length}</td>
                  <td className="sticky right-0 z-10 bg-white px-4 py-2.5 text-center shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/quote/${q.id}`} className="text-blue-600 hover:text-blue-800 text-xs">编辑</Link>
                      <Link href={`/quote/${q.id}/print`} className="text-orange-600 hover:text-orange-800 text-xs">打印</Link>
                      <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">共 {filtered.length} 条报价单记录</div>
    </div>
  );
}