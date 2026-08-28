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
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 15mm; }
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

      {/* 打印区域 */}
      <div id="print-area" className="p-8 max-w-[210mm] mx-auto bg-white">
        {/* 公司抬头 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wider">{order.company}</h1>
          <h2 className="text-xl font-bold mt-2 tracking-wide">采 购 单</h2>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mb-4 border-b border-black pb-3">
          <div className="flex">
            <span className="font-medium w-20 shrink-0">订单编号：</span>
            <span className="font-mono">{order.orderNo}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 shrink-0">制单日期：</span>
            <span>{order.orderDate}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 shrink-0">供应商：</span>
            <span>{order.supplierName}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 shrink-0">联系人：</span>
            <span>{order.contact}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 shrink-0">电话：</span>
            <span>{order.phone}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20 shrink-0">地址：</span>
            <span>{order.address}</span>
          </div>
        </div>

        {/* 明细表格 */}
        <table className="w-full text-xs border-collapse mb-4">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border border-black px-1.5 py-1.5 font-medium">序号</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">产品编号</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">产品名称</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">规格尺寸mm</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">长度mm</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">数量</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">单位</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">理论重量KG</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">表面处理</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">交货时间</th>
              <th className="border border-black px-1.5 py-1.5 font-medium">备注</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border border-black px-1.5 py-1 text-center">{index + 1}</td>
                <td className="border border-black px-1.5 py-1 font-mono">{item.productCode}</td>
                <td className="border border-black px-1.5 py-1">{item.productName}</td>
                <td className="border border-black px-1.5 py-1">{item.spec}</td>
                <td className="border border-black px-1.5 py-1 text-right">{item.length}</td>
                <td className="border border-black px-1.5 py-1 text-right">{item.quantity}</td>
                <td className="border border-black px-1.5 py-1 text-center">{item.unit}</td>
                <td className="border border-black px-1.5 py-1 text-right font-mono">{item.totalWeight.toFixed(3)}</td>
                <td className="border border-black px-1.5 py-1">{item.surfaceTreatment}</td>
                <td className="border border-black px-1.5 py-1">{item.deliveryDate}</td>
                <td className="border border-black px-1.5 py-1">{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={5} className="border border-black px-1.5 py-1.5 text-right">合计</td>
              <td className="border border-black px-1.5 py-1.5 text-center">{order.totalQuantity}</td>
              <td className="border border-black px-1.5 py-1.5"></td>
              <td className="border border-black px-1.5 py-1.5 text-right font-mono">{order.totalWeight.toFixed(3)}</td>
              <td colSpan={3} className="border border-black px-1.5 py-1.5"></td>
            </tr>
          </tfoot>
        </table>

        {/* 签收栏 */}
        <div className="mt-8 grid grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-medium mb-2">制单人：</p>
            <input type="text" value={makerName} onChange={e => handleMakerChange(e.target.value)} list="maker-name-list" placeholder="" className="w-full bg-transparent border-b border-black outline-none text-sm py-0.5 print:border-b print:bg-transparent" style={{ WebkitPrintColorAdjust: 'exact' }} />
            <datalist id="maker-name-list">{makerHistory.map(n => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <p className="font-medium mb-6">供应商回签：</p>
            <div className="border-b border-black"></div>
          </div>
          <div>
            <p className="font-medium mb-6">验收人：</p>
            <div className="border-b border-black"></div>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          本采购单一式两份，供需双方各执一份
        </div>
      </div>
    </>
  );
}
