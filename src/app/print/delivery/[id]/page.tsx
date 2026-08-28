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
const ROW_HEIGHT = "12mm"; // 每行12mm，6行共72mm
// 内容宽度：210mm（考虑针式打印机两边打孔区域各约12mm不可打印）
const CONTENT_WIDTH = "210mm";
// 高度分配：标题10mm + 表头20mm + 表格78mm(6+72) + 合计6mm + 底部14mm = 128mm < 134mm

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
        @page {
          size: 241mm 140mm;
          margin: 5mm;
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
            left: 5mm;
            top: 5mm;
            width: ${CONTENT_WIDTH};
            height: 134mm;
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

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 内容宽度210mm，左右各留5mm边距，高度134mm */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
        {/* 内层容器 - 带边框 */}
        <div style={{ width: "100%", height: "100%", border: `2px solid ${BORDER_COLOR}`, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          {/* 标题区域 - 横排居中，固定高度 10mm */}
          <div className="flex items-center justify-center" style={{ height: "10mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
            <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              {order.company}送货单
            </h1>
          </div>

          {/* 表头信息区域 - 左右两列布局，固定高度20mm（4行×5mm） */}
          <div style={{ fontSize: "11px", lineHeight: "1.3", padding: "0.5mm 2mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0, height: "20mm", boxSizing: "border-box", overflow: "hidden" }}>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">客户名称：</span>{order.customer}</span>
              <span style={{ flexShrink: 0, marginLeft: "5mm" }}><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: "13px" }}>{order.noteNo}</span></span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">客户地址：</span>{customer?.address || ""}</span>
              <span style={{ flexShrink: 0, marginLeft: "5mm" }}><span className="font-bold">送货日期：</span>{order.date}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系电话：</span>{customer?.phone || ""}</span>
              <span style={{ flexShrink: 0, marginLeft: "5mm" }}><span className="font-bold">订单号：</span>{order.orderNo || ""}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系人：</span>{customer?.contact || ""}</span>
              <span style={{ flexShrink: 0, marginLeft: "5mm" }}><span className="font-bold">付款方式：</span>{customer?.paymentTerms || ""}</span>
            </div>
          </div>

          {/* 明细表格 - 固定6行，每行10mm，总宽度210mm */}
          <table className="w-full border-collapse" style={{ fontSize: "11px", tableLayout: "fixed", flexShrink: 0 }}>
            <colgroup>
              <col style={{ width: "7mm" }} />   {/* 序号 */}
              <col style={{ width: "22mm" }} />  {/* 产品编号 */}
              <col style={{ width: "22mm" }} />  {/* 名称 */}
              <col style={{ width: "28mm" }} />  {/* 型号规格mm */}
              <col style={{ width: "14mm" }} />  {/* 颜色 */}
              <col style={{ width: "10mm" }} />  {/* 数量 */}
              <col style={{ width: "9mm" }} />   {/* 单位 */}
              <col style={{ width: "14mm" }} />  {/* 单价 */}
              <col style={{ width: "16mm" }} />  {/* 金额 */}
              <col style={{ width: "68mm" }} />  {/* 备注 */}
              {/* 总计: 7+22+22+28+14+10+9+14+16+68 = 210mm */}
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
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle" }}>{item.isEmpty ? "" : item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle" }}>{item.isEmpty ? "" : item.amount.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                <td colSpan={5} style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", fontWeight: "bold" }}>合计</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 2px", verticalAlign: "middle", fontWeight: "bold" }}>
                  {order.items.reduce((s, i) => s + i.qty, 0) || ""}
                </td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, verticalAlign: "middle" }}></td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, verticalAlign: "middle" }}></td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 2px", verticalAlign: "middle", fontWeight: "bold" }}>
                  {totalAmount > 0 ? totalAmount.toFixed(2) : ""}
                </td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, verticalAlign: "middle" }}></td>
              </tr>
            </tfoot>
          </table>

          {/* 底部区域 - 备注、公司地址、签字栏，固定高度14mm */}
          <div style={{ fontSize: "11px", padding: "0.5mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "hidden" }}>
            <div style={{ marginBottom: "0.3mm" }}>
              <span style={{ fontWeight: "bold" }}>合计人民币：</span>
              <span style={{ marginLeft: "2mm" }}>{numToCN(totalAmount)}</span>
              <span style={{ marginLeft: "5mm" }}>¥{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ marginBottom: "0.3mm", fontSize: "10px", color: "#333" }}>
              备注：请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决。
            </div>
            <div style={{ marginBottom: "0.5mm", fontSize: "10px" }}>
              公司地址：佛山市三水区碧利莱金属制品有限公司
            </div>
            <div className="flex justify-between" style={{ fontSize: "11px" }}>
              <span><span className="font-bold">制单：</span>{order.maker || "易金兰"}</span>
              <span>
                <span className="font-bold">客户签收：</span>
                <span style={{ display: "inline-block", width: "20mm", borderBottom: "1px solid #999", height: "4mm" }}></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
