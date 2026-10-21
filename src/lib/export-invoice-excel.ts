import * as XLSX from "xlsx";
import JSZip from "jszip";

interface DeliveryItem {
  id: string;
  materialCode: string;
  productName: string;
  spec: string;
  unit: string;
  qty: number;
  surface: string;
  unitPrice: number;
  amount: number;
  remark: string;
}

interface DeliveryNote {
  id: string;
  noteNo: string;
  date: string;
  customer: string;
  orderNo: string;
  items: DeliveryItem[];
  reconciled: string;
  company: string;
  maker?: string;
}

interface DeliveryCustomer {
  id: string;
  name: string;
  address: string;
  contact: string;
  phone: string;
  taxNo: string;
  legalPerson: string;
  email: string;
  paymentTerms: string;
}

export function exportInvoiceExcel(
  notes: DeliveryNote[],
  customers: DeliveryCustomer[],
) {
  const grouped = new Map<string, DeliveryNote[]>();
  for (const note of notes) {
    const list = grouped.get(note.customer) || [];
    list.push(note);
    grouped.set(note.customer, list);
  }

  if (grouped.size === 0) {
    alert("没有可导出的数据");
    return;
  }

  const customerMap = new Map<string, DeliveryCustomer>();
  for (const c of customers) {
    customerMap.set(c.name, c);
  }

  const rows: (string | number)[][] = [];

  for (const [custName, custNotes] of grouped) {
    const cust = customerMap.get(custName);

    rows.push([custName]);
    rows.push(["开票明细"]);
    rows.push([]);
    rows.push([`单位名称：${cust?.name || custName}`]);
    rows.push([`纳税识别号：${cust?.taxNo || ""}`]);
    const addrPhone = `${cust?.address || ""}${cust?.phone ? "，" + cust.phone : ""}`;
    rows.push([`公司地址，电话：${addrPhone}`]);
    rows.push([`开户行，帐号：`]);
    rows.push([]);

    rows.push(["税收名称", "名称", "规格型号", "单位", "数量", "单价", "金额", "备注"]);

    let totalAmount = 0;

    for (const note of custNotes) {
      for (const item of note.items) {
        const remark = note.orderNo || "";
        rows.push([
          "*金属制品*",
          item.productName,
          item.spec,
          item.unit,
          item.qty,
          item.unitPrice,
          item.amount,
          item.remark || remark,
        ]);
        totalAmount += item.amount;
      }
    }

    rows.push(["", "", "", "", "", "", `合计: ${totalAmount.toFixed(2)}`, ""]);
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 14 }, { wch: 24 }, { wch: 22 }, { wch: 6 },
    { wch: 8 }, { wch: 10 }, { wch: 14 }, { wch: 24 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "开票明细");

  const isSingle = grouped.size === 1;
  const firstKey = grouped.keys().next().value;
  const fileName = isSingle
    ? `开票明细_${firstKey}.xlsx`
    : "开票明细_全部客户.xlsx";
  XLSX.writeFile(wb, fileName);
}

/* ===== 下面是「项目信息导入」模板导出（基于模板原文件插入数据行，保留全部模板结构） ===== */

function xmlEsc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 构造一个单元格 XML。kind=num 写数字 v；kind=text 写内联字符串 */
function xmlCell(row: number, col: string, kind: "num" | "text", v: string): string {
  const ref = `${col}${row}`;
  if (kind === "num") {
    return `<c r="${ref}"><v>${v}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEsc(v)}</t></is></c>`;
}

/**
 * 按「项目信息导入」模板(电子税务局最新)导出发票项目。
 * 采用 JSZip 直接在模板 xlsx(zip) 的 sheet1.xml 中插入数据行，
 * 模板自带的数据验证下拉、隐藏sheet、样式、属性全部原样保留，避免被税务局判定为"模板已更新"。
 * 表头在第 3 行(A3:K3)，数据从第 4 行开始。
 */
export async function exportProjectTemplate(notes: DeliveryNote[]) {
  if (notes.length === 0) {
    alert("请先勾选要导出的送货单");
    return;
  }
  const res = await fetch("/templates/invoice-project-import.xlsx");
  if (!res.ok) {
    alert("模板加载失败，请稍后重试或刷新页面");
    return;
  }
  const buf = await res.arrayBuffer();
  const zip = await JSZip.loadAsync(buf);
  const sheetPath = "xl/worksheets/sheet1.xml";
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) {
    alert("模板结构异常，无法导出");
    return;
  }
  let xml = await sheetFile.async("string");
  if (!xml.includes("</sheetData>")) {
    alert("模板结构异常，无法导出");
    return;
  }

  // 删除模板第 1 行的说明文字(含其 A1:K1 合并单元格)，保持表头/数据行结构不变
  xml = xml.replace(/<row[^>]*\br="1"[^>]*>[\s\S]*?<\/row>/, "");
  xml = xml.replace(/<mergeCell ref="A1:K1"\s*\/>/gi, "");

  const startRow = 4; // 模板数据从第 4 行开始（第 3 行为表头）
  const rowXmls: string[] = [];
  notes.forEach((note) => {
    note.items.forEach((item, idx) => {
      const r = startRow + rowXmls.length;
      const cells =
        xmlCell(r, "A", "text", item.productName || "") + // 项目名称
        xmlCell(r, "B", "text", "") + // 项目分类
        xmlCell(r, "C", "text", "1080316010000000000") + // 商品和服务税收分类编码(铝型材)
        xmlCell(r, "D", "text", item.spec || "") + // 规格型号
        xmlCell(r, "E", "text", item.unit || "") + // 单位
        xmlCell(r, "F", "num", (Math.round((item.unitPrice || 0) * 100) / 100).toString()) + // 单价
        xmlCell(r, "G", "text", "Y") + // 是否含税
        xmlCell(r, "H", "text", "") + // 简码
        xmlCell(r, "I", "text", "") + // 税率
        xmlCell(r, "J", "text", "") + // 是否使用优惠政策
        xmlCell(r, "K", "text", ""); // 优惠政策类型
      rowXmls.push(`<row r="${r}">${cells}</row>`);
    });
  });

  xml = xml.replace("</sheetData>", rowXmls.join("") + "</sheetData>");
  zip.file(sheetPath, xml);

  const outBlob = await zip.generateAsync({ type: "blob" });
  const fileName =
    notes.length === 1
      ? `发票项目导入_${notes[0].customer}.xlsx`
      : "发票项目导入.xlsx";
  const url = URL.createObjectURL(outBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}