"use client";

import { useParams } from "next/navigation";
import * as XLSX from "xlsx";
import { quotationStore } from "@/lib/store";

export default function QuotationPrintPage() {
  const params = useParams<{ id: string }>();
  const q = quotationStore.getById(params.id);

  if (!q) {
    return <div className="p-6 text-center text-slate-400 py-24">未找到此报价单</div>;
  }

  const handleExportExcel = () => {
    const units = q.items.map((it) => it.unit || "");
    const sameUnit = units.length > 0 && units.every((u) => u === units[0]) && units[0] !== "";

    // 数据：row0-1 标题，row3-6 供需双方，row8 编号日期，row10 表头，之后明细、总计、条款
    const rows: (string | number)[][] = [
      [q.supplierCompany],
      ["报 价 单"],
      [],
      ["供方", q.supplierCompany, "客户名称", q.customerName],
      ["联系人", q.supplierContact, "联系人", q.customerContact],
      ["电话", q.supplierPhone, "电话", q.customerPhone],
      ["地址", q.supplierAddress, "地址", q.customerAddress],
      [],
      ["报价单编号", q.quoteNo, "报价日期", q.quoteDate],
      [],
      ["序号", "产品编号", "规格尺寸mm", "产品名称", "单位", "材质", "表面处理", "单价未税(元)", "含税价", "最小起订量", "模具费(元)", "备注"],
      ...q.items.map((it, idx) => [
        idx + 1,
        it.productCode || "",
        it.spec || "",
        it.productName || "",
        sameUnit ? "" : (it.unit || ""),
        it.material || "",
        it.surfaceTreatment || "",
        it.unitPrice ? it.unitPrice : "",
        it.taxPrice ? it.taxPrice : "",
        it.minOrderQty || "",
        it.moldFee ? it.moldFee : "",
        it.remark || "",
      ]),
      [],
      ["总计", "", "", "", "", "", "", (q.grandTotal || 0), "", "", "", ""],
      [],
      ...q.terms.map((t) => [t]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length - 1, c: 11 } });

    const cell = (r: number, c: number) => XLSX.utils.encode_cell({ r, c });

    // 标题：居中加粗加大
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center", vertical: "middle" } };
    const title2Style = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center", vertical: "middle" } };
    if (ws[cell(0, 0)]) ws[cell(0, 0)].s = titleStyle as any;
    if (ws[cell(1, 0)]) ws[cell(1, 0)].s = title2Style as any;

    // 供需双方信息区：标签加粗
    for (let r = 3; r <= 6; r++) {
      for (const c of [0, 2]) {
        if (ws[cell(r, c)]) ws[cell(r, c)].s = { font: { bold: true } } as any;
      }
    }
    if (ws[cell(8, 0)]) ws[cell(8, 0)].s = { font: { bold: true } } as any;
    if (ws[cell(8, 2)]) ws[cell(8, 2)].s = { font: { bold: true } } as any;

    // 明细表区域：row10(表头) 至 总计行 row13+items.length-1
    const headRow = 10;
    const totalRow = headRow + q.items.length + 1; // 明细后空一行再总计
    const tableStart = headRow;
    const tableEnd = totalRow;
    const border = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };
    // 表头：底色 + 加粗 + 居中
    for (let c = 0; c <= 11; c++) {
      const addr = cell(headRow, c);
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      ws[addr].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "middle" }, fill: { fgColor: { rgb: "D9E1F2" } }, border } as any;
    }
    // 明细 + 总计行：边框、垂直居中
    for (let r = tableStart; r <= tableEnd; r++) {
      for (let c = 0; c <= 11; c++) {
        const addr = cell(r, c);
        if (!ws[addr]) ws[addr] = { t: "s", v: "" };
        const prev = ws[addr].s || {};
        ws[addr].s = {
          ...(prev as object),
          vertical: "middle",
          alignment: { horizontal: c === 7 || c === 8 || c === 10 ? "right" : "center", vertical: "middle" },
          border,
        } as any;
      }
    }
    // 总计行：加粗
    for (let c = 0; c <= 11; c++) {
      const addr = cell(totalRow, c);
      if (ws[addr]) ws[addr].s = { ...(ws[addr].s as object), font: { bold: true } } as any;
    }

    // 合并：标题跨列 + 单位列纵向合并
    const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
    ];
    if (sameUnit) {
      merges.push({ s: { r: headRow + 1, c: 4 }, e: { r: headRow + q.items.length, c: 4 } });
      const unitCell = cell(headRow + 1, 4);
      ws[unitCell] = { t: "s", v: units[0] };
    }
    ws["!merges"] = merges as any;

    // 列宽
    ws["!cols"] = [
      { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 6 },
      { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 24 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "报价单");
    const filename = `${q.quoteNo || "报价单"}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="max-w-[980px] mx-auto flex justify-end gap-2 mb-4 no-print">
        <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700">导出Excel</button>
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">打印</button>
      </div>

      <div className="bg-white max-w-[980px] mx-auto p-8 shadow-sm" id="print-area">
        {/* 顶部公司名 + 标题 */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold tracking-widest text-slate-900">{q.supplierCompany}</div>
          <div className="mt-2 text-2xl font-semibold tracking-[0.5em] text-slate-900">报 价 单</div>
        </div>

        {/* 供需双方 */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div><span className="text-slate-500">供方：</span><span className="font-medium">{q.supplierCompany}</span></div>
            <div className="mt-1"><span className="text-slate-500">联系人：</span>{q.supplierContact}</div>
            <div><span className="text-slate-500">电话：</span>{q.supplierPhone}</div>
            <div><span className="text-slate-500">地址：</span>{q.supplierAddress}</div>
          </div>
          <div>
            <div><span className="text-slate-500">客户名称：</span><span className="font-medium">{q.customerName}</span></div>
            <div className="mt-1"><span className="text-slate-500">联系人：</span>{q.customerContact}</div>
            <div><span className="text-slate-500">电话：</span>{q.customerPhone}</div>
            <div><span className="text-slate-500">地址：</span>{q.customerAddress}</div>
          </div>
        </div>

        {/* 编号 + 日期 */}
        <div className="flex justify-between text-sm mb-4">
          <div><span className="text-slate-500">报价单编号：</span><span className="font-mono font-semibold">{q.quoteNo}</span></div>
          <div><span className="text-slate-500">报价日期：</span>{q.quoteDate}</div>
        </div>

        {/* 报价明细表 */}
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr className="bg-slate-50">
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-center w-8">序号</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">产品编号</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">规格尺寸mm</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">产品名称</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">单位</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">材质</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">表面处理</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">单价未税(元)</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">含税价</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">最小起订量</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700 text-right">模具费(元)</th>
              <th className="border border-slate-400 px-2 py-2 font-medium text-slate-700">备注</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{idx + 1}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.productCode}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.spec}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.productName}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.unit}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.material}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.surfaceTreatment}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.unitPrice ? it.unitPrice.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.taxPrice ? it.taxPrice.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.minOrderQty || ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-right">{it.moldFee ? it.moldFee.toFixed(2) : ""}</td>
                <td className="border border-slate-400 px-2 py-1.5 text-center">{it.remark}</td>
              </tr>
            ))}
            {/* 空行填充 */}
            {q.items.length < 6 && Array.from({ length: 6 - q.items.length }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
                <td className="border border-slate-400 px-2 py-2.5"></td>
              </tr>
            ))}
            <tr>
              <td colSpan={7} className="border border-slate-400 px-2 py-1.5 text-right font-medium text-slate-700">总计</td>
              <td className="border border-slate-400 px-2 py-1.5 text-right font-semibold">{(q.grandTotal || 0).toFixed(2)}</td>
              <td colSpan={4} className="border border-slate-400 py-1.5"></td>
            </tr>
          </tbody>
        </table>

        {/* 条款 */}
        <div className="text-sm mb-8 leading-6 text-slate-800">
          {q.terms.map((t, i) => (
            <div key={i}>{t}</div>
          ))}
        </div>

        {/* 签章 */}
        <div className="flex justify-between text-sm mt-4">
          <div>
            <div className="font-medium mb-10">需方（签章）</div>
            <div className="border-t border-slate-800 pt-1">日期：</div>
          </div>
          <div>
            <div className="font-medium mb-10">供方（签章）</div>
            <div className="border-t border-slate-800 pt-1">日期：</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}