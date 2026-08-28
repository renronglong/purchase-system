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

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: 241mm 140mm; margin: 3mm 5mm; }
          html, body { width: 241mm; height: 140mm; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 5mm; top: 3mm; width: 231mm; height: 134mm; }
          .no-print { display: none !important; }
          /* 隐藏侧边栏 */
          aside, nav, [class*="sidebar"] { display: none !important; }
        }
        @media screen {
          body { background: #e2e8f0; }
          /* 屏幕预览时也隐藏侧边栏 */
          aside, nav, [class*="sidebar"] { display: none !important; }
        }
      `}</style>

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      <div id="print-area" className="mx-auto bg-white" style={{ width: "231mm", height: "134mm", padding: "0", display: "flex", flexDirection: "column", border: `2px solid ${BORDER_COLOR}`, overflow: "hidden" }}>
        {/* 标题区域 - 横排居中 */}
        <div className="flex items-center justify-center" style={{ height: "12mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
            {order.company}送货单
          </h1>
        </div>

        {/* 表头信息区域 */}
        <div style={{ fontSize: "12px", lineHeight: "1.4", padding: "1mm 2mm", borderBottom: `2px solid ${BORDER_COLOR}`, flexShrink: 0 }}>
          <div className="flex">
            <span style={{ width: "95mm" }}><span className="font-bold">客户名称：</span>{order.customer}</span>
            <span><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: "13px" }}>{order.noteNo}</span></span>
          </div>
          <div className="flex">
            <span style={{ width: "95mm" }}><span className="font-bold">客户地址：</span>{customer?.address || ""}</span>
            <span><span className="font-bold">送货日期：</span>{order.date}</span>
          </div>
          <div className="flex">
            <span style={{ width: "95mm" }}><span className="font-bold">联系电话：</span>{customer?.phone || ""}</span>
            <span><span className="font-bold">订单号：</span>{order.orderNo || ""}</span>
          </div>
          <div className="flex">
            <span style={{ width: "95mm" }}><span className="font-bold">联系人：</span>{customer?.contact || ""}</span>
            <span><span className="font-bold">付款方式：</span>{customer?.paymentTerms || ""}</span>
          </div>
        </div>

        {/* 明细表格 - 使用flex:1撑满剩余空间 */}
        <table className="w-full border-collapse" style={{ fontSize: "11px", tableLayout: "fixed", flex: "1" }}>
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
            {order.items.map((item, idx) => (
              <tr key={item.id} style={{ height: "auto", minHeight: "12mm" }}>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0" }}>{idx + 1}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", wordBreak: "break-all", fontSize: "10px" }}>{item.materialCode}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.productName}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.spec}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis" }}>{item.surface}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle" }}>{item.qty}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle" }}>{item.unit}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace" }}>{item.unitPrice.toFixed(2)}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace" }}>{item.amount.toFixed(2)}</td>
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

        {/* 底部区域 */}
        <div style={{ borderTop: `2px solid ${BORDER_COLOR}`, padding: "1mm 2mm", fontSize: "10px", flexShrink: 0 }}>
          {/* 备注说明 */}
          <div style={{ marginBottom: "0.5mm", fontSize: "9px" }}>
            请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决
          </div>
          {/* 公司地址 */}
          <div style={{ marginBottom: "0.5mm" }}>
            公司地址：佛山市南海区大沥镇
          </div>
          {/* 签字栏 - 直接显示制单人名字 */}
          <div className="flex justify-between" style={{ fontSize: "11px" }}>
            <div>
              <span className="font-bold">制单：</span>
              <span>{order.maker || "易金兰"}</span>
            </div>
            <div>
              <span className="font-bold">客户签收：</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
