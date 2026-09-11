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
  customerFilter?: string,
) {
  // Group notes by customer
  const grouped = new Map<string, DeliveryNote[]>();
  for (const note of notes) {
    if (customerFilter && note.customer !== customerFilter) continue;
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

  // Build rows for single sheet
  const rows: (string | number)[][] = [];

  for (const [custName, custNotes] of grouped) {
    const cust = customerMap.get(custName);
    const shortName = cust?.name || custName;

    // Customer title
    rows.push([shortName]);
    rows.push(["开票明细"]);
    rows.push([]);
    rows.push([`单位名称：${cust?.name || custName}`]);
    rows.push([`纳税识别号：${cust?.taxNo || ""}`]);
    const addrPhone = `${cust?.address || ""}${cust?.phone ? "，" + cust.phone : ""}`;
    rows.push([`公司地址，电话：${addrPhone}`]);
    const bankAccount = `${cust ? (cust as any).bankName || "" : ""}${cust ? "，" + ((cust as any).bankAccount || "") : ""}`;
    rows.push([`开户行，帐号：${bankAccount}`]);
    rows.push([]);

    // Header
    rows.push(["税收名称", "名称", "规格型号", "单位", "数量", "单价", "金额", "备注"]);

    let totalAmount = 0;

    for (const note of custNotes) {
      for (const item of note.items) {
        const remark = note.noteNo + (note.date ? ` ${note.date}` : "");
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

    // Total row
    rows.push(["", "", "", "", "", "", `合计: ${totalAmount.toFixed(2)}`, ""]);
    rows.push([]); // blank line between customers
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws["!cols"] = [
    { wch: 14 }, // 税收名称
    { wch: 24 }, // 名称
    { wch: 22 }, // 规格型号
    { wch: 6 },  // 单位
    { wch: 8 },  // 数量
    { wch: 10 }, // 单价
    { wch: 14 }, // 金额
    { wch: 24 }, // 备注
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "开票明细");

  const fileName = customerFilter
    ? `开票明细_${customerFilter}.xlsx`
    : `开票明细_全部客户.xlsx`;
  XLSX.writeFile(wb, fileName);
}
