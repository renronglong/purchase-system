"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { purchaseOrderStore, type PurchaseOrder } from "@/lib/store";

const BORDER_COLOR = "#2563eb";
const BORDER_COLOR_PLATE = "#ea580c";
const FIXED_ROWS = 6;
const ROW_HEIGHT = "8mm";
const CONTENT_WIDTH = "190mm";

export default function PrintPurchasePage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);

  const loadOrder = useCallback(() => {
    const found = purchaseOrderStore.getById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) {
    return <div className="p-6 text-center text-slate-400">加载中...</div>;
  }

  const isPlate = (order.orderType || "profile") === "plate";
  const bc = isPlate ? BORDER_COLOR_PLATE : BORDER_COLOR;

  // 生成固定6行数据，不足的用空行填充
  const tableRows = Array.from({ length: FIXED_ROWS }, (_, idx) => {
    if (idx < order.items.length) {
      return { ...order.items[idx], isEmpty: false };
    }
    return {
      id: `empty-${idx}`,
      productCode: "",
      productName: "",
      spec: "",
      length: 0,
      quantity: 0,
      unit: "",
      totalWeight: 0,
      surfaceTreatment: "",
      deliveryDate: "",
      remark: "",
      material: "",
      sheetsCount: 0,
      piecesPerSheet: 0,
      actualOutput: 0,
      bladeCount: 0,
      isEmpty: true,
    } as any;
  });

  // 根据公司名称自动匹配地址
  const getCompanyAddress = (companyName: string) => {
    if (companyName.includes("质稳")) {
      return "广东省佛山市南海区狮山招大小坑尾坑尾园";
    } else if (companyName.includes("碧利莱")) {
      return "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层";
    }
    return "";
  };

  const companyAddress = getCompanyAddress(order.company || "");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: 241mm 140mm;
          margin: 0;
        }
        @media print {
          html, body {
            width: 241mm;
            height: 140mm;
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
            width: 241mm;
            height: 140mm;
            padding: 3mm;
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
        <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 shadow-lg">打印 / 导出PDF</button>
        <button onClick={() => window.close()} className="px-4 py-2 bg-slate-500 text-white text-sm rounded-md hover:bg-slate-600 shadow-lg">关闭</button>
      </div>

      {/* 打印区域 */}
      <div id="print-area" className="mx-auto bg-white" style={{ width: "241mm", height: "140mm", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box", padding: "3mm" }}>
        {/* 内层容器 */}
        <div style={{ width: CONTENT_WIDTH, height: "134mm", display: "flex", flexDirection: "column", justifyContent: "flex-start", boxSizing: "border-box", marginLeft: "2mm" }}>
          {/* 标题区域 */}
          <div className="flex items-center justify-center" style={{ height: "10mm", flexShrink: 0, marginBottom: "5mm" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: 0, letterSpacing: "2px" }}>
              {order.company || "佛山市质稳五金有限公司"}采购单
              {isPlate && <span style={{ fontSize: "14px", color: bc, marginLeft: "8px" }}>（板材）</span>}
            </h1>
          </div>

          {/* 表头信息区域 */}
          <div style={{ fontSize: "15px", lineHeight: "1.3", padding: "0 2mm", flexShrink: 0, height: "20mm", boxSizing: "border-box", overflow: "visible", marginBottom: "0" }}>
            <div className="flex" style={{ alignItems: "stretch" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">供应商：</span>{order.supplierName}</div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">联系人：</span>{order.contact}</div>
                <div style={{ whiteSpace: "nowrap", overflow: "visible" }}><span className="font-bold">地址：</span>{order.address || ""}</div>
              </div>
              <div style={{ width: "45%", display: "flex", flexDirection: "column", justifyContent: "space-between", paddingLeft: "5mm" }}>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">编号：</span><span className="font-mono font-bold" style={{ fontSize: "15px" }}>{order.orderNo}</span></div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">电话：</span>{order.phone}</div>
                <div style={{ whiteSpace: "nowrap" }}><span className="font-bold">制单日期：</span>{order.orderDate}</div>
              </div>
            </div>
          </div>

          {/* 型材明细表格 */}
          {!isPlate && (
            <table className="w-full border-collapse" style={{ fontSize: "14px", tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
              <colgroup>
                <col style={{ width: "6mm" }} />
                <col style={{ width: "26mm" }} />
                <col style={{ width: "22mm" }} />
                <col style={{ width: "24mm" }} />
                <col style={{ width: "11mm" }} />
                <col style={{ width: "9mm" }} />
                <col style={{ width: "8mm" }} />
                <col style={{ width: "20mm" }} />
                <col style={{ width: "18mm" }} />
                <col style={{ width: "22mm" }} />
                <col style={{ width: "24mm" }} />
              </colgroup>
              <thead>
                <tr style={{ height: "5mm", borderTop: "none" }}>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>序号</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>产品编号</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>产品名称</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>规格</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>长度mm</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>数量</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>单位</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>理论重量KG</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>表面处理</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>交货时间</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>备注</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: "14px" }}>{item.isEmpty ? "" : idx + 1}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: "14px", fontWeight: "bold" }}>{item.productCode}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.productName}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.spec}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : item.length}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : item.quantity}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.unit}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px", fontFamily: "monospace" }}>{item.isEmpty ? "" : item.totalWeight.toFixed(2)}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.surfaceTreatment}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.deliveryDate}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.remark}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ height: "6mm" }}>
                  <td colSpan={5} style={{ border: `1px solid ${bc}`, padding: "0 2mm", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold", textAlign: "right" }}>合计</td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold" }}>{order.totalQuantity}</td>
                  <td style={{ border: `1px solid ${bc}` }}></td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold", fontFamily: "monospace" }}>{order.totalWeight.toFixed(2)}</td>
                  <td colSpan={4} style={{ border: `1px solid ${bc}` }}></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 板材明细表格 */}
          {isPlate && (
            <table className="w-full border-collapse" style={{ fontSize: "14px", tableLayout: "fixed", flexShrink: 0, border: "none", marginTop: "0.5mm" }}>
              <colgroup>
                <col style={{ width: "6mm" }} />
                <col style={{ width: "28mm" }} />
                <col style={{ width: "22mm" }} />
                <col style={{ width: "26mm" }} />
                <col style={{ width: "16mm" }} />
                <col style={{ width: "16mm" }} />
                <col style={{ width: "16mm" }} />
                <col style={{ width: "12mm" }} />
                <col style={{ width: "38mm" }} />
              </colgroup>
              <thead>
                <tr style={{ height: "5mm", borderTop: "none" }}>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>序号</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>产品编号</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>材质</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>规格</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>订单数量(张)</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>每张出材</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>实际出材</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>刀数</th>
                  <th style={{ border: `1px solid ${bc}`, fontWeight: "bold", textAlign: "center", verticalAlign: "middle", fontSize: "13px", whiteSpace: "nowrap" }}>备注</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((item: any, idx: number) => (
                  <tr key={item.id} style={{ height: ROW_HEIGHT }}>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "center", verticalAlign: "middle", padding: "1px 0", fontSize: "14px" }}>{item.isEmpty ? "" : idx + 1}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontFamily: "monospace", whiteSpace: "nowrap", overflow: "visible", fontSize: "14px", fontWeight: "bold" }}>{item.productCode}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.material || ""}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.spec}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : (item.sheetsCount || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : (item.piecesPerSheet || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : (item.actualOutput || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px" }}>{item.isEmpty ? "" : (item.bladeCount || "")}</td>
                    <td style={{ border: `1px solid ${bc}`, padding: "0 1px", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", fontSize: "14px" }}>{item.remark}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ height: "6mm" }}>
                  <td colSpan={4} style={{ border: `1px solid ${bc}`, padding: "0 2mm", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold", textAlign: "right" }}>合计</td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold" }}>{order.totalSheets ?? 0}</td>
                  <td style={{ border: `1px solid ${bc}` }}></td>
                  <td style={{ border: `1px solid ${bc}`, textAlign: "right", padding: "0 1px", verticalAlign: "middle", fontSize: "14px", fontWeight: "bold" }}>{order.totalActualOutput ?? 0}</td>
                  <td colSpan={2} style={{ border: `1px solid ${bc}` }}></td>
                </tr>
              </tfoot>
            </table>
          )}

          {/* 底部区域 */}
          <div style={{ fontSize: "13px", padding: "1mm 2mm", flexShrink: 0, height: "14mm", boxSizing: "border-box", overflow: "visible" }}>
            <div style={{ marginBottom: "0.5mm", fontSize: "13px" }}>
              公司地址：{companyAddress}
            </div>
            <div className="flex justify-between" style={{ fontSize: "13px", paddingTop: "0.5mm" }}>
              <span><span className="font-bold">制单人：</span>{order.maker || "易金兰"}</span>
              <span>
                <span className="font-bold">供应商回签：</span>
                <span style={{ display: "inline-block", width: "20mm" }}></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
