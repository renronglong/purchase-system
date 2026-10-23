"use client";

import { useParams } from "next/navigation";
import { quotationStore } from "@/lib/store";

export default function QuotationPrintPage() {
  const params = useParams<{ id: string }>();
  const q = quotationStore.getById(params.id);

  if (!q) {
    return <div className="p-6 text-center text-slate-400 py-24">未找到此报价单</div>;
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="max-w-[980px] mx-auto flex justify-end mb-4 no-print">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">打印</button>
      </div>

      <div className="bg-white max-w-[980px] mx-auto p-8 shadow-sm" id="print-area">
        {/* 顶部公司名 + 标题 */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold tracking-widest text-slate-900">{q.supplierCompany}</div>
          <div className="mt-2 text-2xl font-semibold tracking-[0.5em] text-slate-900">报 价 单</div>
        </div>

        {/* 供需双方 */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div><span className="text-slate-500">供方：</span><span className="font-medium">{q.supplierCompany}</span></div>
            <div className="mt-1"><span className="text-slate-500">联系人：</span>{q.supplierContact}</div>
            <div><span className="text-slate-500">电话：</span>{q.supplierPhone}</div>
            <div><span className="text-slate-500">地址：</span>{q.supplierAddress}</div>
          </div>
          <div>
            <div><span className="text-slate-500">客户名称：</span><span className="font-medium">{q.customerName}</span></div>
            <div className="mt-1"><span className="text-slate-500">联系人：</span>{q.customerContact}</div>
            <div><span className="text-slate-500">电话：</span>{q.customerPhone}</div>
            <div><span className="text-slate-500">地址：</span>{q.customerAddress}</div>
          </div>
        </div>

        {/* 编号 + 日期 */}
        <div className="flex justify-between text-sm mb-4">
          <div><span className="text-slate-500">报价单编号：</span><span className="font-mono font-semibold">{q.quoteNo}</span></div>
          <div><span className="text-slate-500">报价日期：</span>{q.quoteDate}</div>
        </div>

        {/* 报价明细表 */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-center w-8">序号</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">产品编号</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">规格尺寸mm</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">产品名称</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">单位</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">材质</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">表面处理</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">单价未税(元)</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">含税价</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">最小起订量</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">模具费(元)</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">备注</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.productCode}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.spec}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.productName}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.unit}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.material}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.surfaceTreatment}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.unitPrice ? it.unitPrice.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.taxPrice ? it.taxPrice.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.minOrderQty || ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.moldFee ? it.moldFee.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.remark}</td>
              </tr>
            ))}
            {/* 空行填充 */}
            {q.items.length < 6 && Array.from({ length: 6 - q.items.length }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
              </tr>
            ))}
            <tr>
              <td colSpan={7} className="border border-slate-400 px-2 py-1.5 text-right font-medium text-slate-700">总计</td>
              <td className="border border-slate-400 px-2 py-1.5 text-right font-semibold">{(q.grandTotal || 0).toFixed(2)}</td>
              <td colSpan={4} className="border border-slate-400 py-1.5"></td>
            </tr>
          </tbody>
        </table>

        {/* 条款 */}
        <div className="text-sm mb-8 leading-6 text-slate-800">
          {q.terms.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>

        {/* 签章 */}
        <div className="flex justify-between text-sm mt-4">
          <div>
            <div className="font-medium mb-10">需方（签章）</div>
            <div className="border-t border-slate-800 pt-1">日期：</div>
          </div>
          <div>
            <div className="font-medium mb-10">供方（签章）</div>
            <div className="border-t border-slate-800 pt-1">日期：</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}