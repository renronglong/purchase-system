"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { deliveryNoteStore, deliveryCustomerStore, type DeliveryNote, type DeliveryCustomer } from "@/lib/store";

function numToCN(n: number): string {
  if (isNaN(n) || n === 0) return "零元整";
  const digits = ["零","壹","贰","叁","肆","伍","陆","柒","捌","玖"];
  const units = ["","拾","佰","仟"];
  const bigUnits = ["","万","亿"];
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
const COL_WIDTHS_KEY = "delivery_col_widths_v1";
const LAYOUT_KEY = "delivery_layout_v1";

interface LayoutConfig {
  title: string;
  titleFontSize: number;
  labelFontSize: number;
  cellFontSize: number;
  headerLabels: string[];
  footerNote: string;
  companyAddress: string;
  makerLabel: string;
  maker: string;
  signLabel: string;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  title: "",
  titleFontSize: 22,
  labelFontSize: 15,
  cellFontSize: 14,
  headerLabels: ["序号","产品编号","名称","型号规格mm","颜色","数量","单位","单价","金额","备注"],
  footerNote: "备注：请仔细核对货物品质、型号和数量，如果有误请于3个工作日内提出，并出具证明，协商解决。",
  companyAddress: "",
  makerLabel: "制单",
  maker: "易金兰",
  signLabel: "客户签收",
};

function getCompanyAddress(companyName: string) {
  if (companyName.includes("质稳")) return "广东省佛山市南海区狮山招大小坑尾坑尾园";
  if (companyName.includes("碧利莱")) return "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层";
  return "";
}

function loadLayout(company: string): LayoutConfig {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_LAYOUT, ...parsed, companyAddress: parsed.companyAddress || getCompanyAddress(company) };
    }
  } catch {}
  return { ...DEFAULT_LAYOUT, title: `${company}送货单`, companyAddress: getCompanyAddress(company) };
}

function loadColWidths(): number[] {
  try {
    const saved = localStorage.getItem(COL_WIDTHS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_COL_WIDTHS.length) return parsed;
    }
  } catch {}
  return [...DEFAULT_COL_WIDTHS];
}

// Editable text component
function EditableText({ value, fontSize, className = "", style = {}, onBlur, isEditing }: {
  value: string; fontSize: number; className?: string; style?: React.CSSProperties;
  onBlur?: (v: string) => void; isEditing: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => { setText(value); }, [value]);

  const handleBlur = () => {
    const newText = ref.current?.innerText || "";
    setText(newText);
    onBlur?.(newText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); ref.current?.blur(); }
  };

  return (
    <span
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={className}
      style={{ ...style, fontSize: `${fontSize}px`, outline: "none", borderBottom: isEditing ? "1px dashed #93c5fd" : "none", minHeight: "1em", display: "inline-block" }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {text}
    </span>
  );
}

