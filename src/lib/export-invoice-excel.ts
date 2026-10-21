import * as XLSX from "xlsx";

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



/** 按「项目信息导入」模板(税务局最新)格式导出发票项目：基于模板文件填充数据行，保证格式与模板完全一致 */
export async function exportProjectTemplate(notes: DeliveryNote[]) {
  if (notes.length === 0) {
    alert("请先勾选要导出的送货单");
    return;
  }
  const res = await fetch("/templates/invoice-project-import.xlsx");
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellStyles: true });
  // 定位「项目名称」所在行作为表头行，其后即为数据起始行
  const ws = wb.Sheets["项目信息导入"] || wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  let headerRow = -1;
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
    if (cell && String(cell.v).includes("项目名称")) { headerRow = r; break; }
  }
  if (headerRow < 0) headerRow = range.s.r + 2; // 兜底：默认第 3 行（表头）
  const startDataRow = headerRow + 1;
  const rows = notes.flatMap((note) =>
    note.items.map((item: DeliveryItem) => ({
      项目名称: item.productName || "",
      项目分类: "",
      "商品和服务税收分类编码": "",
      规格型号: item.spec || "",
      单位: item.unit || "",
      单价: Math.round((item.unitPrice || 0) * 100) / 100,
      是否含税: "Y",
      简码: "",
      税率: "",
      是否使用优惠政策: "",
      优惠政策类型: "",
    }))
  );
  XLSX.utils.sheet_add_json(ws, rows, { origin: { r: startDataRow, c: 0 }, skipHeader: true });
  const fileName = notes.length === 1 ? `发票项目导入_${notes[0].customer}.xlsx` : "发票项目导入.xlsx";
  XLSX.writeFile(wb, fileName);
}
