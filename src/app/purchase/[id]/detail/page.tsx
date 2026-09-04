"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { purchaseOrderStore, type PurchaseOrder } from "@/lib/store";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<PurchaseOrder | null>(null);

  const loadOrder = useCallback(() => {
    const found = purchaseOrderStore.getById(orderId);
    if (found) setOrder(found);
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (!order) {
    return (
      <div className="p-6 text-center text-slate-400">
        采购单不存在或已被删除
      </div>
    );
  }

  const isPlate = (order.orderType || "profile") === "plate";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900">采购单详情</h1>
          {isPlate ? (
            <span className="px-2 py-0.5 text-sm bg-orange-100 text-orange-700 rounded">板材</span>
          ) : (
            <span className="px-2 py-0.5 text-sm bg-blue-100 text-blue-700 rounded">型材</span>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/" className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
            返回列表
          </Link>
          <Link
            href={`/purchase/${orderId}/edit`}
            className="px-4 py-2 text-sm bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            编辑
          </Link>
          <Link
            href={`/print/purchase/${orderId}`}
            target="_blank"
            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            打印
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><span className="text-slate-500">订单编号：</span><span className="font-mono font-medium">{order.orderNo}</span></div>
          <div><span className="text-slate-500">订单类型：</span>{isPlate ? "板材" : "型材"}</div>
          <div><span className="text-slate-500">制单日期：</span>{order.orderDate}</div>
          <div><span className="text-slate-500">采购公司：</span>{order.company}</div>
          <div><span className="text-slate-500">供应商：</span>{order.supplierName}</div>
          <div><span className="text-slate-500">联系人：</span>{order.contact}</div>
          <div><span className="text-slate-500">电话：</span>{order.phone}</div>
          <div className="col-span-2"><span className="text-slate-500">地址：</span>{order.address}</div>
        </div>
      </div>

      {/* 型材明细 */}
      {!isPlate && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-left font-medium text-slate-600">序号</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">产品编号</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">产品名称</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">规格尺寸</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">长度mm</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">数量</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">单位</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">理论重量KG</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">表面处理</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">交货时间</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">备注</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">{item.productCode}</td>
                  <td className="px-3 py-2">{item.productName}</td>
                  <td className="px-3 py-2">{item.spec}</td>
                  <td className="px-3 py-2 text-right">{item.length}</td>
                  <td className="px-3 py-2 text-right">{item.quantity}</td>
                  <td className="px-3 py-2">{item.unit}</td>
                  <td className="px-3 py-2 text-right font-mono">{item.totalWeight.toFixed(2)}</td>
                  <td className="px-3 py-2">{item.surfaceTreatment}</td>
                  <td className="px-3 py-2">{item.deliveryDate}</td>
                  <td className="px-3 py-2">{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300">
                <td colSpan={5} className="px-3 py-2 text-right font-medium">合计</td>
                <td className="px-3 py-2 text-right font-bold">{order.totalQuantity}</td>
                <td></td>
                <td className="px-3 py-2 text-right font-mono font-bold">{order.totalWeight.toFixed(2)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 板材明细 */}
      {isPlate && (
        <div className="bg-white rounded-lg border border-orange-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 border-b border-orange-200">
                <th className="px-3 py-2 text-left font-medium text-slate-600">序号</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">产品编号</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">产品名称</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">材质</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">规格</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">订单数量(张)</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">每张出材数</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">实际出材数</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">刀数</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">备注</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-slate-500">{index + 1}</td>
                  <td className="px-3 py-2 font-mono text-blue-600">{item.productCode}</td>
                  <td className="px-3 py-2">{item.productName}</td>
                  <td className="px-3 py-2">{item.material || "-"}</td>
                  <td className="px-3 py-2">{item.spec}</td>
                  <td className="px-3 py-2 text-right">{item.sheetsCount ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{item.piecesPerSheet ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{item.actualOutput ?? "-"}</td>
                  <td className="px-3 py-2 text-right">{item.bladeCount ?? "-"}</td>
                  <td className="px-3 py-2">{item.remark}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-orange-50 border-t-2 border-orange-300">
                <td colSpan={5} className="px-3 py-2 text-right font-medium">合计</td>
                <td className="px-3 py-2 text-right font-bold">{order.totalSheets ?? 0}</td>
                <td></td>
                <td className="px-3 py-2 text-right font-bold">{order.totalActualOutput ?? 0}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