export default function PrintDeliveryPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<DeliveryNote | null>(null);
  const [customer, setCustomer] = useState<DeliveryCustomer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [colWidths, setColWidths] = useState<number[]>(loadColWidths);
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const resizing = useRef<{ colIdx: number; startX: number; startW: number } | null>(null);

  const load = useCallback(() => {
    const found = deliveryNoteStore.getById(orderId);
    if (found) {
      setOrder(found);
      const customers = deliveryCustomerStore.getAll();
      const cust = customers.find(c => c.name === found.customer);
      if (cust) setCustomer(cust);
      setLayout(loadLayout(found.company));
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => { if (!isEditing) window.print(); }, 100);
      return () => clearTimeout(timer);
    }
  }, [order, isEditing]);

  // Column resize handlers
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
      setColWidths(prev => { const next = [...prev]; next[colIdx] = newW; return next; });
    };
    const handleMouseUp = () => {
      if (resizing.current) {
        resizing.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try { localStorage.setItem(COL_WIDTHS_KEY, JSON.stringify(colWidths)); } catch {}
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
  }, [colWidths]);

  const updateLayout = (key: keyof LayoutConfig, value: any) => {
    setLayout(prev => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const resetAll = () => {
    if (!order) return;
    const reset = { ...DEFAULT_LAYOUT, title: `${order.company}送货单`, companyAddress: getCompanyAddress(order.company) };
    setLayout(reset);
    setColWidths([...DEFAULT_COL_WIDTHS]);
    try { localStorage.removeItem(LAYOUT_KEY); localStorage.removeItem(COL_WIDTHS_KEY); } catch {}
  };

  if (!order || !layout) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const totalAmount = order.items.reduce((s, i) => s + i.amount, 0);
  const tableRows = Array.from({ length: FIXED_ROWS }, (_, idx) => {
    if (idx < order.items.length) return { ...order.items[idx], isEmpty: false };
    return { id: `empty-${idx}`, materialCode: "", productName: "", spec: "", surface: "", qty: 0, unit: "", unitPrice: 0, amount: 0, remark: "", isEmpty: true };
  });

  const companyAddress = layout.companyAddress || getCompanyAddress(order.company);

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
          [contenteditable="true"] { border-bottom: none !important; }
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
          [contenteditable="true"]:hover { background: #eff6ff; border-radius: 2px; }
          [contenteditable="true"]:focus { background: #dbeafe; }
        }
      `}} />

      {/* Toolbar - only visible on screen */}
      <div className="no-print fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-2 items-center">
        <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 text-sm rounded-md font-medium ${isEditing ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
          {isEditing ? "✓ 编辑中" : "️ 编辑"}
        </button>
        {isEditing && (
          <>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-slate-500">标题:</span>
              <select value={layout.titleFontSize} onChange={e => updateLayout("titleFontSize", Number(e.target.value))} className="text-xs border rounded px-1 py-0.5">
                {[16,18,20,22,24,26,28].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">标签:</span>
              <select value={layout.labelFontSize} onChange={e => updateLayout("labelFontSize", Number(e.target.value))} className="text-xs border rounded px-1 py-0.5">
                {[12,13,14,15,16,17,18].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">表格:</span>
              <select value={layout.cellFontSize} onChange={e => updateLayout("cellFontSize", Number(e.target.value))} className="text-xs border rounded px-1 py-0.5">
                {[11,12,13,14,15,16].map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>
            <button onClick={resetAll} className="px-3 py-1.5 text-xs text-slate-600 hover:text-red-600 ml-2">重置</button>
          </>
        )}
        <button onClick={() => window.print()} className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 ml-2">打印</button>
        <button onClick={() => window.close()} className="px-3 py-1.5 bg-slate-400 text-white text-sm rounded-md hover:bg-slate-500">关闭</button>
      </div>

      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        <div style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", marginLeft: "2mm" }}>

          {/* Title */}
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0, marginBottom: "5mm" }}>
            <h1 style={{ fontSize: `${layout.titleFontSize}px`, fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              <EditableText value={layout.title} fontSize={layout.titleFontSize} style={{ fontWeight: "bold", letterSpacing: "2px" }} isEditing={isEditing} onBlur={v => updateLayout("title", v)} />
            </h1>
          </div>

          {/* Header info */}
          <div style={{ fontSize: `${layout.labelFontSize}px`, lineHeight: "1.4", padding: "0 2mm", flexShrink: 0, height: "26mm", boxSizing: "border-box", overflow: "visible" }}>
            <div className="flex" style={{ alignItems: "stretch" }}>
              {/* Left: customer info */}
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div><span className="font-bold">客户名称：</span><EditableText value={order.customer} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">客户地址：</span><EditableText value={customer?.address || ""} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div><span className="font-bold">联系电话：</span><EditableText value={customer?.phone || ""} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div><span className="font-bold">联系人：</span><EditableText value={customer?.contact || ""} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
              </div>
              {/* Right: order info */}
              <div style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: "5mm" }}>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">NO：</span><span className="font-mono font-bold" style={{ fontSize: `${layout.labelFontSize}px` }}>{order.noteNo}</span></div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">送货日期：</span>{order.date}</div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">订单号：</span>{order.orderNo || ""}</div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">付款方式：</span><EditableText value={customer?.paymentTerms || ""} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse" style={{ fontSize: `${layout.cellFontSize}px`, tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}mm` }} />)}
            </colgroup>
            <thead>
              <tr style={{ height: "5mm", borderTop: "none" }}>
                {layout.headerLabels.map((label, i) => (
                  <th key={i} style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>
                    <EditableText value={label} fontSize={layout.cellFontSize} style={{ fontWeight: "bold" }} isEditing={isEditing} onBlur={v => {
                      const newLabels = [...layout.headerLabels];
                      newLabels[i] = v;
                      updateLayout("headerLabels", newLabels);
                    }} />
                    <span className="resize-handle no-print" onMouseDown={e => handleMouseDown(e, i)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((item, idx) => (
                <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : idx + 1}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold" }}>{item.materialCode}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.productName}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.spec}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.surface}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : item.qty}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.unit}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : item.amount.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                <td colSpan={8} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2mm", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px` }}>
                  <span style={{ fontWeight: "bold" }}>合计人民币（大写）：{numToCN(totalAmount)}</span>
                </td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px`, fontWeight: "bold" }}>¥{totalAmount > 0 ? totalAmount.toFixed(2) : "0.00"}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}` }}></td>
              </tr>
            </tfoot>
          </table>

          {/* Footer */}
          <div style={{ fontSize: "13px", padding: "1mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "visible" }}>
            <div style={{ marginBottom: "0.3mm", fontSize: "13px", color: "#333" }}>
              <EditableText value={layout.footerNote} fontSize={13} isEditing={isEditing} onBlur={v => updateLayout("footerNote", v)} />
            </div>
            <div style={{ marginBottom: "0.5mm", fontSize: "13px" }}>
              <span className="font-bold">公司地址：</span><EditableText value={companyAddress} fontSize={13} isEditing={isEditing} onBlur={v => updateLayout("companyAddress", v)} />
            </div>
            <div className="flex justify-between" style={{ fontSize: "13px", paddingTop: "0.5mm" }}>
              <span><span className="font-bold"><EditableText value={layout.makerLabel} fontSize={13} isEditing={isEditing} onBlur={v => updateLayout("makerLabel", v)} />：</span><EditableText value={layout.maker} fontSize={13} isEditing={isEditing} onBlur={v => updateLayout("maker", v)} /></span>
              <span><span className="font-bold"><EditableText value={layout.signLabel} fontSize={13} isEditing={isEditing} onBlur={v => updateLayout("signLabel", v)} />：</span><span style={{ display: "inline-block", width: "20mm" }}></span></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
