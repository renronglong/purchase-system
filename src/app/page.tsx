"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { purchaseOrderStore, type PurchaseOrder } from "@/lib/store";

export default function PurchaseOrderListPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchProduct, setSearchProduct] = useState("");

  const loadOrders = useCallback(() => {
    const all = purchaseOrderStore.getAll();
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    setOrders(all);
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (searchSupplier && !order.supplierName.toLowerCase().includes(searchSupplier.toLowerCase())) return false;
    if (searchDate && !order.orderDate.includes(searchDate)) return false;
    if (searchProduct && !order.items.some(item => item.productCode.toLowerCase().includes(searchProduct.toLowerCase()))) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此采购单吗？")) {
      purchaseOrderStore.remove(id);
      loadOrders();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">采购单管理</h1>
        <Link
          href="/purchase/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新建采购单
        </Link>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">供应商</label>
            <input
              type="text"
              value={searchSupplier}
              onChange={(e) => setSearchSupplier(e.target.value)}
              placeholder="搜索供应商名称"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs text-slate-500 mb-1">日期</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">产品编号</label>
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="搜索产品编号"
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">订单编号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">制单日期</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">采购公司</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">供应商</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">明细数</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总数量</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">总重量(KG)</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  暂无采购单数据
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono text-blue-600">{order.orderNo}</td>
                  <td className="px-4 py-2.5 text-slate-600">{order.orderDate}</td>
                  <td className="px-4 py-2.5 text-slate-600">{order.company}</td>
                  <td className="px-4 py-2.5 text-slate-600">{order.supplierName}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{order.items.length}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{order.totalQuantity}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{order.totalWeight.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/purchase/${order.id}/detail`}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/purchase/${order.id}`}
                        className="text-amber-600 hover:text-amber-800 text-xs"
                      >
                        编辑
                      </Link>
                      <Link
                        href={`/print/purchase/${order.id}`}
                        target="_blank"
                        className="text-emerald-600 hover:text-emerald-800 text-xs"
                      >
                        打印
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {filteredOrders.length} 条记录
      </div>
    </div>
  );
}
