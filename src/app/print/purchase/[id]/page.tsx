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
          #print-area { position: absolute; left: 0; top: 0; width: 100mm; }
          .no-print { display: none !important; }
          @page { size: 100mm 180mm; margin: 4mm; }
        }
      `}</style>

      {/* 打印按钮 */}
      <div className="no-print fixed top-4 right-4 z-50">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg"
        >
          打印 / 导出PDF
        </button>
        <button
          onClick={() => window.close()}
          className="ml-2 px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg"
        >
          关闭
        </button>
      </div>

      {/* 打印区域 - 顺丰热敏标签 100mm x 180mm */}
      <div id="print-area" className="p-2 mx-auto bg-white" style={{ width: "100mm", minHeight: "172mm", fontSize: "9px" }}>
        {/* 公司抬头 */}
        <div className="text-center mb-2 border-b border-black pb-1.5">
          <h1 className="font-bold text-[13px] tracking-wider leading-tight">{order.company}</h1>
          <h2 className="font-bold text-[15px] mt-1 tracking-wide">采 购 单</h2>
        </div>

        {/* 基本信息 - 紧凑单列 */}
        <div className="mb-2 text-[9px] leading-relaxed space-y-0.5">
          <div className="flex"><span className="font-medium w-14 shrink-0">编号：</span><span className="font-mono">{order.orderNo}</span></div>
          <div className="flex"><span className="font-medium w-14 shrink-0">日期：</span><span>{order.orderDate}</span></div>
          <div className="flex"><span className="font-medium w-14 shrink-0">供应商：</span><span>{order.supplierName}</span></div>
          <div className="flex"><span className="font-medium w-14 shrink-0">联系人：</span><span>{order.contact} {order.phone && `(${order.phone})`}</span></div>
          {order.address && <div className="flex"><span className="font-medium w-14 shrink-0">地址：</span><span className="break-all">{order.address}</span></div>}
        </div>

        {/* 明细表格 */}
        <table className="w-full border-collapse mb-2" style={{ fontSize: "8px" }}>
          <thead>
            <tr className="border-b border-black">
              <th className="border border-black px-0.5 py-0.5 font-medium">序</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">产品编号</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">名称</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">规格</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">长</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">数</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">重量</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">表面</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">交期</th>
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
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.totalWeight.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5">{item.surfaceTreatment}</td>
                <td className="border border-black px-0.5 py-0.5">{item.deliveryDate}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={5} className="border border-black px-0.5 py-0.5 text-right">合计</td>
              <td className="border border-black px-0.5 py-0.5 text-center">{order.totalQuantity}</td>
              <td className="border border-black px-0.5 py-0.5 text-right font-mono">{order.totalWeight.toFixed(2)}</td>
              <td colSpan={2} className="border border-black px-0.5 py-0.5"></td>
            </tr>
          </tfoot>
        </table>

        {/* 签收栏 */}
        <div className="mt-3 grid grid-cols-2 gap-4 text-[9px]">
          <div>
            <p className="font-medium mb-1">制单人：</p>
            <input type="text" value={makerName} onChange={e => handleMakerChange(e.target.value)} list="maker-name-list" placeholder="" className="w-full bg-transparent border-b border-black outline-none text-[9px] py-0.5" />
            <datalist id="maker-name-list">{makerHistory.map(n => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <p className="font-medium mb-3">供应商回签：</p>
            <div className="border-b border-black"></div>
          </div>
        </div>
      </div>
    </>
  );
}
