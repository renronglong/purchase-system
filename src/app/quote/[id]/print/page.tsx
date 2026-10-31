"use client";

import { useParams } from "next/navigation";
import ExcelJS from "exceljs";
import { quotationStore } from "@/lib/store";
import ExportPdfButton from "@/components/export-pdf-button";
import { PDF_SIZE } from "@/lib/export-pdf";

export default function QuotationPrintPage() {
  const params = useParams<{ id: string }>();
  const q = quotationStore.getById(params.id);

  if (!q) {
    return <div className="p-6 text-center text-slate-400 py-24">未找到此报价单</div>;
  }

  const handleExportExcel = async () => {
    const items = q.items;
    // 模板明细固定 15 行（A10:L24），超过则截断，不足补空
    const detailRows = 15;
    const shown = items.slice(0, detailRows);

    const wb = new ExcelJS.Workbook();
    wb.creator = q.supplierCompany || "报价单";
    wb.created = new Date();
    const ws = wb.addWorksheet("报价单", {
      views: [{ showGridLines: false }],
      pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
    });

    // 列宽（对照模板）
    const widths = [6.5, 15, 19, 24.125, 5.5, 10, 8, 12, 11, 12, 10, 13];
    widths.forEach((w, i) => (ws.getColumn(i + 1).width = w));

    // ============ 数据（1-based 行号，与模板 A1:L36 完全一致） ============
    // 标题区
    ws.getCell("A1").value = q.supplierCompany || "";
    ws.getCell("A2").value = "报 价 单";

    // 信息区（供需双方）
    ws.getCell("A4").value = "供方：" + (q.supplierCompany || "");
    ws.getCell("A5").value = "联系人：" + (q.supplierContact || "");
    ws.getCell("A6").value = "电话：" + (q.supplierPhone || "");
    ws.getCell("A7").value = "地址：" + (q.supplierAddress || "");
    ws.getCell("G4").value = "客户名称：" + (q.customerName || "");
    ws.getCell("G5").value = "联系人：" + (q.customerContact || "");
    ws.getCell("G6").value = "电话：" + (q.customerPhone || "");
    ws.getCell("G7").value = "地址：" + (q.customerAddress || "");
    ws.getCell("A8").value = "报价单编号：" + (q.quoteNo || "");
    ws.getCell("G8").value = "报价日期：" + (q.quoteDate || "");

    // 表头（第 9 行）
    const headers = ["序号", "产品编号", "规格尺寸mm", "产品名称", "单位", "材质", "表面处理", "单价未税(元)", "含税价", "最小起订量", "模具费RMB(元)", "备注"];
    headers.forEach((h, i) => (ws.getCell(9, i + 1).value = h));

    // 明细（10 ~ 24 行）
    for (let i = 0; i < detailRows; i++) {
      const it = shown[i];
      const r = 10 + i;
      const vals = it
        ? [i + 1, it.productCode || "", it.spec || "", it.productName || "", it.unit || "", it.material || "", it.surfaceTreatment || "", it.unitPrice ?? "", it.taxPrice ?? "", it.minOrderQty ?? "", it.moldFee ?? "", it.remark || ""]
        : [i + 1, "", "", "", "", "", "", "", "", "", "", ""];
      vals.forEach((v, c) => (ws.getCell(r, c + 1).value = v));
    }

    // 总计（25 行）
    ws.getCell("A25").value = "总计";
    ws.getCell("H25").value = q.grandTotal ?? "";

    // 条款（26 行起，每行一条）
    const terms = q.terms && q.terms.length ? q.terms : [
      "1：依照图纸进行开模及送样。",
      "2：此报价含运费",
      "3：付款方式：",
      "4：此报价单有效期为x天",
      "5：开模时间x个工作日，出样x个工作日",
    ];
    terms.forEach((t, i) => (ws.getCell(26 + i, 1).value = t));

    // 签章区（33 行 = 26 + terms.length -1 + 条款后空行）
    ws.getCell("A33").value = "需方（签章）";
    ws.getCell("H33").value = "供方（签章）";
    ws.getCell("A36").value = "日期：";
    ws.getCell("H36").value = "日期：";

    // ============ 合并单元格 ============
    ws.mergeCells("A1:L1");
    ws.mergeCells("A2:L2");
    ws.mergeCells("A4:F4"); ws.mergeCells("G4:L4");
    ws.mergeCells("A5:F5"); ws.mergeCells("G5:L5");
    ws.mergeCells("A6:F6"); ws.mergeCells("G6:L6");
    ws.mergeCells("A7:F7"); ws.mergeCells("G7:L7");
    ws.mergeCells("A8:F8"); ws.mergeCells("G8:L8");
    ws.mergeCells("A25:G25");
    terms.forEach((_, i) => ws.mergeCells(`A${26 + i}:L${26 + i}`));
    ws.mergeCells("A33:G33"); ws.mergeCells("H33:L33");
    ws.mergeCells("H36:K36");

    // ============ 样式 ============
    const center = { horizontal: "center", vertical: "middle" } as const;
    const left = { horizontal: "left", vertical: "middle" } as const;
    const right = { horizontal: "right", vertical: "middle" } as const;
    const thinBorder = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" },
    } as const;

    // 标题
    ws.getCell("A1").font = { bold: true, size: 14, name: "宋体" } as any;
    ws.getCell("A1").alignment = center;
    ws.getCell("A2").font = { bold: true, size: 22, name: "宋体" } as any;
    ws.getCell("A2").alignment = center;
    ws.getRow(1).height = 26;
    ws.getRow(2).height = 34;

    // 信息区标签加粗
    for (let r = 4; r <= 8; r++) {
      (["A", "G"] as const).forEach((col) => {
        const c = ws.getCell(`${col}${r}`);
        c.font = { bold: false, size: 11, name: "宋体" } as any;
        c.alignment = left;
      });
    }

    // 表头样式：浅蓝底 + 加粗 + 边框 + 居中
    const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } } as any;
    for (let c = 1; c <= 12; c++) {
      const cell = ws.getCell(9, c);
      cell.font = { bold: true, size: 11, name: "宋体" } as any;
      cell.alignment = center;
      cell.border = thinBorder as any;
      cell.fill = headerFill;
    }

    // 明细 + 总计：边框 + 垂直居中
    const detailEndRow = 9 + detailRows + 1; // 明细到总计
    for (let r = 10; r <= detailEndRow; r++) {
      for (let c = 1; c <= 12; c++) {
        const cell = ws.getCell(r, c);
        cell.border = thinBorder as any;
        cell.alignment = c === 1 || c === 5 || c === 6 || c === 7 ? center : left;
        cell.font = { size: 10.5, name: "宋体" } as any;
      }
    }
    // 总计行加粗+靠右
    for (let c = 1; c <= 12; c++) {
      const cell = ws.getCell(detailEndRow, c);
      cell.font = { bold: true, size: 11, name: "宋体" } as any;
      cell.alignment = c === 8 ? right : left;
    }

    // 明细行高
    for (let r = 10; r <= 9 + detailRows; r++) ws.getRow(r).height = 22;

    // 条款 + 签章字体
    terms.forEach((_, i) => {
      const c = ws.getCell(26 + i, 1);
      c.font = { size: 11, name: "宋体" } as any;
      c.alignment = { horizontal: "left", vertical: "middle", wrapText: true } as any;
    });
    const signFont = { bold: true, size: 13, name: "宋体" } as any;
    ws.getCell("A33").font = signFont;
    ws.getCell("H33").font = signFont;
    ws.getCell("A33").alignment = center;
    ws.getCell("H33").alignment = center;
    ws.getCell("A36").font = { size: 10, name: "宋体" } as any;
    ws.getCell("H36").font = { size: 10, name: "宋体" } as any;

    // ============ 导出 ============
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${q.quoteNo || "报价单"}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="max-w-[980px] mx-auto flex justify-end gap-2 mb-4 no-print">
        <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700">导出Excel</button>
        <ExportPdfButton
          size={PDF_SIZE.a4Portrait}
          filename={`报价单_${q.quoteNo || ""}`}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-60"
        />
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