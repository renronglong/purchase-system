"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { contractSeedData, type ContractData } from "@/lib/contract-seed-data";

// 数字转中文大写金额
function numberToChinese(num: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿'];

  if (num === 0) return '零元整';

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  const jiao = Math.floor(decPart / 10);
  const fen = decPart % 10;

  let result = '';
  const str = intPart.toString();
  const len = str.length;

  for (let i = 0; i < len; i++) {
    const d = parseInt(str[i]);
    const pos = len - 1 - i;
    const unitIdx = pos % 4;
    const bigIdx = Math.floor(pos / 4);

    if (d === 0) {
      if (unitIdx === 0 && bigUnits[bigIdx]) {
        result += bigUnits[bigIdx];
      } else if (result && !result.endsWith('零')) {
        result += '零';
      }
    } else {
      result += digits[d] + units[unitIdx];
      if (unitIdx === 0 && bigUnits[bigIdx]) {
        result += bigUnits[bigIdx];
      }
    }
  }

  result = result.replace(/零+$/, '').replace(/零{2,}/g, '零');
  result += '元';

  if (jiao === 0 && fen === 0) {
    result += '整';
  } else {
    if (jiao > 0) result += digits[jiao] + '角';
    if (fen > 0) result += digits[fen] + '分';
  }

  return result;
}


