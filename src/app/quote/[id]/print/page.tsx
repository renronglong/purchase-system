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
    const items = q.items;

    // 按模板 A1:L36 精确布局构建行（0-based 行号）
    // 明细固定 15 行（模板 A10:L24），不足补空，超出追加
    const maxDetailRows = 15;
    const detailRows = items.length > maxDetailRows ? items.length : maxDetailRows;

    const rows: (string | number)[][] = [
      [q.supplierCompany],                                                     // 0: A1 公司名
      ["报 价 单"],                                                           // 1: A2 标题
      [],
      ["供方：" + (q.supplierCompany || "")],                                 // 3: A4
      ["联系人：" + (q.supplierContact || "")],                               // 4: A5
      ["电话：" + (q.supplierPhone || "")],                                   // 5: A6
      ["地址：" + (q.supplierAddress || "")],                                 // 6: A7
      ["报价单编号：" + (q.quoteNo || "")],                                   // 7: A8
      [],                                                                     // 8 空行（表头前）
      ["序号", "产品编号", "规格尺寸mm", "产品名称", "单位", "材质", "表面处理", "单价未税(元)", "含税价", "最小起订量", "模具费RMB(元)", "备注"], // 9: 表头
    ];
    // 明细行：模板明细从第10行(0-based 10)开始
    for (let i = 0; i < detailRows; i++) {
      const it = items[i];
      if (i < items.length) {
        rows.push([
          i + 1,
          it.productCode || "",
          it.spec || "",
          it.productName || "",
          it.unit || "",
          it.material || "",
          it.surfaceTreatment || "",
          it.unitPrice ? it.unitPrice : "",
          it.taxPrice ? it.taxPrice : "",
          it.minOrderQty || "",
          it.moldFee ? it.moldFee : "",
          it.remark || "",
        ]);
      } else {
        rows.push([i + 1, "", "", "", "", "", "", "", "", "", "", ""]);
      }
    }
    // 总计行
    rows.push(["总计", "", "", "", "", "", (q.grandTotal || 0), "", "", "", "", ""]);
    // 条款说明
    const terms = q.terms && q.terms.length ? q.terms : [
      "1：依照图纸进行开模及送样。",
      "2：此报价含运费",
      "3：付款方式：",
      "4：此报价单有效期为x天",
      "5：开模时间x个工作日，出样x个工作日",
    ];
    rows.push([]);
    terms.forEach((t, i) => rows.push([t]));
    rows.push([]);
    rows.push(["需方（签章）"]);
    rows.push([]);
    rows.push([]);
    rows.push(["日期:"]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const cell = (r: number, c: number) => XLSX.utils.encode_cell({ r, c });

    // 列宽（对照模板）
    ws["!cols"] = [
      { wch: 6.5 }, { wch: 15 }, { wch: 19 }, { wch: 24 }, { wch: 5.5 },
      { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 11 }, { wch: 12 },
      { wch: 10 }, { wch: 13 },
    ];

    // 表头行 = 9
    const headRow = 9;
    const totalRow = headRow + detailRows + 1; // 明细后是总计

    // 边框（细线黑）
    const thin = {
      style: "thin" as const,
      color: { rgb: "000000" },
    };
    const border = { top: thin, bottom: thin, left: thin, right: thin };

    // 表头 + 明细 + 总计：加边框、垂直居中
    const styleCell = (r: number, c: number, horizontal: string, bold?: boolean, bg?: string) => {
      const addr = cell(r, c);
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      ws[addr].s = {
        alignment: { horizontal, vertical: "middle", wrapText: true },
        border,
        ...(bold ? { font: { bold: true } } : {}),
        ...(bg ? { fill: { fgColor: { rgb: bg } } } : {}),
      } as any;
    };

    // 表头行：居中加粗浅色底
    for (let c = 0; c <= 11; c++) styleCell(headRow, c, "center", true, "D9E1F2");
    // 明细行
    for (let r = headRow + 1; r <= totalRow; r++) {
      for (let c = 0; c <= 11; c++) {
        styleCell(r, c, c === 0 || c === 4 || c === 5 || c === 6 ? "center" : "left");
      }
    }
    // 总计行加粗
    for (let c = 0; c <= 11; c++) {
      const addr = cell(totalRow, c);
      styleCell(totalRow, c, c === 6 ? "right" : "left", true);
    }

    // 标题：居中加粗加大
    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: "center", vertical: "middle" } } as any;
    if (ws[cell(0, 0)]) ws[cell(0, 0)].s = titleStyle;
    if (ws[cell(1, 0)]) ws[cell(1, 0)].s = { ...titleStyle, font: { bold: true, sz: 20 } };
    // 信息区标签加粗
    for (let r = 3; r <= 7; r++) {
      if (ws[cell(r, 0)]) ws[cell(r, 0)].s = { font: { bold: true } } as any;
    }
    // 需方/供方签章加粗
    // 签章行：总计行 + 条款前空1 + 条款 + 条款后空1 + 1 = totalRow + terms.length + 3
    let r = totalRow + terms.length + 3;
    if (ws[cell(r, 0)]) ws[cell(r, 0)].s = { font: { bold: true } } as any;

    // 合并跨列：
    const merges: { s: { r: number; c: number }; e: { r: number; c: number } }[] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },        // 公司名 A1:L1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },        // 报价单 A2:L2
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } },         // 供方 A4:F4
      { s: { r: 3, c: 6 }, e: { r: 3, c: 11 } },        // 客户名称 G4:L4
      { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } },
      { s: { r: 4, c: 6 }, e: { r: 4, c: 11 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } },
      { s: { r: 5, c: 6 }, e: { r: 5, c: 11 } },
      { s: { r: 6, c: 0 }, e: { r: 6, c: 5 } },
      { s: { r: 6, c: 6 }, e: { r: 6, c: 11 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 5 } },         // 报价单编号 A8:F8
      { s: { r: 7, c: 6 }, e: { r: 7, c: 11 } },        // 报价日期 G8:L8
      { s: { r: totalRow, c: 0 }, e: { r: totalRow, c: 5 } },  // 总计 A:G合并
      { s: { r: r, c: 0 }, e: { r: r, c: 6 } },         // 需方签章 A:G
      { s: { r: r, c: 7 }, e: { r: r, c: 11 } },        // 供方签章 H:L
    ];
    // 明细表头到总计加边框
    ws["!merges"] = merges as any;

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