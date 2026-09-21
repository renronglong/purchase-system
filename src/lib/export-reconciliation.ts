import * as XLSX from "xlsx";

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

export function exportReconciliationExcel(orders: ReconciliationOrder[]) {
  if (orders.length === 0) {
    alert("没有可导出的对帐单");
    return;
  }

  const rows: (string | number)[][] = [];

  for (const order of orders) {
    rows.push([`对帐单号：${order.orderNo}`]);
    rows.push([`客户：${order.customer}`]);
    rows.push([`对帐期间：${order.startDate} 至 ${order.endDate}`]);
    rows.push([`状态：${order.status}`]);
    rows.push([]);

    rows.push(["送货单号", "日期", "物料编号", "产品名称", "规格", "表面处理", "单位", "数量", "单价", "金额"]);

    let totalAmount = 0;
    for (const item of order.items) {
      rows.push([
        item.deliveryNoteNo,
        item.deliveryDate,
        item.materialCode,
        item.productName,
        item.spec,
        item.surface,
        item.unit,
        item.qty,
        item.unitPrice,
        item.amount,
      ]);
      totalAmount += item.amount;
    }

    rows.push(["", "", "", "", "", "", "", "", "合计:", totalAmount.toFixed(2)]);
    rows.push([]);
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 20 }, { wch: 16 },
    { wch: 10 }, { wch: 6 }, { wch: 8 }, { wch: 10 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "对帐单");

  const fileName = orders.length === 1
    ? `对帐单_${orders[0].orderNo}_${orders[0].customer}.xlsx`
    : "对帐单_全部.xlsx";
  XLSX.writeFile(wb, fileName);
}
