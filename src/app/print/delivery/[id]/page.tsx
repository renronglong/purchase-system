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
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 15mm; }
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="ml-2 px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      <div id="print-area" className="p-8 max-w-[210mm] mx-auto bg-white">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wider">{order.company}</h1>
          <h2 className="text-xl font-bold mt-2 tracking-wide">送 货 单</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mb-4 border-b border-black pb-3">
          <div className="flex"><span className="font-medium w-20 shrink-0">单号：</span><span className="font-mono">{order.noteNo}</span></div>
          <div className="flex"><span className="font-medium w-20 shrink-0">日期：</span><span>{order.date}</span></div>
          <div className="flex"><span className="font-medium w-20 shrink-0">客户：</span><span>{order.customer}</span></div>
          {order.orderNo && <div className="flex"><span className="font-medium w-20 shrink-0">订单号：</span><span>{order.orderNo}</span></div>}
        </div>

        <table className="w-full text-xs border-collapse mb-4">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border border-black px-1.5 py-1.5 font-medium">序号</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">物料编号</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">产品名称</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">规格</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">表面处理</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">单位</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">数量</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">单价</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">金额</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border border-black px-1.5 py-1 text-center">{idx + 1}</td>
                <td className="border border-black px-1.5 py-1 font-mono">{item.materialCode}</td>
                <td className="border border-black px-1.5 py-1">{item.productName}</td>
                <td className="border border-black px-1.5 py-1">{item.spec}</td>
                <td className="border border-black px-1.5 py-1">{item.surface}</td>
                <td className="border border-black px-1.5 py-1 text-center">{item.unit}</td>
                <td className="border border-black px-1.5 py-1 text-right">{item.qty}</td>
                <td className="border border-black px-1.5 py-1 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-black px-1.5 py-1 text-right font-mono">{item.amount.toFixed(2)}</td>
                <td className="border border-black px-1.5 py-1">{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={6} className="border border-black px-1.5 py-1.5 text-right">合计</td>
              <td className="border border-black px-1.5 py-1.5"></td>
              <td></td>
              <td className="border border-black px-1.5 py-1.5 text-right font-mono">{totalAmount.toFixed(2)}</td>
              <td className="border border-black px-1.5 py-1.5"></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 grid grid-cols-3 gap-8 text-sm">
          <div><p className="font-medium mb-6">制单人：</p><div className="border-b border-black"></div></div>
          <div><p className="font-medium mb-6">客户签收：</p><div className="border-b border-black"></div></div>
          <div><p className="font-medium mb-6">对帐确认：</p><div className="border-b border-black"></div></div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">本送货单一式两份，供需双方各执一份</div>
      </div>
    </>
  );
}
