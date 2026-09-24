"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const BORDER_COLOR = "#2563eb";
const CONTENT_WIDTH = "190mm";
const DEFAULT_COL_WIDTHS = [7, 22, 18, 22, 22, 20, 16, 10, 12, 14, 17];
const COL_WIDTHS_KEY = "reconciliation_col_widths_v1";
const LAYOUT_KEY = "reconciliation_layout_v1";

interface LayoutConfig {
  title: string;
  titleFontSize: number;
  labelFontSize: number;
  cellFontSize: number;
  headerLabels: string[];
  makerLabel: string;
  maker: string;
  signLabel: string;
}

const DEFAULT_LAYOUT: LayoutConfig = {
  title: "",
  titleFontSize: 22,
  labelFontSize: 15,
  cellFontSize: 14,
  headerLabels: ["序号", "送货单号", "送货日期", "物料编号", "产品名称", "规格", "表面处理", "单位", "数量", "单价", "金额"],
  makerLabel: "制单人",
  maker: "易金兰",
  signLabel: "客户确认签字",
};

function loadLayout(companyName: string): LayoutConfig {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_LAYOUT, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_LAYOUT, title: `${companyName}对帐单` };
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
      style={{ ...style, fontSize: `${fontSize}px`, fontFamily: "仿宋", outline: "none", borderBottom: isEditing ? "1px dashed #93c5fd" : "none", minHeight: "1em", display: "inline-block" }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {text}
    </span>
  );
}

