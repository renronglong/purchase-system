import ExcelJS from "exceljs";
import { deliveryCustomerStore, deliveryNoteStore } from "./store";

interface ReconciliationItem {
  id: string;
  deliveryNoteNo: string;
  deliveryDate: string;
  materialCode: string;
  productName: string;
  spec: string;
  surface: string;
  unit: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface ReconciliationOrder {
  id: string;
  orderNo: string;
  customer: string;
  startDate: string;
  endDate: string;
  status: string;
  remark: string;
  items: ReconciliationItem[];
  totalAmount: number;
  createdAt: string;
}

const WIDTHS = [9.25, 13.5, 15.125, 18.26, 14.25, 18.625, 48.5, 5.1, 6.63, 8.5, 11.375];

// 单份对账单按「质稳对账单」模板 A1:K55 生成
async function buildSheet(
  ws: ExcelJS.Worksheet,
  order: ReconciliationOrder,
  companyName: string,
) {
  // 列宽
  WIDTHS.forEach((w, i) => (ws.getColumn(i + 1).width = w));

  const customer = deliveryCustomerStore
    .getAll()
    .find((c) => c.name === order.customer);

  // 期间文案：2026年5-6月对账单
  const period = `${order.startDate} 至 ${order.endDate}`;

  // 顶部（1~5 行）
  ws.getCell("B1").value = order.customer;
  ws.getCell("B2").value = `地址：${customer?.address || ""}`;
  const phone = customer?.phone || "";
  const contact = customer?.contact || "";
  ws.getCell("B3").value = `联系电话：${phone}${contact ? `  联系人：${contact}` : ""}`;
  ws.getCell("C4").value = `${period}对账单`;
  ws.getCell("A5").value = `FROM:${companyName}`;

  const center = { vertical: "middle" } as const;
  const alignCenter = { horizontal: "center", vertical: "middle" } as const;
  const alignLeft = { horizontal: "left", vertical: "middle" } as const;

  // 标题合并
  ws.mergeCells("B1:J1");
  ws.mergeCells("B2:J2");
  ws.mergeCells("B3:J3");
  ws.mergeCells("C4:I4");
  ws.mergeCells("A5:E5");
  ws.mergeCells("H5:I5");

  // 表头（第 6 行）
  const headers = ["送货日期", "送货单编号", "采购单号/PO.", "退货单/PS.", "存货编码", "物料名称", "规格/型号", "单位", "数量", "含税单价", "含税金额"];
  headers.forEach((h, i) => (ws.getCell(6, i + 1).value = h));

  // 明细（7 ~ 31 行，固定 25 行）
  const items = (order.items || []).slice(0, 25);
  for (let i = 0; i < 25; i++) {
    const it = items[i];
    const r = 7 + i;
    const emptyRow = [
      "", "", "", "", "", "", "", "", "", "", "",
    ];
    const vals = it
      ? [
          it.deliveryDate || "",
          it.deliveryNoteNo || "",
          "", // 采购单号
          "", // 退货单
          it.materialCode || "",
          it.productName || "",
          it.spec || "",
          it.unit || "",
          it.qty ?? "",
          it.unitPrice ?? "",
          it.amount ?? "",
        ]
      : emptyRow;
    vals.forEach((v, c) => (ws.getCell(r, c + 1).value = v));
  }

  // 合计（第 32 行）
  ws.getCell("J32").value = "合计：";
  ws.getCell("K32").value = `=SUM(K7:K31)`;
  const totalAmount = order.totalAmount || order.items.reduce((s, i) => s + i.amount, 0);

  // 签章区（33 ~ 35 行）
  ws.getCell("A33").value = "购方名称（专用章）";
  ws.getCell("I33").value = "供方名称（财务章/公章）";
  ws.getCell("A34").value = "购方对账人：";
  ws.getCell("I34").value = "供方对账人：";
  ws.getCell("A35").value = "日期";
  ws.getCell("I35").value = "日期";

  // 对账金额表（36 ~ 39 行，A:D 列）
  ws.getCell("B36").value = "上期对账金额";
  ws.getCell("C36").value = "本期对账金额";
  ws.getCell("D36").value = "本期结余";
  ws.getCell("A37").value = "已开票金额";
  ws.getCell("A38").value = "未开票金额";
  ws.getCell("A39").value = "合计";
  // 本期结余 = 本期对账金额（默认）
  ws.getCell("D37").value = totalAmount;

  // ============ 样式 ============
  const thin = { style: "thin" } as const;
  const thinBorder = { top: thin, bottom: thin, left: thin, right: thin } as any;

  const song = "宋体";

  // 标题行样式与行高
  ws.getRow(1).height = 30;
  ws.getRow(2).height = 17;
  ws.getRow(3).height = 17;
  ws.getRow(4).height = 25;
  ws.getRow(5).height = 31;
  ws.getRow(6).height = 29;
  ws.getRow(7).height = 34;

  // B1 客户名
  const b1 = ws.getCell("B1");
  b1.font = { bold: true, size: 20, name: song } as any;
  b1.alignment = { horizontal: "center", vertical: "middle" } as any;

  // B2/B3 地址电话
  ws.getCell("B2").font = { size: 12, name: song } as any;
  ws.getCell("B2").alignment = alignCenter;
  ws.getCell("B3").font = { size: 12, name: song } as any;
  ws.getCell("B3").alignment = alignCenter;

  // C4 期间标题
  ws.getCell("C4").font = { bold: true, size: 18, name: song } as any;
  ws.getCell("C4").alignment = { horizontal: "center", vertical: "middle" } as any;

  // A5 FROM
  ws.getCell("A5").font = { size: 13, name: song } as any;
  ws.getCell("A5").alignment = alignLeft;

  // 表头（第6行）加粗居中 + 边框
  for (let c = 1; c <= 11; c++) {
    const cell = ws.getCell(6, c);
    cell.font = { bold: true, size: 12, name: song } as any;
    cell.alignment = c === 7 ? alignLeft : alignCenter;
    cell.border = thinBorder;
  }

  // 明细 7~31 + 合计32：边框、字号、对齐
  for (let r = 7; r <= 32; r++) {
    for (let c = 1; c <= 11; c++) {
      const cell = ws.getCell(r, c);
      cell.border = thinBorder;
      cell.font = { size: 11, name: song } as any;
      cell.alignment = (c === 7) ? alignLeft : alignCenter;
      ws.getRow(r).height = 22;
    }
  }
  // 合计行加粗
  for (let c = 1; c <= 11; c++) {
    ws.getCell(32, c).font = { bold: true, size: 12, name: song } as any;
  }

  // 签章区字体
  ws.getCell("A33").font = { bold: true, size: 13, name: song } as any;
  ws.getCell("I33").font = { bold: true, size: 13, name: song } as any;
  ws.getCell("A34").font = { size: 12, name: song } as any;
  ws.getCell("I34").font = { size: 12, name: song } as any;
  ws.getCell("A35").font = { size: 12, name: song } as any;
  ws.getCell("I35").font = { size: 12, name: song } as any;

  // 对账金额表（36~39）边框 + 文字
  for (let r = 36; r <= 39; r++) {
    for (let c = 1; c <= 4; c++) {
      const cell = ws.getCell(r, c);
      cell.border = thinBorder;
      cell.font = { size: 12, name: song } as any;
      cell.alignment = alignCenter;
    }
  }
}

export async function exportReconciliationExcel(orders: ReconciliationOrder[]) {
  if (orders.length === 0) {
    alert("没有可导出的对帐单");
    return;
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "质稳五金";

  // 公司名：从第一张送货单取 company，默认佛山市质稳五金有限公司
  let companyName = "佛山市质稳五金有限公司";
  try {
    const firstNoteNo = orders[0]?.items?.[0]?.deliveryNoteNo;
    const note = deliveryNoteStore
      .getAll()
      .find((n) => n.noteNo === firstNoteNo);
    if (note?.company) companyName = note.company;
  } catch {}

  for (const order of orders) {
    const ws = wb.addWorksheet(order.customer || "对帐单");
    await buildSheet(ws, order, companyName);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = orders.length === 1
    ? `对账单_${orders[0].orderNo}_${orders[0].customer}.xlsx`
    : "对账单_全部.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}