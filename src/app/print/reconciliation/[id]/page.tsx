"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { reconciliationStore, deliveryNoteStore, type ReconciliationOrder } from "@/lib/store";

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

  // 从关联的送货单中获取公司名称
  const getCompanyName = (): string => {
    if (order.items.length > 0) {
      const firstNoteNo = order.items[0].deliveryNoteNo;
      const allNotes = deliveryNoteStore.getAll();
      const note = allNotes.find(n => n.noteNo === firstNoteNo);
      if (note?.company) return note.company;
    }
    return "佛山市质稳五金有限公司";
  };
  const companyName = getCompanyName();

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
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: 241mm 140mm;
          margin: 0;
        }
        @media print {
          html, body {
            width: 241mm;
            height: 140mm;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 241mm;
            height: 140mm;
            padding: 3mm;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 {
            display: none !important;
          }
        }
        @media screen {
          body {
            background: #e2e8f0;
          }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 {
            display: none !important;
          }
        }
      `}} />

      <div className="no-print fixed top-4 right-4 z-50">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="ml-2 px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 针式打印机连续纸 241mm x 140mm 横向 */}
      <div id="print-area" className="px-4 py-3 mx-auto bg-white" style={{ width: "233mm", fontSize: "13px" }}>
        {/* 标题行 */}
        <div className="text-center border-b-2 border-black pb-1.5 mb-2">
          <h1 className="font-bold text-[22px] tracking-wide">{companyName}对帐单</h1>
        </div>

        {/* 基本信息 - 重新布局 */}
        <div className="mb-2 text-[13px] border-b border-black pb-2">
          <div className="flex mb-1">
            <div className="flex" style={{ whiteSpace: "nowrap" }}>
              <span className="font-medium">对帐单编号：</span>
              <span className="font-mono">{order.orderNo}</span>
            </div>
          </div>
          <div className="flex mb-1">
            <div className="flex" style={{ whiteSpace: "nowrap" }}>
              <span className="font-medium">客户名称：</span>
              <span>{order.customer}</span>
            </div>
          </div>
          <div className="flex">
            <div className="flex mr-8" style={{ whiteSpace: "nowrap" }}>
              <span className="font-medium">起始日期：</span>
              <span>{order.startDate}</span>
            </div>
            <div className="flex" style={{ whiteSpace: "nowrap" }}>
              <span className="font-medium">截止日期：</span>
              <span>{order.endDate}</span>
            </div>
          </div>
        </div>

        {/* 明细表格 */}
        <table className="w-full border-collapse mb-2" style={{ fontSize: "12px" }}>
          <thead>
            <tr>
              <th className="border border-black px-1 py-1 font-medium">序号</th>
              <th className="border border-black px-1 py-1 font-medium">送货单号</th>
              <th className="border border-black px-1 py-1 font-medium">送货日期</th>
              <th className="border border-black px-1 py-1 font-medium">物料编号</th>
              <th className="border border-black px-1 py-1 font-medium">产品名称</th>
              <th className="border border-black px-1 py-1 font-medium">规格</th>
              <th className="border border-black px-1 py-1 font-medium">表面处理</th>
              <th className="border border-black px-1 py-1 font-medium">单位</th>
              <th className="border border-black px-1 py-1 font-medium">数量</th>
              <th className="border border-black px-1 py-1 font-medium">单价</th>
              <th className="border border-black px-1 py-1 font-medium">金额</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-black px-1 py-0.5 text-center">{idx + 1}</td>
                <td className="border border-black px-1 py-0.5 font-mono">{item.deliveryNoteNo}</td>
                <td className="border border-black px-1 py-0.5">{item.deliveryDate}</td>
                <td className="border border-black px-1 py-0.5 font-mono" style={{ wordBreak: "break-all" }}>{item.materialCode}</td>
                <td className="border border-black px-1 py-0.5">{item.productName}</td>
                <td className="border border-black px-1 py-0.5">{item.spec}</td>
                <td className="border border-black px-1 py-0.5">{item.surface}</td>
                <td className="border border-black px-1 py-0.5 text-center">{item.unit}</td>
                <td className="border border-black px-1 py-0.5 text-right">{item.qty}</td>
                <td className="border border-black px-1 py-0.5 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-black px-1 py-0.5 text-right font-mono">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold">
              <td colSpan={8} className="border border-black px-1 py-1 text-right">合计</td>
              <td className="border border-black px-1 py-1 text-right font-mono">{totalQty}</td>
              <td className="border border-black px-1 py-1"></td>
              <td className="border border-black px-1 py-1 text-right font-mono">{totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={11} className="border border-black px-2 py-1.5">
                <div className="flex justify-between items-center">
                  <div className="flex"><span className="font-medium shrink-0">合计金额（大写）：</span><span className="tracking-wider">{amountToChinese(totalAmount)}</span></div>
                  <div className="flex"><span className="font-medium shrink-0">（小写）：</span><span className="font-mono">¥{totalAmount.toFixed(2)}</span></div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        {/* 备注 */}
        {order.remark && (
          <div className="mb-2 text-[12px]">
            <div className="flex"><span className="font-medium shrink-0">备注：</span><span>{order.remark}</span></div>
          </div>
        )}

        {/* 签字栏 - 底部横向 */}
        <div className="flex justify-between items-end text-[12px] mt-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">制单人：</span>
            <span>{order.maker || "易金兰"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">客户确认签字：</span>
            <span className="inline-block border-b border-black w-28"></span>
          </div>

        </div>
      </div>
    </>
  );
}
