"use client";

import { useState, useEffect, useCallback } from "react";
import { contractSeedData, type ContractData } from "@/lib/contract-seed-data";

export default function ContractPage() {
  const [contracts, setContracts] = useState<ContractData[]>([]);

  const load = useCallback(() => {
    const all = [...contractSeedData];
    all.sort((a, b) => b.id.localeCompare(a.id));
    setContracts(all);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAmount = (c: ContractData) =>
    c.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">购销合同管理</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">合同编号</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">需方（甲方）</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">供方（乙方）</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">签订日期</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">产品数</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">合同金额</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">暂无合同数据</td>
              </tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{c.contractNo}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.customerName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.supplierName}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.signDate}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{c.items.length} 项</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">
                    ¥{totalAmount(c).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <a
                      href={`/print/contract/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      打印预览
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
