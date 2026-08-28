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

const BORDER_COLOR = "#2563eb";
const FIXED_ROWS = 6;
const ROW_HEIGHT = "10mm";

export default function PrintDeliveryPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DeliveryNote | null>(null);
  const [customer, setCustomer] = useState<DeliveryCustomer | null>(null);

  const load = useCallback(() => {
    const found = deliveryNoteStore.getById(orderId);
    if (found) {
      setOrder(found);
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

  // 生成固定6行数据，不足的用空行填充
  const tableRows = Array.from({ length: FIXED_ROWS }, (_, idx) => {
    if (idx < order.items.length) {
      return { ...order.items[idx], isEmpty: false };
    }
    return { id: `empty-${idx}`, materialCode: "", productName: "", spec: "", surface: "", qty: 0, unit: "", unitPrice: 0, amount: 0, remark: "", isEmpty: true };
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: 241mm 140mm; margin: 3mm; }
          html, body { width: 241mm; height: 140mm; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 235mm; height: 134mm; }
          .no-print { display: none !important; }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 { display: none !important; }
        }
        @media screen {
          body { background: #e2e8f0; }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 { display: none !important; }
        }
      `}} />

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 精确高度 134mm (140mm - 6mm margin) */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: "235mm", height: "134mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
        {/* 内层容器 - 带边框，占满整个区域 */}
        <div style={{ width: "100%", height: "100%", border: `2px solid ${BORDER_COLOR}`, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          {/* 标题区域 - 横排居中，固定高度 10mm */}
          <div className="flex items-center justify-center" style={{ height: "10mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
            <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              {order.company}送货单
            </h1>
          </div>

          {/* 表头信息区域 - NO移到右侧，固定高度约 8mm */}
          <div style={{ fontSize: "11px", lineHeight: "1.3", padding: "0.5mm 2mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">客户名称：</span>{order.customer}</span>
              <span style={{ flexShrink: 0 }}><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: "13px" }}>{order.noteNo}</span></span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">客户地址：</span>{customer?.address || ""}</span>
              <span style={{ flexShrink: 0 }}><span className="font-bold">送货日期：</span>{order.date}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系电话：</span>{customer?.phone || ""}</span>
              <span style={{ flexShrink: 0 }}><span className="font-bold">订单号：</span>{order.orderNo || ""}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系人：</span>{customer?.contact || ""}</span>
              <span style={{ flexShrink: 0 }}><span className="font-bold">付款方式：</span>{customer?.paymentTerms || ""}</span>
            </div>
          </div>

          {/* 明细表格 - 固定6行，每行10mm */}
          <table className="w-full border-collapse" style={{ fontSize: "11px", tableLayout: "fixed", flexShrink: 0 }}>
            <colgroup>
              <col style={{ width: "8mm" }} />
              <col style={{ width: "24mm" }} />
              <col style={{ width: "28mm" }} />
              <col style={{ width: "30mm" }} />
              <col style={{ width: "16mm" }} />
              <col style={{ width: "12mm" }} />
              <col style={{ width: "10mm" }} />
              <col style={{ width: "16mm" }} />
              <col style={{ width: "18mm" }} />
              <col style={{ width: "69mm" }} />
            </colgroup>
            <thead>
              <tr style={{ height: "6mm" }}>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>序号</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>产品编号</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>名称</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>型号规格mm</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>颜色</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>数量</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>单位</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>单价</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>金额</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "11px" }}>备注</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((item, idx) => (
                <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0" }}>{item.isEmpty ? "" : idx + 1}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", wordBreak: "break-all", fontSize: "10px" }}>{item.materialCode}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.spec}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.surface}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle" }}>{item.isEmpty ? "" : item.qty}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle" }}>{item.unit}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace" }}>{item.isEmpty ? "" : item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace" }}>{item.isEmpty ? "" : item.amount.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                <td colSpan={7} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2px", fontWeight: "bold", verticalAlign: "middle", fontSize: "11px" }}>合计人民币：{numToCN(totalAmount)}</td>
                <td colSpan={2} style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 2px", fontWeight: "bold", fontFamily: "monospace", verticalAlign: "middle", fontSize: "11px" }}>¥{totalAmount.toFixed(2)}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}` }}></td>
              </tr>
            </tfoot>
          </table>

          {/* 底部区域 - 固定高度 */}
          <div style={{ borderTop: `2px solid ${BORDER_COLOR}`, padding: "0.5mm 2mm", fontSize: "10px", flexShrink: 0 }}>
            {/* 备注说明 */}
            <div style={{ marginBottom: "0.3mm", fontSize: "9px" }}>
              请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决
            </div>
            {/* 公司地址 */}
            <div style={{ marginBottom: "0.5mm" }}>
              公司地址：佛山市南海区大沥镇
            </div>
            {/* 签字栏 */}
            <div className="flex justify-between items-center" style={{ fontSize: "11px" }}>
              <div>
                <span className="font-bold">制单：</span>
                <span>{order.maker || "易金兰"}</span>
              </div>
              <div className="flex items-center">
                <span className="font-bold">客户签收：</span>
                <span style={{ display: "inline-block", width: "45mm", height: "4mm", marginLeft: "2px", borderBottom: "1px solid #999" }}></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
