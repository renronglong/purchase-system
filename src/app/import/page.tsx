"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { productStore, supplierStore, deliveryCustomerStore } from "@/lib/store";

type TabKey = "product" | "supplier" | "customer";

interface ImportRow {
  cells: Record<string, string>;
  valid: boolean;
}

const TABS: { key: TabKey; title: string; desc: string; sheet: string }[] = [
  { key: "product", title: "产品库", desc: "产品名称、规格尺寸、米重、材质、默认供应商", sheet: "产品库导入模板" },
  { key: "supplier", title: "供应商", desc: "供应商名称、联系人、电话、地址", sheet: "供应商导入模板" },
  { key: "customer", title: "客户", desc: "单位名称、联系人、电话、地址", sheet: "客户导入模板" },
];

const COLS: Record<TabKey, { header: string; key: string; wch: number }[]> = {
  product: [
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

export default function ImportPage() {
  const [tab, setTab] = useState<TabKey>("product");
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const tabMeta = TABS.find(t => t.key === tab) || TABS[0];
  const cols = COLS[tab];
  const validCount = rows ? rows.filter(r => r.valid).length : 0;

  const downloadTemplate = () => {
    const aoa: Array<Array<string | number>> = [cols.map(c => c.header)];
    if (tab === "product") aoa.push(["铝型材60系列", "60*40*2.0", 1.5, "6063-T5", "科丽"]);
    if (tab === "supplier") aoa.push(["科丽", "欧阳先生", "18666506359", "里水镇"]);
    if (tab === "customer") aoa.push(["示例客户公司", "张三", "13900000000", "佛山市南海区"]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = cols.map(c => ({ wch: c.wch }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = tabMeta.sheet + ".xlsx";
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
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          cols.forEach((c, idx) => { cells[c.key] = ""; });
          cols.forEach((c) => {
            const v = raw[c.header];
            cells[c.key] = v === null || v === undefined ? "" : String(v).trim();
          });
        } else {
          const arr: any[] = raw || [];
          cols.forEach((c, idx) => {
            const v = arr[idx];
            cells[c.key] = v === null || v === undefined ? "" : String(v).trim();
          });
        }
        const name = cells["名称"] || "";
        return { cells, valid: name !== "" };
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
      if (tab === "product") {
        const wm = parseFloat(c["米重"]);
        productStore.add({
          name: c["名称"] || "",
          spec: c["规格"] || "",
          weightPerMeter: isNaN(wm) ? undefined : wm,
          material: c["材质"] || "",
          defaultSupplier: c["供应商"] || "",
          productType: "profile",
        });
      } else if (tab === "supplier") {
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
        });
      }
      n++;
    });
    setResult("成功导入 " + n + " 条" + (rows.length - validCount > 0 ? "，跳过 " + (rows.length - validCount) + " 条空记录" : ""));
    setRows(null);
    setFileName("");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">基础数据批量导入</h1>
      <p className="text-sm text-slate-500 mb-5">下载模板 → 填好数据 → 上传 Excel → 预览确认后一键导入</p>

      <div className="flex gap-2 mb-5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setRows(null); setResult(null); setFileName(""); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${tab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {t.title}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-medium text-slate-700">{tabMeta.title}导入</h3>
            <p className="text-xs text-slate-400 mt-0.5">{tabMeta.desc}</p>
          </div>
          <button onClick={downloadTemplate} className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            下载模板
          </button>
        </div>
        <label className="mt-4 flex items-center justify-center w-full border-2 border-dashed border-slate-200 rounded-lg px-4 py-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
          <input type="file" accept=".xlsx,.xls" className="hidden"
            onChange={(e) => { const f = e.target.files ? e.target.files[0] : null; if (f) { handleFile(f); } e.target.value = ""; }} />
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" /></svg>
            <div className="mt-2 text-sm text-slate-600">点击选择 Excel 文件，或拖拽到此处</div>
            <div className="text-xs text-slate-400 mt-1">支持 .xlsx / .xls</div>
          </div>
        </label>
        {fileName ? <div className="mt-3 text-sm text-slate-500">已选择：{fileName}</div> : null}
      </div>

      {rows ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              解析到 <span className="font-medium text-slate-900">{rows.length}</span> 条，其中有效 <span className="font-medium text-green-600">{validCount}</span> 条
              {rows.length - validCount > 0 ? <span className="text-amber-600 ml-2">（{rows.length - validCount} 行缺名称将跳过）</span> : null}
            </div>
            <button onClick={doImport} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
              确认导入 {validCount} 条
            </button>
          </div>
          <div className="max-h-96 overflow-auto">
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
        <div className={`px-4 py-3 rounded-lg border text-sm ${result.indexOf("成功") === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {result}
        </div>
      ) : null}
    </div>
  );
}