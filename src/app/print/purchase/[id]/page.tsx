"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { purchaseOrderStore, type PurchaseOrder } from "@/lib/store";

const BORDER_COLOR = "#2563eb";
const BORDER_COLOR_PLATE = "#ea580c";
const FIXED_ROWS = 6;
const ROW_HEIGHT = "8mm";
const CONTENT_WIDTH = "190mm";

// 型材表11列，板材表9列
const DEFAULT_XC_COL_WIDTHS = [8, 36, 25, 24, 13, 14, 8, 20, 18, 22, 24];
const DEFAULT_BC_COL_WIDTHS = [8, 38, 43, 19, 10, 19, 18, 24, 36];
const XC_COL_WIDTHS_KEY = "purchase_xc_col_widths_v1";
const BC_COL_WIDTHS_KEY = "purchase_bc_col_widths_v1";
const LAYOUT_KEY = "purchase_layout_v1";

interface LayoutConfig {
  title: string;
  plateLabel: string;
  titleFontSize: number;
  labelFontSize: number;
  cellFontSize: number;
  xcHeaderLabels: string[];
  bcHeaderLabels: string[];
  companyAddress: string;
  makerLabel: string;
  maker: string;
  signLabel: string;
}

const DEFAULT_XC_HEADERS = ["序号","产品编号","产品名称","规格","长度mm","数量","单位","理论重量KG","表面处理","交货时间","备注"];
const DEFAULT_BC_HEADERS = ["序号","产品编号","规格尺寸mm","数量","单位","刀数","材质","交货时间","备注"];

const DEFAULT_LAYOUT: LayoutConfig = {
  title: "",
  plateLabel: "（板材）",
  titleFontSize: 22,
  labelFontSize: 15,
  cellFontSize: 14,
  xcHeaderLabels: [...DEFAULT_XC_HEADERS],
  bcHeaderLabels: [...DEFAULT_BC_HEADERS],
  companyAddress: "",
  makerLabel: "制单人",
  maker: "易金兰",
  signLabel: "供应商回签",
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
      return {
        ...DEFAULT_LAYOUT,
        ...parsed,
        xcHeaderLabels: parsed.xcHeaderLabels || [...DEFAULT_XC_HEADERS],
        bcHeaderLabels: parsed.bcHeaderLabels || [...DEFAULT_BC_HEADERS],
        companyAddress: parsed.companyAddress || getCompanyAddress(company),
      };
    }
  } catch {}
  return { ...DEFAULT_LAYOUT, title: `${company || "佛山市质稳五金有限公司"}采购单`, companyAddress: getCompanyAddress(company) };
}

function loadXcColWidths(): number[] {
  try {
    const saved = localStorage.getItem(XC_COL_WIDTHS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_XC_COL_WIDTHS.length) return parsed;
    }
  } catch {}
  return [...DEFAULT_XC_COL_WIDTHS];
}

function loadBcColWidths(): number[] {
  try {
    const saved = localStorage.getItem(BC_COL_WIDTHS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_BC_COL_WIDTHS.length) return parsed;
    }
  } catch {}
  return [...DEFAULT_BC_COL_WIDTHS];
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

