"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { deliveryNoteStore, type DeliveryNote } from "@/lib/store";

export default function PrintDeliveryPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DeliveryNote | null>(null);

  const load = useCallback(() => {
    const found = deliveryNoteStore.getById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const totalAmount = order.items.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: 241mm 140mm; margin: 4mm 6mm; }
          html, body { width: 241mm; height: 140mm; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 6mm; top: 4mm; width: 229mm; }
          .no-print { display: none !important; }
        }
        @media screen {
          body { background: #e2e8f0; }
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      <div id="print-area" className="mx-auto bg-white" style={{ width: "229mm", minHeight: "132mm", padding: "0" }}>
        {/* 标题行 */}
        <div className="flex items-center justify-between border-b border-black pb-1 mb-1.5">
          <h1 className="font-bold" style={{ fontSize: "14px" }}>{order.company}</h1>
          <h2 className="font-bold" style={{ fontSize: "14px" }}>送 货 单</h2>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mb-1.5 border-b border-black pb-1.5" style={{ fontSize: "11px" }}>
          <div className="flex"><span className="font-medium" style={{ width: "56px" }}>单号：</span><span className="font-mono">{order.noteNo}</span></div>
          <div className="flex"><span className="font-medium" style={{ width: "56px" }}>日期：</span><span>{order.date}</span></div>
          <div className="flex"><span className="font-medium" style={{ width: "56px" }}>客户：</span><span>{order.customer}</span></div>
          {order.orderNo && <div className="flex"><span className="font-medium" style={{ width: "56px" }}>订单号：</span><span>{order.orderNo}</span></div>}
        </div>

        {/* 明细表格 */}
        <table className="w-full border-collapse mb-2" style={{ fontSize: "10px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "8mm" }} />
            <col style={{ width: "28mm" }} />
            <col style={{ width: "45mm" }} />
            <col style={{ width: "22mm" }} />
            <col style={{ width: "12mm" }} />
            <col style={{ width: "14mm" }} />
            <col style={{ width: "16mm" }} />
            <col style={{ width: "18mm" }} />
            <col style={{ width: "66mm" }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border border-black px-0.5 py-1 font-medium text-center">序号</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">物料编号</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">规格</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">表面处理</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">单位</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">数量</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">单价</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">金额</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-black px-0.5 py-0.5 text-center">{idx + 1}</td>
                <td className="border border-black px-0.5 py-0.5 font-mono" style={{ wordBreak: "break-all" }}>{item.materialCode}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.spec}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.surface}</td>
                <td className="border border-black px-0.5 py-0.5 text-center">{item.unit}</td>
                <td className="border border-black px-0.5 py-0.5 text-right">{item.qty}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.amount.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={5} className="border border-black px-0.5 py-1 text-right">合计</td>
              <td className="border border-black px-0.5 py-1"></td>
              <td className="border border-black px-0.5 py-1 text-right font-mono">{totalAmount.toFixed(2)}</td>
              <td className="border border-black px-0.5 py-1"></td>
            </tr>
          </tfoot>
        </table>

        {/* 签字栏 */}
        <div className="flex justify-between items-end" style={{ fontSize: "11px", marginTop: "8px" }}>
          <div>
            <span className="font-medium">制单人：</span>
            <span className="inline-block border-b border-black" style={{ width: "60px" }}>&nbsp;</span>
          </div>
          <div>
            <span className="font-medium">客户签收：</span>
            <span className="inline-block border-b border-black" style={{ width: "60px" }}>&nbsp;</span>
          </div>
        </div>
      </div>
    </>
  );
}