export default function PrintReconciliationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<ReconciliationOrder | null>(null);
  const [makerName, setMakerName] = useState("");
  const [makerHistory, setMakerHistory] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [colWidths, setColWidths] = useState<number[]>(loadColWidths);
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const resizing = useRef<{ colIdx: number; startX: number; startW: number } | null>(null);

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
      const companyName = getCompanyName();
      setLayout(loadLayout(companyName));
    }
  }, [order]);

  // 从关联的送货单中获取公司名称
  const getCompanyName = (): string => {
    if (order && order.items.length > 0) {
      const firstNoteNo = order.items[0].deliveryNoteNo;
      const allNotes = deliveryNoteStore.getAll();
      const note = allNotes.find(n => n.noteNo === firstNoteNo);
      if (note?.company) return note.company;
    }
    return "佛山市质稳五金有限公司";
  };

  const handleMakerChange = (val: string) => {
    setMakerName(val);
    if (val.trim()) saveMakerName(val.trim());
  };

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
    const companyName = getCompanyName();
    const reset = { ...DEFAULT_LAYOUT, title: `${companyName}对帐单` };
    setLayout(reset);
    setColWidths([...DEFAULT_COL_WIDTHS]);
    try { localStorage.removeItem(LAYOUT_KEY); localStorage.removeItem(COL_WIDTHS_KEY); } catch {}
  };

  if (!order || !layout) return <div className="p-6 text-center text-slate-400">加载中...</div>;

  const totalAmount = order.totalAmount || order.items.reduce((s, i) => s + i.amount, 0);
  const totalQty = order.totalQty || order.items.reduce((s, i) => s + i.qty, 0);
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
      <div className="no-print fixed bottom-0 left-0 right-0 z-50 flex gap-2 bg-white border-t border-slate-200 shadow px-4 py-2 items-center justify-center">
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

      {/* 打印区域 - 针式打印机连续纸 241mm x 140mm 横向 */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        <div style={{ width: CONTENT_WIDTH, display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", marginLeft: "2mm" }}>

          {/* 标题行 */}
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0, marginBottom: "3mm" }}>
            <h1 style={{ fontSize: `${layout.titleFontSize}px`, fontFamily: "仿宋", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              <EditableText value={layout.title} fontSize={layout.titleFontSize} style={{ fontWeight: "bold", letterSpacing: "2px" }} isEditing={isEditing} onBlur={v => updateLayout("title", v)} />
            </h1>
          </div>

          {/* 基本信息 */}
          <div style={{ fontSize: `${layout.labelFontSize}px`, fontFamily: "仿宋", lineHeight: "1.4", padding: "0 2mm", flexShrink: 0, boxSizing: "border-box", overflow: "visible", marginBottom: "2mm" }}>
            <div className="flex mb-0.5">
              <div className="flex" style={{ whiteSpace: "nowrap" }}>
                <span className="font-bold">对帐单编号：</span>
                <span className="font-mono">{order.orderNo}</span>
              </div>
            </div>
            <div className="flex mb-0.5">
              <div className="flex" style={{ whiteSpace: "nowrap" }}>
                <span className="font-bold">客户名称：</span>
                <EditableText value={order.customer} fontSize={layout.labelFontSize} isEditing={isEditing} />
              </div>
            </div>
            <div className="flex">
              <div className="flex mr-8" style={{ whiteSpace: "nowrap" }}>
                <span className="font-bold">起始日期：</span>
                <EditableText value={order.startDate} fontSize={layout.labelFontSize} isEditing={isEditing} />
              </div>
              <div className="flex" style={{ whiteSpace: "nowrap" }}>
                <span className="font-bold">截止日期：</span>
                <EditableText value={order.endDate} fontSize={layout.labelFontSize} isEditing={isEditing} />
              </div>
            </div>
          </div>

          {/* 明细表格 */}
          <table className="w-full border-collapse" style={{ fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋", tableLayout: "fixed", flexShrink: 0, border: "none" }}>
            <colgroup>
              {colWidths.map((w, i) => <col key={i} style={{ width: `${w}mm` }} />)}
            </colgroup>
            <thead>
              <tr style={{ height: "5mm" }}>
                {layout.headerLabels.map((label, i) => (
                  <th key={i} style={{ border: `1px solid ${BORDER_COLOR}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>
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
              {order.items.map((item, idx) => (
                <tr key={item.id} style={{ height: "7mm" }}>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{idx + 1}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "visible", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.deliveryNoteNo}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.deliveryDate}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", whiteSpace: "nowrap", overflow: "visible", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋", fontWeight: "bold" }}>{item.materialCode}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.productName}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.spec}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.surface}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.unit}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.qty}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.unitPrice.toFixed(2)}</td>
                  <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize}px`, fontFamily: "仿宋" }}>{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ height: "6mm" }}>
                <td colSpan={8} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2mm", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px`, fontFamily: "仿宋", textAlign: "right" }}>
                  <span style={{ fontWeight: "bold" }}>合计</span>
                </td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px`, fontFamily: "仿宋", fontWeight: "bold" }}>{totalQty}</td>
                <td style={{ border: `1px solid ${BORDER_COLOR}` }}></td>
                <td style={{ border: `1px solid ${BORDER_COLOR}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px`, fontFamily: "仿宋", fontWeight: "bold" }}>{totalAmount.toFixed(2)}</td>
              </tr>
              <tr style={{ height: "6mm" }}>
                <td colSpan={11} style={{ border: `1px solid ${BORDER_COLOR}`, padding: "0 2mm", verticalAlign: "middle", fontSize: `${layout.cellFontSize + 1}px`, fontFamily: "仿宋" }}>
                  <div className="flex justify-between items-center">
                    <div className="flex"><span style={{ fontWeight: "bold" }}>合计金额（大写）：</span><span>{amountToChinese(totalAmount)}</span></div>
                    <div className="flex"><span style={{ fontWeight: "bold" }}>（小写）：</span><span style={{ fontFamily: "monospace" }}>¥{totalAmount.toFixed(2)}</span></div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* 备注 */}
          {order.remark && (
            <div style={{ fontSize: "12px", padding: "1mm 2mm", flexShrink: 0 }}>
              <div className="flex">
                <span className="font-bold">备注：</span>
                <EditableText value={order.remark} fontSize={12} isEditing={isEditing} />
              </div>
            </div>
          )}

          {/* 签字栏 */}
          <div className="flex justify-between items-end text-[12px]" style={{ padding: "1mm 2mm", flexShrink: 0, marginTop: "auto" }}>
            <div className="flex items-center gap-2">
              <span className="font-bold">
                <EditableText value={layout.makerLabel} fontSize={12} isEditing={isEditing} onBlur={v => updateLayout("makerLabel", v)} />：
              </span>
              <EditableText value={order.maker || layout.maker} fontSize={12} isEditing={isEditing} onBlur={v => updateLayout("maker", v)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">
                <EditableText value={layout.signLabel} fontSize={12} isEditing={isEditing} onBlur={v => updateLayout("signLabel", v)} />：
              </span>
              <span style={{ display: "inline-block", width: "20mm" }}></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
