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


const TAX_UNITS = ["分","角","元","千元","万元","亿元","两","斤","毫克","克","千克(公斤)","吨","千吨","万吨","磅","毫米","厘米","分米","米","千米（公里）","万米","码","英尺","平方毫米","平方厘米","平方分米","平方米","平方公里","公顷","亩","毫升(立方厘米)","公升(立方分米)","立方米（方）","千立方米","万立方米","亿立方米","份","组","本","箱","卷","瓦（W）","千瓦","万瓦","千伏安时","千瓦时（度）","千千瓦时（千度）","万千瓦时","位（Bit）","字节（B）","千字节（KB）","兆字节（MB）","吉字节（GB）","太字节（TB）","皮字节（PB）","个","支","只","把","条","台","架","辆","头","件","双","套","打","包","批","匹","部","座","艘","张","枝","根","块","卷","副","片","瓶","标准箱","万支","盒","桶","枚","次","项","株（棵）","户","点","袋","档","朵","顶","罐","回路","间","捆","例","令","箩","对","门","面","付","盘","具","圈","扇","束","刷","卡","听","筒","粒","串","盏","合","轴","尊","节","万双","板","版","盆","亿支","台（套）","万台","万块","万部","床","羽","克拉","盎司","秒","分钟","小时","日","月","季","年","分贝"];

/** 按「项目信息导入」模板格式导出发票项目（列与模板 11 列一致，另附单位 sheet） */
export function exportProjectTemplate(notes: DeliveryNote[]) {
  if (notes.length === 0) {
    alert("请先勾选要导出的送货单");
    return;
  }
  const headers = [
    "项目名称", "项目分类", "商品和服务税收分类编码", "规格型号", "单位",
    "单价", "是否含税", "简码", "税率", "是否使用优惠政策", "优惠政策类型",
  ];
  const rows: (string | number)[][] = [];
  rows.push([
    "说明：\n1、“是否含税”标识（Y/N）：Y为含税，N为不含税；当前明细按不含税（N）导出，如需含税请在表格中改。\n2、数据来源于已勾选的送货单明细，项目名称为产品名称，规格型号/单位/单价取自明细。\n3、单价保留两位小数。",
  ]);
  rows.push(headers);
  for (const note of notes) {
    for (const item of note.items) {
      rows.push([
        item.productName || "",
        "",
        "",
        item.spec || "",
        item.unit || "",
        Math.round((item.unitPrice || 0) * 100) / 100,
        "N",
        "",
        "",
        "",
        "",
      ]);
    }
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 30 }, { wch: 12 }, { wch: 24 }, { wch: 20 }, { wch: 10 },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "项目信息导入");
  const wsUnits = XLSX.utils.aoa_to_sheet(TAX_UNITS.map(u => [u]));
  XLSX.utils.book_append_sheet(wb, wsUnits, "hiddenSheet1");
  const fileName = notes.length === 1 ? `发票项目导入_${notes[0].customer}.xlsx` : "发票项目导入.xlsx";
  XLSX.writeFile(wb, fileName);
}
