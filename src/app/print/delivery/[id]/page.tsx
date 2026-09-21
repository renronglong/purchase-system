"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
const ROW_HEIGHT = "8mm";
const CONTENT_WIDTH = "190mm";
const DEFAULT_COL_WIDTHS = [7, 40, 25, 30, 14, 15, 9, 16, 20, 32];
const STORAGE_KEY = "delivery_col_widths_v1";

export default function PrintDeliveryPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DeliveryNote | null>(null);
  const [customer, setCustomer] = useState<DeliveryCustomer | null>(null);
  const [colWidths, setColWidths] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_COL_WIDTHS.length) return parsed;
      }
    } catch {}
    return [...DEFAULT_COL_WIDTHS];
  });
  const resizing = useRef<{ colIdx: number; startX: number; startW: number } | null>(null);

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
      const timer = setTimeout(() => window.print(), 100);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const handleMouseDown = (e: React.MouseEvent, colIdx: number) => {
    e.preventDefault();
    resizing.current = { colIdx, startX: e.clientX, startW: colWidths[colIdx] };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const { colIdx, startX, startW } = resizing.current;
      const dx = e.clientX - startX;
      const mmPerPx = 241 / window.innerWidth;
      const delta = Math.round(dx * mmPerPx * 10) / 10;
      const newW = Math.max(5, Math.round((startW + delta) * 10) / 10);
      setColWidths(prev => {
        const next = [...prev];
        next[colIdx] = newW;
        return next;
      });
    };
    const handleMouseUp = () => {
      if (resizing.current) {
        resizing.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(colWidths)); } catch {}
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [colWidths]);

  const resetWidths = () => {
    setColWidths([...DEFAULT_COL_WIDTHS]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  if (!order) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const totalAmount = order.items.reduce((s, i) => s + i.amount, 0);
  const tableRows = Array.from({ length: FIXED_ROWS }, (_, idx) => {
    if (idx < order.items.length) {
      return { ...order.items[idx], isEmpty: false };
    }
    return { id: `empty-${idx}`, materialCode: "", productName: "", spec: "", surface: "", qty: 0, unit: "", unitPrice: 0, amount: 0, remark: "", isEmpty: true };
  });

  const getCompanyAddress = (companyName: string) => {
    if (companyName.includes("质稳")) return "广东省佛山市南海区狮山招大小坑尾坑尾园";
    else if (companyName.includes("碧利莱")) return "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层";
    return "";
  };
  const companyAddress = getCompanyAddress(order.company);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: 241mm 140mm; margin: 0; }
        @media print {
          html, body { width: 241mm; height: 140mm; margin: 0 !important; padding: 0 !important; overflow: hidden; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 241mm; height: 140mm; padding: 3mm; box-sizing: border-box; }
          .no-print { display: none !important; }
          .resize-handle { display: none !important; }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 { display: none !important; }
        }
        @media screen {
          body { background: #fff; }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 { display: none !important; }
          .resize-handle {
            position: absolute; right: -3px; top: 0; bottom: 0; width: 6px;
            cursor: col-resize; background: transparent; z-index: 10;
          }
          .resize-handle:hover { background: #3b82f6; }
          th { position: relative; }
        }
      `}} />

      

      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        <div style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", marginLeft: "2mm" }}>
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0, marginBottom: "5mm" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>{order.company}送货单</h1>
          </div>

          <div style={{ fontSize: "15px", lineHeight: "1.3", padding: "0 2mm", flexShrink: 0, height: "26mm", boxSizing: "border-box", overflow: "visible", marginBottom: "0" }}>
            <div className="flex" style={{ alignItems: "stretch" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div><span className="font-bold">客户名称：</span>{order.customer}</div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">客户地址：</span>{customer?.address || ""}</div>
                <div><span className="font-bold">联系电话：</span>{customer?.phone || ""}</div>
                <div><span className="font-bold">联系人：</span>{customer?.contact || ""}</div>
              </div>
              <div style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: "5mm" }}>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: "15px" }}>{order.noteNo}</span></div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">送货日期：</span>{order.date}</div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">订单号：</span>{order.orderNo || ""}</div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">付款方式：</span>{customer?.paymentTerms || ""}</div>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse" style={{ fontSize: "14px", tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}mm` }} />)}
            </colgroup>
            <thead>
              <tr style={{ height: "5mm", borderTop: "none" }}>
                {["序号","产品编号","名称","型号规格mm","颜色","数量","单位","单价","金额","备注"].map((label, i) => (
                  <th key={i} style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "14px" }}>
                    {label}
                    <span className="resize-handle no-print" onMouseDown={e => handleMouseDown(e, i)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((item, idx) => (
                <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: "14px" }}>{item.isEmpty ? "" : idx + 1}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: "14px", fontWeight: "bold" }}>{item.materialCode}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.productName}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.spec}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.surface}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : item.qty}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.unit}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : item.amount.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                <td colSpan={8} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2mm", verticalAlign: "middle", fontSize: "15px" }}>
                  <span style={{ fontWeight: "bold" }}>合计人民币（大写）：{numToCN(totalAmount)}</span>
                </td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "15px", fontWeight: "bold" }}>¥{totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}` }}></td>
              </tr>
            </tfoot>
          </table>

          <div style={{ fontSize: "13px", padding: "1mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "visible" }}>
            <div style={{ marginBottom: "0.3mm", fontSize: "13px", color: "#333" }}>
              备注：请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决。
            </div>
            <div style={{ marginBottom: "0.5mm", fontSize: "13px" }}>公司地址：{companyAddress}</div>
            <div className="flex justify-between" style={{ fontSize: "13px", paddingTop: "0.5mm" }}>
              <span><span className="font-bold">制单：</span>{order.maker || "易金兰"}</span>
              <span><span className="font-bold">客户签收：</span><span style={{ display: "inline-block", width: "20mm" }}></span></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
