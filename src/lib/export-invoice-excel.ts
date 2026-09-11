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