export default function PrintPurchasePage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [xcColWidths, setXcColWidths] = useState<number[]>(loadXcColWidths);
  const [bcColWidths, setBcColWidths] = useState<number[]>(loadBcColWidths);
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const resizing = useRef<{ table: "xc" | "bc"; colIdx: number; startX: number; startW: number } | null>(null);

  const load = useCallback(() => {
    const found = purchaseOrderStore.getById(orderId);
    if (found) {
      setOrder(found);
      setLayout(loadLayout(found.company));
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Column resize handlers
  const handleMouseDown = (e: React.MouseEvent, table: "xc" | "bc", colIdx: number) => {
    e.preventDefault();
    const widths = table === "xc" ? xcColWidths : bcColWidths;
    resizing.current = { table, colIdx, startX: e.clientX, startW: widths[colIdx] };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing.current) return;
      const { table, colIdx, startX, startW } = resizing.current;
      const dx = e.clientX - startX;
      const mmPerPx = 241 / window.innerWidth;
      const delta = Math.round(dx * mmPerPx * 10) / 10;
      const newW = Math.max(5, Math.round((startW + delta) * 10) / 10);
      if (table === "xc") {
        setXcColWidths(prev => { const next = [...prev]; next[colIdx] = newW; return next; });
      } else {
        setBcColWidths(prev => { const next = [...prev]; next[colIdx] = newW; return next; });
      }
    };
    const handleMouseUp = () => {
      if (resizing.current) {
        const { table } = resizing.current;
        resizing.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        try {
          if (table === "xc") {
            localStorage.setItem(XC_COL_WIDTHS_KEY, JSON.stringify(xcColWidths));
          } else {
            localStorage.setItem(BC_COL_WIDTHS_KEY, JSON.stringify(bcColWidths));
          }
        } catch {}
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => { document.removeEventListener("mousemove", handleMouseMove); document.removeEventListener("mouseup", handleMouseUp); };
  }, [xcColWidths, bcColWidths]);

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
    const reset = { ...DEFAULT_LAYOUT, title: `${order.company || "佛山市质稳五金有限公司"}采购单`, companyAddress: getCompanyAddress(order.company) };
    setLayout(reset);
    setXcColWidths([...DEFAULT_XC_COL_WIDTHS]);
    setBcColWidths([...DEFAULT_BC_COL_WIDTHS]);
    try { localStorage.removeItem(LAYOUT_KEY); localStorage.removeItem(XC_COL_WIDTHS_KEY); localStorage.removeItem(BC_COL_WIDTHS_KEY); } catch {}
  };

  if (!order || !layout) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const isPlate = (order.orderType || "profile") === "plate";
  const bc = isPlate ? BORDER_COLOR_PLATE : BORDER_COLOR;

  const tableRows = Array.from({ length: FIXED_ROWS }, (_, idx) => {
    if (idx < order.items.length) {
      return { ...order.items[idx], isEmpty: false };
    }
    return {
      id: `empty-${idx}`,
      productCode: "",
      productName: "",
      spec: "",
      length: 0,
      quantity: 0,
      unit: "",
      totalWeight: 0,
      surfaceTreatment: "",
      deliveryDate: "",
      remark: "",
      material: "",
      sheetsCount: 0,
      piecesPerSheet: 0,
      actualOutput: 0,
      bladeCount: 0,
      isEmpty: true,
    } as any;
  });

  const companyAddress = layout.companyAddress || getCompanyAddress(order.company || "");

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

      {/* Bottom toolbar */}
      <div className="no-print fixed bottom-0 left-0 right-0 z-50 flex gap-2 bg-white border-t border-slate-200 shadow px-4 py-2 items-center justify-center">
        <button onClick={() => setIsEditing(!isEditing)} className={`px-3 py-1.5 text-sm rounded-md font-medium ${isEditing ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
          {isEditing ? "✓ 编辑中" : "✏️ 编辑"}
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

      {/* 打印区域 */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        <div style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", marginLeft: "2mm" }}>

          {/* 标题 */}
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0, marginBottom: "5mm" }}>
            <h1 style={{ fontSize: `${layout.titleFontSize}px`, fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              <EditableText value={(order.company || "佛山市质稳五金有限公司") + "采购单"} fontSize={layout.titleFontSize} style={{ fontWeight: "bold", letterSpacing: "2px" }} isEditing={isEditing} onBlur={v => updateLayout("title", v)} />
              {isPlate && <EditableText value={layout.plateLabel} fontSize={14} style={{ color: bc, marginLeft: "8px" }} isEditing={isEditing} onBlur={v => updateLayout("plateLabel", v)} />}
            </h1>
          </div>

          {/* 表头信息 */}
          <div style={{ fontSize: `${layout.labelFontSize}px`, lineHeight: "1.3", padding: "0 2mm", flexShrink: 0, height: "20mm", boxSizing: "border-box", overflow: "visible", marginBottom: "0" }}>
            <div className="flex" style={{ alignItems: "stretch" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">供应商：</span><EditableText value={order.supplierName} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">联系人：</span><EditableText value={order.contact} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">地址：</span><EditableText value={order.address || ""} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
              </div>
              <div style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: "5mm" }}>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">编号：</span><span className="font-mono font-bold" style={{ fontSize: `${layout.labelFontSize}px` }}>{order.orderNo}</span></div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">电话：</span><EditableText value={order.phone} fontSize={layout.labelFontSize} isEditing={isEditing} /></div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">制单日期：</span>{order.orderDate}</div>
              </div>
            </div>
          </div>

          {/* 型材明细表格 */}
          {!isPlate && (
            <table className="w-full border-collapse" style={{ fontSize: `${layout.cellFontSize}px`, tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
              <colgroup>
                {xcColWidths.map((w, i) => <col key={i} style={{ width: `${w}mm` }} />)}
              </colgroup>
              <thead>
                <tr style={{ height: "5mm", borderTop: "none" }}>
                  {layout.xcHeaderLabels.map((label, i) => (
                    <th key={i} style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, whiteSpace: "nowrap" }}>
                      <EditableText value={label} fontSize={layout.cellFontSize} style={{ fontWeight: "bold" }} isEditing={isEditing} onBlur={v => {
                        const newLabels = [...layout.xcHeaderLabels];
                        newLabels[i] = v;
                        updateLayout("xcHeaderLabels", newLabels);
                      }} />
                      <span className="resize-handle no-print" onMouseDown={e => handleMouseDown(e, "xc", i)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : idx + 1}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: `${layout.cellFontSize - 1}px`, fontWeight: "bold" }}>{item.productCode}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.productName}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.spec}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : item.length}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : item.quantity}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.unit}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "monospace" }}>{item.isEmpty ? "" : item.totalWeight.toFixed(2)}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.surfaceTreatment}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.deliveryDate}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.remark}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ height: "6mm" }}>
                  <td colSpan={5} style={{ border: `1px solid ${bc}`, padding: "0 2mm", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold", textAlign: "right" }}>合计</td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold" }}>{order.totalQuantity}</td>
                  <td style={{ border: `1px solid ${bc}` }}></td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold", fontFamily: "monospace" }}>{order.totalWeight.toFixed(2)}</td>
                  <td colSpan={4} style={{ border: `1px solid ${bc}` }}></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 板材明细表格 */}
          {isPlate && (
            <table className="w-full border-collapse" style={{ fontSize: `${layout.cellFontSize}px`, tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
              <colgroup>
                {bcColWidths.map((w, i) => <col key={i} style={{ width: `${w}mm` }} />)}
              </colgroup>
              <thead>
                <tr style={{ height: "5mm", borderTop: "none" }}>
                  {layout.bcHeaderLabels.map((label, i) => (
                    <th key={i} style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, whiteSpace: "nowrap" }}>
                      <EditableText value={label} fontSize={layout.cellFontSize} style={{ fontWeight: "bold" }} isEditing={isEditing} onBlur={v => {
                        const newLabels = [...layout.bcHeaderLabels];
                        newLabels[i] = v;
                        updateLayout("bcHeaderLabels", newLabels);
                      }} />
                      <span className="resize-handle no-print" onMouseDown={e => handleMouseDown(e, "bc", i)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : idx + 1}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: `${layout.cellFontSize - 1}px`, fontWeight: "bold" }}>{item.productCode}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.spec}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : (item.sheetsCount || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : "张"}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.isEmpty ? "" : ((item.bladeCount || 0) * (item.sheetsCount || 0) || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px` }}>{item.material || ""}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.deliveryDate}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px` }}>{item.remark}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ height: "6mm" }}>
                  <td colSpan={3} style={{ border: `1px solid ${bc}`, padding: "0 2mm", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold", textAlign: "right" }}>合计</td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold" }}>{order.totalSheets ?? 0}</td>
                  <td style={{ border: `1px solid ${bc}` }}></td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontWeight: "bold" }}>{order.items.reduce((s: number, it: any) => s + (it.bladeCount || 0) * (it.sheetsCount || 0), 0)}</td>
                  <td colSpan={3} style={{ border: `1px solid ${bc}` }}></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 底部区域 */}
          <div style={{ fontSize: "13px", padding: "1mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "visible" }}>
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
