"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { productStore, supplierStore, deliveryCustomerStore } from "@/lib/store";

type Kind = "product" | "supplier" | "customer";
export type { Kind };

interface ImportRow {
  cells: Record<string, string>;
  valid: boolean;
}

const COLS: Record<Kind, { header: string; key: string; wch: number }[]> = {
  product: [
    { header: "产品编号", key: "编号", wch: 14 },
    { header: "产品名称", key: "名称", wch: 18 },
    { header: "规格尺寸", key: "规格", wch: 14 },
    { header: "米重(kg/m)", key: "米重", wch: 12 },
    { header: "材质", key: "材质", wch: 12 },
    { header: "默认供应商", key: "供应商", wch: 16 },
  ],
  supplier: [
    { header: "供应商名称", key: "名称", wch: 18 },
    { header: "联系人", key: "联系人", wch: 12 },
    { header: "手机/电话", key: "电话", wch: 14 },
    { header: "地址", key: "地址", wch: 20 },
  ],
  customer: [
    { header: "单位名称", key: "名称", wch: 18 },
    { header: "联系人", key: "联系人", wch: 12 },
    { header: "联系电话", key: "电话", wch: 14 },
    { header: "联系地址", key: "地址", wch: 20 },
  ],
};

const TITLES: Record<Kind, string> = { product: "导入产品", supplier: "导入供应商", customer: "导入客户" };
const SHEETS: Record<Kind, string> = { product: "产品库导入模板", supplier: "供应商导入模板", customer: "客户导入模板" };
const EXAMPLES: Record<Kind, (string | number)[]> = {
  product: ["TY-6001", "铝型材60系列", "60*40*2.0", 1.5, "6063-T5", "科丽"],
  supplier: ["科丽", "欧阳先生", "18666506359", "里水镇"],
  customer: ["示例客户公司", "张三", "13900000000", "佛山市南海区"],
};

// 纯内容面板（无遮罩），供「新增」对话框内嵌
export function ImportPanel({ kind, onImported, onDone }: { kind: Kind; onImported?: () => void; onDone?: () => void }) {
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const cols = COLS[kind];
  const validCount = rows ? rows.filter(r => r.valid).length : 0;

  const downloadTemplate = () => {
    const aoa: Array<Array<string | number>> = [cols.map(c => c.header)];
    aoa.push(EXAMPLES[kind]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = cols.map(c => ({ wch: c.wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = SHEETS[kind] + ".xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws: any = wb.Sheets[wb.SheetNames[0]];
      const data: any[] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });
      const body = data.slice(1);
      const parsed: ImportRow[] = body.map((raw: any) => {
        const cells: Record<string, string> = {};
        const arr: any[] = Array.isArray(raw) ? raw : [];
        cols.forEach((c, idx) => {
          const v = arr[idx];
          cells[c.key] = v === null || v === undefined ? "" : String(v).trim();
        });
        // 名称必填；产品带编号视为有效
        const name = cells["名称"] || "";
        const id = cells["编号"] || "";
        const valid = kind === "product" ? (id !== "" || name !== "") : name !== "";
        return { cells, valid };
      });
      setRows(parsed.filter(r => Object.values(r.cells).some(v => v !== "")));
      setFileName(file.name);
    } catch (err) {
      setResult("解析失败：" + err);
    }
  };

  const doImport = () => {
    if (!rows) return;
    let n = 0;
    rows.forEach(r => {
      if (!r.valid) return;
      const c = r.cells;
      let missing = "";
      if (kind === "product") {
        const wm = parseFloat(c["米重"]);
        const id = c["编号"] || "";
        // PLT 开头自动识别为板材，与库存页判断一致；否则为型材
        const isPlate = /^PLT/i.test(id);
        productStore.add({
          id: id,
          name: c["名称"] || "",
          spec: c["规格"] || "",
          weightPerMeter: isPlate ? undefined : (isNaN(wm) ? undefined : wm),
          material: c["材质"] || "",
          defaultSupplier: c["供应商"] || "",
          productType: isPlate ? "plate" : "profile",
        });
      } else if (kind === "supplier") {
        supplierStore.add({
          name: c["名称"] || "",
          contact: c["联系人"] || "",
          phone: c["电话"] || "",
          address: c["地址"] || "",
        });
      } else {
        deliveryCustomerStore.add({
          name: c["名称"] || "",
          contact: c["联系人"] || "",
          phone: c["电话"] || "",
          address: c["地址"] || "",
          taxNo: "",
          legalPerson: "",
          email: "",
          paymentTerms: "",
        });
      }
      void missing;
      n++;
    });
    setResult("成功导入 " + n + " 条" + (rows.length - validCount > 0 ? "，跳过 " + (rows.length - validCount) + " 条空记录" : ""));
    setRows(null);
    setFileName("");
    if (onImported) onImported();
    if (onDone) onDone();
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <p className="text-xs text-slate-500">下载模板 → 填好数据 → 上传 Excel → 预览确认后一键导入。</p>
        <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          下载模板
        </button>
      </div>

      <label className="flex items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-5 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
        <input type="file" accept=".xlsx,.xls" className="hidden"
          onChange={(e) => { const f = e.target.files ? e.target.files[0] : null; if (f) handleFile(f); e.target.value = ""; }} />
        <div className="text-center">
          <svg className="w-7 h-7 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" /></svg>
          <div className="mt-2 text-sm text-slate-600">点击选择 Excel 文件</div>
          <div className="text-xs text-slate-400 mt-1">支持 .xlsx / .xls</div>
        </div>
      </label>
      {fileName ? <div className="mt-2 text-sm text-slate-500">已选择：{fileName}</div> : null}

      {rows ? (
        <div className="mt-3">
          <div className="flex items-center justify-between px-4 py-2 border border-slate-200 bg-slate-50 rounded-t-md">
            <div className="text-sm text-slate-600">
              解析到 <span className="font-medium text-slate-900">{rows.length}</span> 条，其中有效 <span className="font-medium text-green-600">{validCount}</span> 条
              {rows.length - validCount > 0 ? <span className="text-amber-600 ml-2">（{rows.length - validCount} 行缺名称将跳过）</span> : null}
            </div>
            <button onClick={doImport} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              确认导入 {validCount} 条
            </button>
          </div>
          <div className="max-h-56 overflow-auto border border-t-0 border-slate-200 rounded-b-md">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-200">
                  {cols.map(c => <th key={c.key} className="text-left px-3 py-2 font-medium text-slate-600">{c.header}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${r.valid ? "" : "bg-red-50/50"}`}>
                    {cols.map(c => <td key={c.key} className={`px-3 py-1.5 ${r.valid ? "" : "text-red-400"}`}>{r.cells[c.key] || "-"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className={"mt-3 px-4 py-3 rounded-lg border text-sm " + (result.indexOf("成功") === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700")}>
          {result}
          {result.indexOf("成功") === 0 && onDone ? (
            <button onClick={onDone} className="ml-3 text-blue-600 underline">完成</button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// 独立弹窗版（兼容旧入口，一般不直接使用）
export default function ImportDialog({ kind, onClose, onImported }: { kind: Kind; onClose: () => void; onImported?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">批量{TITLES[kind]}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">
          <ImportPanel kind={kind} onImported={onImported} onDone={onClose} />
        </div>
      </div>
    </div>
  );
}