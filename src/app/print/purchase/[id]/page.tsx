"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { purchaseOrderStore, type PurchaseOrder } from "@/lib/store";

const MAKER_STORAGE_KEY = "print_maker_names";

function getMakerHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(MAKER_STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveMakerName(name: string) {
  if (!name.trim()) return;
  const list = getMakerHistory();
  const filtered = list.filter(n => n !== name.trim());
  filtered.unshift(name.trim());
  localStorage.setItem(MAKER_STORAGE_KEY, JSON.stringify(filtered.slice(0, 20)));
}

export default function PrintPurchasePage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [makerName, setMakerName] = useState("");
  const [makerHistory, setMakerHistory] = useState<string[]>([]);

  const loadOrder = useCallback(() => {
    const found = purchaseOrderStore.getById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
    setMakerHistory(getMakerHistory());
  }, [loadOrder]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleMakerChange = (val: string) => {
    setMakerName(val);
    if (val.trim()) saveMakerName(val.trim());
  };

  if (!order) {
    return <div className="p-6 text-center text-slate-400">加载中...</div>;
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 172mm; }
          .no-print { display: none !important; }
          @page { size: 180mm 100mm; margin: 4mm; }
        }
      `}</style>

      {/* 打印按钮 */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="ml-2 px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 顺丰热敏标签 横向 180mm x 100mm */}
      <div id="print-area" className="px-3 py-2 mx-auto bg-white" style={{ width: "172mm", fontSize: "9px" }}>
        {/* 标题行：公司名 + 采购单 横向排列 */}
        <div className="flex items-center justify-between border-b border-black pb-1 mb-1.5">
          <h1 className="font-bold text-[12px] tracking-wider">{order.company}</h1>
          <h2 className="font-bold text-[16px] tracking-wide">采 购 单</h2>
        </div>

        {/* 基本信息 - 横向多列 */}
        <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 mb-1.5 text-[9px]">
          <div className="flex"><span className="font-medium w-12 shrink-0">编号：</span><span className="font-mono">{order.orderNo}</span></div>
          <div className="flex"><span className="font-medium w-12 shrink-0">日期：</span><span>{order.orderDate}</span></div>
          <div className="flex"><span className="font-medium w-12 shrink-0">供应商：</span><span>{order.supplierName}</span></div>
          <div className="flex"><span className="font-medium w-12 shrink-0">联系人：</span><span>{order.contact}</span></div>
          <div className="flex"><span className="font-medium w-12 shrink-0">电话：</span><span>{order.phone}</span></div>
          {order.address && <div className="flex col-span-1"><span className="font-medium w-12 shrink-0">地址：</span><span className="truncate">{order.address}</span></div>}
        </div>

        {/* 明细表格 */}
        <table className="w-full border-collapse mb-1.5" style={{ fontSize: "8px" }}>
          <thead>
            <tr>
              <th className="border border-black px-0.5 py-0.5 font-medium">序</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">产品编号</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">产品名称</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">规格</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">长度</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">数量</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">单位</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">重量KG</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">表面处理</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">交货时间</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black px-0.5 py-0.5 text-center">{index + 1}</td>
                <td className="border border-black px-0.5 py-0.5 font-mono" style={{ wordBreak: "break-all" }}>{item.productCode}</td>
                <td className="border border-black px-0.5 py-0.5">{item.productName}</td>
                <td className="border border-black px-0.5 py-0.5">{item.spec}</td>
                <td className="border border-black px-0.5 py-0.5 text-right">{item.length}</td>
                <td className="border border-black px-0.5 py-0.5 text-right">{item.quantity}</td>
                <td className="border border-black px-0.5 py-0.5 text-center">{item.unit}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.totalWeight.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5">{item.surfaceTreatment}</td>
                <td className="border border-black px-0.5 py-0.5">{item.deliveryDate}</td>
                <td className="border border-black px-0.5 py-0.5">{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={5} className="border border-black px-0.5 py-0.5 text-right">合计</td>
              <td className="border border-black px-0.5 py-0.5 text-center">{order.totalQuantity}</td>
              <td className="border border-black px-0.5 py-0.5"></td>
              <td className="border border-black px-0.5 py-0.5 text-right font-mono">{order.totalWeight.toFixed(2)}</td>
              <td colSpan={3} className="border border-black px-0.5 py-0.5"></td>
            </tr>
          </tfoot>
        </table>

        {/* 签收栏 - 底部横向 */}
        <div className="grid grid-cols-3 gap-4 text-[9px]">
          <div>
            <span className="font-medium">制单人：</span>
            <input type="text" value={makerName} onChange={e => handleMakerChange(e.target.value)} list="maker-name-list" placeholder="" className="bg-transparent border-b border-black outline-none text-[9px] py-0.5 w-24" />
            <datalist id="maker-name-list">{makerHistory.map(n => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <span className="font-medium">供应商回签：</span>
            <span className="inline-block border-b border-black w-24"></span>
          </div>
          <div className="text-right text-[8px] text-gray-500 self-end">
            本采购单一式两份，供需双方各执一份
          </div>
        </div>
      </div>
    </>
  );
}
