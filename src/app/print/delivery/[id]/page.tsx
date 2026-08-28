"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { deliveryNoteStore, deliveryCustomerStore, type DeliveryNote, type DeliveryCustomer } from "@/lib/store";

function numToCN(n: number): string {
  if (isNaN(n) || n === 0) return "零元整";
  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿"];
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;
  let result = "";
  if (intPart === 0) { result = "零"; } else {
    const s = intPart.toString();
    let zeroFlag = false;
    for (let i = 0; i < s.length; i++) {
      const d = parseInt(s[i]);
      const pos = s.length - 1 - i;
      const u = pos % 4;
      const bu = Math.floor(pos / 4);
      if (d === 0) { zeroFlag = true; } else {
        if (zeroFlag) { result += "零"; zeroFlag = false; }
        result += digits[d] + units[u];
      }
      if (u === 0 && bigUnits[bu]) { result += bigUnits[bu]; zeroFlag = false; }
    }
  }
  result += "元";
  if (jiao === 0 && fen === 0) { result += "整"; } else {
    if (jiao > 0) result += digits[jiao] + "角";
    else if (fen > 0) result += "零";
    if (fen > 0) result += digits[fen] + "分";
  }
  return result;
}

export default function PrintDeliveryPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DeliveryNote | null>(null);
  const [customer, setCustomer] = useState<DeliveryCustomer | null>(null);

  const load = useCallback(() => {
    const found = deliveryNoteStore.getById(orderId);
    if (found) {
      setOrder(found);
      // 查找客户详情
      const customers = deliveryCustomerStore.getAll();
      const cust = customers.find(c => c.name === found.customer);
      if (cust) setCustomer(cust);
    }
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
        {/* 标题 */}
        <div className="text-center border-b-2 border-black pb-1 mb-1.5">
          <span className="font-bold" style={{ fontSize: "14px" }}>{order.company}</span>
          <span className="font-bold ml-4" style={{ fontSize: "16px" }}>送 货 单</span>
        </div>

        {/* 基本信息三行 */}
        <div className="mb-1.5 border-b border-black pb-1.5" style={{ fontSize: "11px", lineHeight: "1.6" }}>
          <div className="flex">
            <span style={{ width: "76mm" }}><span className="font-medium">客户名称：</span>{order.customer}</span>
            <span style={{ width: "76mm" }}><span className="font-medium">联系人：</span>{customer?.contact || ""}</span>
            <span><span className="font-medium">NO：</span><span className="font-mono">{order.noteNo}</span></span>
          </div>
          <div className="flex">
            <span style={{ width: "76mm" }}><span className="font-medium">客户地址：</span>{customer?.address || ""}</span>
            <span style={{ width: "76mm" }}><span className="font-medium">送货日期：</span>{order.date}</span>
            <span><span className="font-medium">订单号：</span>{order.orderNo || ""}</span>
          </div>
          <div className="flex">
            <span style={{ width: "76mm" }}><span className="font-medium">付款方式：</span>{customer?.paymentTerms || ""}</span>
            <span><span className="font-medium">联系电话：</span>{customer?.phone || ""}</span>
          </div>
        </div>

        {/* 明细表格 */}
        <table className="w-full border-collapse mb-1.5" style={{ fontSize: "10px", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "8mm" }} />
            <col style={{ width: "24mm" }} />
            <col style={{ width: "28mm" }} />
            <col style={{ width: "32mm" }} />
            <col style={{ width: "16mm" }} />
            <col style={{ width: "12mm" }} />
            <col style={{ width: "10mm" }} />
            <col style={{ width: "14mm" }} />
            <col style={{ width: "16mm" }} />
            <col style={{ width: "69mm" }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-black">
              <th className="border border-black px-0.5 py-1 font-medium text-center">序号</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">产品编号</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">名称</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">型号规格mm</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">颜色</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">数量</th>
              <th className="border border-black px-0.5 py-1 font-medium text-center">单位</th>
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
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.spec}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.surface}</td>
                <td className="border border-black px-0.5 py-0.5 text-right">{item.qty}</td>
                <td className="border border-black px-0.5 py-0.5 text-center">{item.unit}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5 text-right font-mono">{item.amount.toFixed(2)}</td>
                <td className="border border-black px-0.5 py-0.5" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-bold">
              <td colSpan={8} className="border border-black px-1 py-1">合计人民币：{numToCN(totalAmount)}</td>
              <td className="border border-black px-0.5 py-1 text-right font-mono">{totalAmount.toFixed(2)}</td>
              <td className="border border-black px-0.5 py-1"></td>
            </tr>
          </tfoot>
        </table>

        {/* 备注说明 */}
        <div style={{ fontSize: "9px", marginBottom: "4px" }}>
          请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决
        </div>

        {/* 公司地址 */}
        <div className="border-t border-black pt-1 mb-1.5" style={{ fontSize: "10px" }}>
          公司地址：佛山市南海区大沥镇
        </div>

        {/* 签字栏 */}
        <div className="flex justify-between items-end" style={{ fontSize: "11px" }}>
          <div>
            <span className="font-medium">制单：</span>
            <span className="inline-block border-b border-black" style={{ width: "60px" }}>{order.maker || ""}</span>
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
