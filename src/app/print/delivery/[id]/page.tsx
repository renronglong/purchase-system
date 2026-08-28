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
const ROW_HEIGHT = "8mm"; // 每行8mm，6行共48mm
// 内容宽度：190mm（右边距加大20mm，防止针式打印机裁切右侧内容）
const CONTENT_WIDTH = "190mm";
// 高度分配：标题10mm + 表头18mm + 表格53mm(5+48) + 合计6mm + 底部14mm = 101mm < 134mm

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

  // 根据公司名称自动匹配地址
  const getCompanyAddress = (companyName: string) => {
    if (companyName.includes("质稳")) {
      return "广东省佛山市南海区狮山招大小坑尾坑尾园";
    } else if (companyName.includes("碧利莱")) {
      return "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层";
    }
    return "";
  };

  const companyAddress = getCompanyAddress(order.company);

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

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - 内容宽度190mm，左右各留5mm边距，高度134mm（140mm-2*3mm padding） */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        {/* 内层容器 - 无边框，高度134mm，左边距2mm */}
        <div style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", boxSizing: "border-box", marginLeft: "2mm" }}>
          {/* 标题区域 - 横排居中，固定高度 10mm，无下边框 */}
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0 }}>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              {order.company}送货单
            </h1>
          </div>

          {/* 表头信息区域 - 左右两列布局，固定高度18mm（4行×4.5mm），底部留2mm间距 */}
          <div style={{ fontSize: "13px", lineHeight: "1.3", padding: "0.5mm 2mm 2mm 2mm", flexShrink: 0, height: "18mm", boxSizing: "border-box", overflow: "visible", marginBottom: "0" }}>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">客户名称：</span>{order.customer}</span>
              <span style={{ flex: "1", marginLeft: "30mm" }}><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: "13px" }}>{order.noteNo}</span></span>
            </div>
            <div className="flex">
              <span style={{ flex: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><span className="font-bold">客户地址：</span>{customer?.address || ""}</span>
              <span style={{ flex: "1", marginLeft: "30mm" }}><span className="font-bold">送货日期：</span>{order.date}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系电话：</span>{customer?.phone || ""}</span>
              <span style={{ flex: "1", marginLeft: "30mm" }}><span className="font-bold">订单号：</span>{order.orderNo || ""}</span>
            </div>
            <div className="flex">
              <span style={{ flex: "1" }}><span className="font-bold">联系人：</span>{customer?.contact || ""}</span>
              <span style={{ flex: "1", marginLeft: "30mm" }}><span className="font-bold">付款方式：</span>{customer?.paymentTerms || ""}</span>
            </div>
          </div>

          {/* 明细表格 - 固定6行，每行9mm，总宽度190mm，只有单元格有边框 */}
          <table className="w-full border-collapse" style={{ fontSize: "12px", tableLayout: "fixed", flexShrink: 0, border: "none" }}>
            <colgroup>
              <col style={{ width: "7mm" }} />   {/* 序号 */}
              <col style={{ width: "26mm" }} />  {/* 产品编号 +4mm */}
              <col style={{ width: "24mm" }} />  {/* 名称 */}
              <col style={{ width: "30mm" }} />  {/* 型号规格mm */}
              <col style={{ width: "14mm" }} />  {/* 颜色 */}
              <col style={{ width: "10mm" }} />  {/* 数量 */}
              <col style={{ width: "9mm" }} />   {/* 单位 */}
              <col style={{ width: "16mm" }} />  {/* 单价 */}
              <col style={{ width: "20mm" }} />  {/* 金额 +2mm */}
              <col style={{ width: "34mm" }} />  {/* 备注 -6mm */}
              {/* 总计: 7+26+24+30+14+10+9+16+20+34 = 190mm */}
            </colgroup>
            <thead>
              <tr style={{ height: "5mm", borderTop: "none" }}>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>序号</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>产品编号</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>名称</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>型号规格mm</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>颜色</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>数量</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>单位</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>单价</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>金额</th>
                <th style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "12px" }}>备注</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((item, idx) => (
                <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: "12px" }}>{item.isEmpty ? "" : idx + 1}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", wordBreak: "break-all", fontSize: "12px" }}>{item.materialCode}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px" }}>{item.productName}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px" }}>{item.spec}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px" }}>{item.surface}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "12px" }}>{item.isEmpty ? "" : item.qty}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: "12px" }}>{item.unit}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "12px" }}>{item.isEmpty ? "" : item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "12px" }}>{item.isEmpty ? "" : item.amount.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "12px" }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                {/* 大写金额从序号列开始，跨8列（序号到单价） */}
                <td colSpan={8} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2mm", verticalAlign: "middle", fontSize: "13px" }}>
                  <span style={{ fontWeight: "bold" }}>合计人民币（大写）：{numToCN(totalAmount)}</span>
                </td>
                {/* 小写金额对齐到"金额"列 */}
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "13px", fontWeight: "bold" }}>¥{totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}</td>
                {/* 备注列留空 */}
                <td style={{ border: `1px solid ${BORDER_COLOR}` }}></td>
              </tr>
            </tfoot>
          </table>

          {/* 底部区域 - 备注、公司地址、签字栏，固定高度14mm */}
          <div style={{ fontSize: "11px", padding: "1mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "visible" }}>
            <div style={{ marginBottom: "0.3mm", fontSize: "11px", color: "#333" }}>
              备注：请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决。
            </div>
            <div style={{ marginBottom: "0.5mm", fontSize: "11px" }}>
              公司地址：{companyAddress}
            </div>
            <div className="flex justify-between" style={{ fontSize: "11px", paddingTop: "0.5mm" }}>
              <span><span className="font-bold">制单：</span>{order.maker || "易金兰"}</span>
              <span>
                <span className="font-bold">客户签收：</span>
                <span style={{ display: "inline-block", width: "20mm" }}></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
