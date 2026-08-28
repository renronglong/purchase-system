"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { reconciliationStore, type ReconciliationOrder } from "@/lib/store";

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

export default function PrintReconciliationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<ReconciliationOrder | null>(null);
  const [makerName, setMakerName] = useState("");
  const [makerHistory, setMakerHistory] = useState<string[]>([]);

  const load = useCallback(() => {
    const found = reconciliationStore.getById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  useEffect(() => {
    load();
    setMakerHistory(getMakerHistory());
  }, [load]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => window.print(), 300);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleMakerChange = (val: string) => {
    setMakerName(val);
    if (val.trim()) saveMakerName(val.trim());
  };

  if (!order) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const totalAmount = order.totalAmount || order.items.reduce((s, i) => s + i.amount, 0);
  const totalQty = order.totalQty || order.items.reduce((s, i) => s + i.qty, 0);

  // 金额转大写
  const amountToChinese = (n: number): string => {
    if (n === 0) return "零元整";
    const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    const units = ["", "拾", "佰", "仟"];
    const bigUnits = ["", "万", "亿"];
    const intPart = Math.floor(n);
    const decPart = Math.round((n - intPart) * 100);
    const jiao = Math.floor(decPart / 10);
    const fen = decPart % 10;
    let result = "";
    let zeroFlag = false;
    const str = intPart.toString();
    for (let i = 0; i < str.length; i++) {
      const d = parseInt(str[i]);
      const pos = str.length - 1 - i;
      const unitIdx = pos % 4;
      const bigIdx = Math.floor(pos / 4);
      if (d === 0) {
        zeroFlag = true;
        if (unitIdx === 0 && bigUnits[bigIdx]) { result += bigUnits[bigIdx]; zeroFlag = false; }
      } else {
        if (zeroFlag) { result += "零"; zeroFlag = false; }
        result += digits[d] + units[unitIdx];
        if (unitIdx === 0 && bigUnits[bigIdx]) result += bigUnits[bigIdx];
      }
    }
    result += "元";
    if (jiao === 0 && fen === 0) { result += "整"; }
    else {
      if (jiao > 0) result += digits[jiao] + "角";
      else if (fen > 0) result += "零";
      if (fen > 0) result += digits[fen] + "分";
    }
    return result;
  };

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

      <div className="no-print fixed top-4 right-4 z-50">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="ml-2 px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 顺丰热敏标签 100mm x 180mm */}
      <div id="print-area" className="p-2 mx-auto bg-white" style={{ width: "100mm", minHeight: "172mm", fontSize: "9px" }}>
        <div className="text-center mb-2 border-b border-black pb-1.5">
          <h1 className="font-bold text-[15px] tracking-wide">对 帐 单</h1>
        </div>

        <div className="text-[9px] leading-relaxed space-y-0.5 mb-2 border-b border-black pb-1.5">
          <div className="flex"><span className="font-medium w-16 shrink-0">对帐单编号：</span><span className="font-mono">{order.orderNo}</span></div>
          <div className="flex"><span className="font-medium w-16 shrink-0">客户名称：</span><span>{order.customer}</span></div>
          <div className="flex"><span className="font-medium w-16 shrink-0">对帐日期：</span><span>{order.startDate} ~ {order.endDate}</span></div>
          <div className="flex"><span className="font-medium w-16 shrink-0">状态：</span><span>{order.status}</span></div>
        </div>

        <table className="w-full border-collapse mb-2" style={{ fontSize: "8px" }}>
          <thead>
            <tr className="border-b border-black">
              <th className="border border-black px-0.5 py-0.5 font-medium">序</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">送货单号</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">日期</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">物料编号</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">名称</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">规格</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">数</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">单价</th>
              <th className="border border-black px-0.5 py-0.5 font-medium">金额</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-black px-0.5 py-0.5 text-center">{idx + 1}</td>
                <td className="border border-black px-0.5 py-0.5 font-mono">{item.deliveryNoteNo}</td>
                <td className="border border-black px-0.5 py-0.5">{item.deliveryDate}</td>
                <td className="border border-black px-0.5 py-0.5 font-mono" style={{ wordBreak: "break-all" }}>{item.materialCode}</td>
                <td className="border border-black px-0.5 py-0.5">{item.productName}</td>
                <td className="border border-black px-0.5 py-0.5">{item.spec}</td>
                <td className="border border-black px-0.5 py-0.5 text-right">{item.qty}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={6} className="border border-black px-0.5 py-0.5 text-right">合计</td>
              <td className="border border-black px-0.5 py-0.5 text-right font-mono">{totalQty}</td>
              <td className="border border-black px-0.5 py-0.5"></td>
              <td className="border border-black px-0.5 py-0.5 text-right font-mono">{totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="text-[9px] mb-2 space-y-0.5">
          <div className="flex"><span className="font-medium w-16 shrink-0">金额(大写)：</span><span className="tracking-wider">{amountToChinese(totalAmount)}</span></div>
          <div className="flex"><span className="font-medium w-16 shrink-0">金额(小写)：</span><span className="font-mono">¥ {totalAmount.toFixed(2)}</span></div>
        </div>

        {order.remark && (
          <div className="text-[9px] mb-2">
            <span className="font-medium">备注：</span><span>{order.remark}</span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-4 text-[9px]">
          <div>
            <p className="font-medium mb-1">制单人：</p>
            <input type="text" value={makerName} onChange={e => handleMakerChange(e.target.value)} list="maker-name-list" placeholder="" className="w-full bg-transparent border-b border-black outline-none text-[9px] py-0.5" />
            <datalist id="maker-name-list">{makerHistory.map(n => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <p className="font-medium mb-3">客户确认：</p>
            <div className="border-b border-black"></div>
          </div>
        </div>
      </div>
    </>
  );
}
