"use client";

import { useState, useEffect, useCallback } from "react";
import { productStore, type Product } from "@/lib/store";

function createEmptyProduct(): Product {
  return { id: "", name: "", spec: "", weightPerMeter: 0, material: "6063-T5", defaultSupplier: "" };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Product>(createEmptyProduct());

  const loadProducts = useCallback(() => {
    setProducts(productStore.getAll());
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = products.filter(p =>
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.spec.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setFormData(createEmptyProduct());
    setIsAdding(true);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({ id: product.id, name: product.name, spec: product.spec, weightPerMeter: product.weightPerMeter, material: product.material, defaultSupplier: product.defaultSupplier });
    setEditingProduct(product);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name || !formData.id) {
      alert("请填写产品编号和名称");
      return;
    }
    if (isAdding) {
      const { id: _id, ...rest } = formData;
      productStore.add(rest);
    } else if (editingProduct) {
      productStore.update(editingProduct.id, formData);
    }
    setIsAdding(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此产品吗？")) {
      productStore.remove(id);
      loadProducts();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">产品库管理</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新增产品
        </button>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索产品编号、名称、规格..."
          className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* 新增/编辑表单 */}
      {(isAdding || editingProduct) && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{isAdding ? "新增产品" : "编辑产品"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">产品编号</label>
              <input
                type="text"
                value={isAdding ? formData.id : editingProduct?.id || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                disabled={!isAdding}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">产品名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">规格尺寸</label>
              <input
                type="text"
                value={formData.spec}
                onChange={(e) => setFormData(prev => ({ ...prev, spec: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">米重(KG/m)</label>
              <input
                type="number"
                step="0.001"
                value={formData.weightPerMeter || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, weightPerMeter: Number(e.target.value) }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">材质</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">默认供应商</label>
              <input
                type="text"
                value={formData.defaultSupplier}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultSupplier: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            <button onClick={handleCancel} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">产品编号</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">产品名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">规格尺寸</th>
              <th className="text-right px-4 py-2.5 font-medium text-slate-600">米重(KG/m)</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">材质</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">默认供应商</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">暂无产品数据</td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-mono text-blue-600">{product.id}</td>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.spec}</td>
                  <td className="px-4 py-2 text-right font-mono">{product.weightPerMeter.toFixed(3)}</td>
                  <td className="px-4 py-2">{product.material}</td>
                  <td className="px-4 py-2">{product.defaultSupplier}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(product)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {filtered.length} 条产品记录
      </div>
    </div>
  );
}
