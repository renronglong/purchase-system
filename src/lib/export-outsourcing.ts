import * as XLSX from "xlsx";

function amountToChinese(n: number): string {
  if (n === 0) return "零元整";
  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿"];
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;
  let result = "";
  let str = intPart.toString();
  let zeroFlag = false;
  for (let i = 0; i < str.length; i++) {
    const len = str.length - i;
    if (str[i] !== "0") {
      if (zeroFlag) { result += "零"; zeroFlag = false; }
      result += digits[parseInt(str[i])] + units[(len - 1) % 4];
      if ((len - 1) % 4 === 0 && len > 1) {
        result += bigUnits[Math.floor((len - 1) / 4)];
      }
    } else {
      zeroFlag = true;
    }
  }
  result += "元";
  if (jiao === 0 && fen === 0) {
    result += "整";
  } else {
    if (jiao > 0) result += digits[jiao] + "角";
    if (fen > 0) result += digits[fen] + "分";
  }
  return result;
}

interface OutsourcingItem {
  id: string;
  productCode: string;
  productName: string;
  spec: string;
  quantity: number;
  unit: string;
  length: number;
  process: string;
  weight: number;
  unitPrice: number;
  remark: string;
}

interface OutsourcingOrder {
  id: string;
  orderNo: string;
  company: string;
  supplierId: string;
  supplierName: string;
  contact: string;
  phone: string;
  address: string;
  orderDate: string;
  items: OutsourcingItem[];
  totalQuantity: number;
  totalWeight: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export function exportOutsourcingExcel(orders: OutsourcingOrder[]) {
  if (orders.length === 0) {
    alert("没有可导出的委外加工单");
    return;
  }

  const rows: (string | number)[][] = [];

  for (const order of orders) {
    rows.push(["委外加工单"]);
    rows.push(["供应商名称", order.supplierName, "联系人", order.contact]);
    rows.push(["NO.", order.orderNo, "送货日期", order.orderDate]);
    rows.push(["地址", order.address]);
    rows.push(["订单号", "", "付款方式", ""]);
    rows.push([]);
    rows.push(["序号", "产品编号", "名称", "型号规格mm", "颜色", "数量", "单位", "单价", "金额", "备注"]);

    let sum = 0;
    order.items.forEach((item, idx) => {
      const amount = Math.round(item.weight * item.unitPrice * 100) / 100;
      sum += amount;
      rows.push([
        idx + 1,
        item.productCode,
        item.productName,
        item.spec,
        "",
        item.quantity,
        item.unit,
        item.unitPrice,
        amount,
        item.remark || "",
      ]);
    });

    rows.push([]);
    rows.push(["合计人民币（大写）", amountToChinese(order.totalPrice || sum), "", "金额（小写）", (order.totalPrice || sum).toFixed(2)]);
    rows.push([]);
    rows.push(["地址", order.address, "电话", order.phone]);
    rows.push(["传真", "", "制单", "", "客户签收", ""]);
    rows.push([]);
    rows.push([]);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 16 }, { wch: 22 }, { wch: 16 }, { wch: 10 },
    { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "委外加工单");

  const fileName = orders.length === 1
    ? `委外加工单_${orders[0].orderNo}_${orders[0].supplierName}.xlsx`
    : "委外加工单_全部.xlsx";
  XLSX.writeFile(wb, fileName);
}