export default function ContractPrintPage() {
  const params = useParams();
  const contractId = params.id as string;
  const [contract, setContract] = useState<ContractData | null>(null);

  const loadContract = useCallback(() => {
    // 优先从 localStorage 读取编辑后的版本
    try {
      const localRaw = localStorage.getItem("contracts_local");
      if (localRaw) {
        const localContracts: ContractData[] = JSON.parse(localRaw);
        const localFound = localContracts.find(c => c.id === contractId);
        if (localFound) { setContract(fixSupplierInfo(localFound)); return; }
      }
    } catch { /* ignore */ }
    // 回退到种子数据
    const found = contractSeedData.find(c => c.id === contractId);
    if (found) setContract(fixSupplierInfo(found));
  }, [contractId]);

  useEffect(() => {
    loadContract();
  }, [loadContract]);

  // 设置文档标题为 客户名_合同编号（导出PDF时作为默认文件名）
  useEffect(() => {
    if (contract) {
      document.title = `${contract.customerName}_${contract.contractNo}`;
    }
  }, [contract]);

  // 页面加载后自动弹出打印
  useEffect(() => {
    if (contract) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [contract]);

  // 导出PDF：确保标题已设置后调起打印对话框（选"另存为PDF"即自动命名）
  const handleExportPDF = useCallback(() => {
    if (contract) {
      document.title = `${contract.customerName}_${contract.contractNo}`;
    }
    setTimeout(() => window.print(), 50);
  }, [contract]);

  if (!contract) {
    return <div className="p-6 text-center text-slate-400">未找到合同</div>;
  }

  const totalAmount = contract.items.reduce((sum, item) => sum + item.amount, 0);
  const totalQuantity = contract.items.reduce((sum, item) => sum + item.quantity, 0);
  const chineseAmount = numberToChinese(totalAmount);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4 landscape;
          margin: 0;
        }
        @media print {
          html, body {
            width: 297mm;
            height: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 297mm;
            height: 210mm;
            padding: 6mm 10mm;
            box-sizing: border-box;
          }
          .no-print {
            display: none !important;
          }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 {
            display: none !important;
          }
        }
        @media screen {
          body {
            background: #e2e8f0;
          }
          aside, nav, [class*="sidebar"], .w-60, .bg-slate-900 {
            display: none !important;
          }
        }
      `}} />

      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <button onClick={handleExportPDF} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">导出PDF / 打印</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 - A4横向 297mm x 210mm */}
      <div id="print-area" style={{
        width: "297mm",
        height: "210mm",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        padding: "6mm 10mm",
        fontFamily: "SimSun, serif",
        fontSize: "14px",
        lineHeight: "1.5",
      }}>
        {/* 牌头 + 标题（碧利莱） */}
        <div style={{ textAlign: "center", marginBottom: "3mm", flexShrink: 0 }}>
          <div style={{ fontSize: "20px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "1mm" }}>{contract.supplierName}</div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, letterSpacing: "6px" }}>购 销 合 同</h1>
        </div>

        {/* 合同编号、签订地点、签订时间 */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "3mm", flexShrink: 0 }}>
          <span>合同编号：{contract.contractNo}</span>
          <span>签订地点：{contract.signPlace}</span>
          <span>签订时间：{contract.signDate}</span>
        </div>

        {/* 甲乙方信息 */}
        <div style={{ fontSize: "13px", marginBottom: "2mm", flexShrink: 0 }}>
          <div style={{ marginBottom: "0.5mm" }}>需方（简称甲方）：{contract.customerName}</div>
          <div style={{ marginBottom: "1.5mm" }}>供方（简称乙方）：{contract.supplierName}</div>
          <div style={{ textIndent: "2em", fontSize: "13px" }}>
            为确保甲乙双方利益得到保护和责任得到履行，依据《中华人民共和国合同法》规定之内
          </div>
          <div style={{ textIndent: "2em", fontSize: "13px", marginBottom: "1.5mm" }}>
            容，甲乙双方经友好协商，就甲方向乙方购买产品达成如下协议：
          </div>
        </div>

        {/* 第一条 产品内容 */}
        <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "1mm", flexShrink: 0 }}>第一条 产品内容</div>

        {/* 产品表格 */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "2mm", flexShrink: 0, tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "5%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "15%" }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>序号</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>产品编号</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>名称</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>规格型号mm</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>颜色</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>数量</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>单位</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>单价</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>金额RMB元</th>
              <th style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {contract.items.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center" }}>{idx + 1}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center" }}>{item.code}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px" }}>{item.name}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center" }}>{item.spec}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center" }}>{item.surface}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "right" }}>{item.quantity}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center" }}>{item.unit}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "right" }}>{item.unitPrice}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "right" }}>{item.amount.toFixed(2)}</td>
                <td style={{ border: "1px solid #333", padding: "2px 3px" }}>{item.remark}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "center", fontWeight: "bold" }}>
                合计：{chineseAmount}（含税）
              </td>
              <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "right", fontWeight: "bold" }}>{totalQuantity}</td>
              <td style={{ border: "1px solid #333" }}></td>
              <td style={{ border: "1px solid #333" }}></td>
              <td style={{ border: "1px solid #333", padding: "2px 3px", textAlign: "right", fontWeight: "bold" }}>{totalAmount.toFixed(2)}</td>
              <td style={{ border: "1px solid #333" }}></td>
            </tr>
          </tfoot>
        </table>

        {/* 合同条款区域 - 横向空间充裕，用两列布局 */}
        <div style={{ display: "flex", gap: "6mm", fontSize: "13px", flexShrink: 0, marginBottom: "2mm" }}>
          {/* 左列条款 */}
          <div style={{ flex: "1" }}>
            <div style={{ marginBottom: "1.5mm" }}>
              <span style={{ fontWeight: "bold" }}>第二条 付款方式：</span>{contract.paymentTerms}
            </div>
            <div style={{ marginBottom: "1.5mm" }}>
              <div style={{ fontWeight: "bold", marginBottom: "0.5mm" }}>第三条 交货时间、地点、方式</div>
              <div>1.交货时间：{contract.deliveryDays}交货</div>
              <div>2.交货地点：{contract.deliveryPlace}</div>
              <div>3.货运方式：{contract.deliveryMethod}</div>
            </div>
            <div style={{ marginBottom: "1.5mm" }}>
              <span style={{ fontWeight: "bold" }}>第五条 合同变更：</span>未尽事宜，双方协商解决；合同的变更及修改经双方同意，以书面形式变更。
            </div>
          </div>
          {/* 右列条款 */}
          <div style={{ flex: "1" }}>
            <div style={{ marginBottom: "1.5mm" }}>
              <span style={{ fontWeight: "bold" }}>4.质量保证：</span>乙方需向甲方提供图纸和样品确认后再生产，如产品出现质量问题，甲方在自收货之日起，七个工作日内通知到乙方，乙方将在工作时间24小时内作出答复。
            </div>
            <div style={{ marginBottom: "1.5mm" }}>
              <span style={{ fontWeight: "bold" }}>第六条 争议解决方式：</span>双方如发生争议，应协商解决；如协商不成，向所辖人民法院提出诉讼。
            </div>
            <div style={{ marginBottom: "1.5mm" }}>
              <span style={{ fontWeight: "bold" }}>第七条 合同的生效及终止：</span>合同自双方签字并盖章后生效，双方权利义务履行完毕后合同终止。
            </div>
            <div>
              第八条 此合同一式两份，双方各执一份，具有同等法律效力。
            </div>
          </div>
        </div>

        {/* 签字盖章区 - 带印章位 */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", flexShrink: 0, marginTop: "auto" }}>
          {/* 左侧 需方（甲方） */}
          <div style={{ width: "42%", position: "relative" }}>
            <div style={{ lineHeight: "1.8" }}>
              <div style={{ fontWeight: "bold", marginBottom: "1mm" }}>需方（甲方）：</div>
              <div>公司名称：{contract.customerName}</div>
              <div>地址：{contract.customerAddress}</div>
              <div>联系人：{contract.customerContact}</div>
              <div>电话：{contract.customerPhone}</div>
              <div style={{ marginTop: "2mm" }}>日期：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</div>
            </div>
          </div>
          {/* 右侧 供方（乙方） */}
          <div style={{ width: "42%", position: "relative" }}>
            <div style={{ lineHeight: "1.8" }}>
              <div style={{ fontWeight: "bold", marginBottom: "1mm" }}>供方（乙方）：</div>
              <div>公司名称：{contract.supplierName}</div>
              <div>地址：{contract.supplierAddress}</div>
              <div>联系人：{contract.supplierContact}</div>
              <div>电话：{contract.supplierPhone}</div>
              <div>传真：{contract.supplierFax}</div>
              <div>纳税人识别号：{contract.supplierTaxNo}</div>
              <div style={{ marginTop: "2mm" }}>日期：{contract.signDate.slice(0,4)}年{contract.signDate.slice(5,7)}月{contract.signDate.slice(8,10)}日</div>
            </div>
            {/* 乙方印章 */}
            <img src="/seal-bililai.png" alt="" style={{
              position: "absolute",
              right: "12mm",
              bottom: "0mm",
              width: "38mm",
              height: "38mm",
              transform: "rotate(-8deg)",
              opacity: 0.9,
              pointerEvents: "none",
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
