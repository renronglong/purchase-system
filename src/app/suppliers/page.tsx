"use client";

import { useState, useEffect, useCallback } from "react";
import { supplierStore, type Supplier } from "@/lib/store";

function createEmptySupplier(): Omit<Supplier, "id"> {
  return { name: "", contact: "", phone: "", address: "" };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<Supplier, "id">>(createEmptySupplier());

  const loadSuppliers = useCallback(() => {
    setSuppliers(supplierStore.getAll());
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setFormData(createEmptySupplier());
    setIsAdding(true);
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({ name: supplier.name, contact: supplier.contact, phone: supplier.phone, address: supplier.address });
    setEditingSupplier(supplier);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!formData.name) {
      alert("请填写供应商名称");
      return;
    }
    if (isAdding) {
      supplierStore.add(formData);
    } else if (editingSupplier) {
      supplierStore.update(editingSupplier.id, formData);
    }
    setIsAdding(false);
    setEditingSupplier(null);
    loadSuppliers();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此供应商吗？")) {
      supplierStore.remove(id);
      loadSuppliers();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingSupplier(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">供应商管理</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          新增供应商
        </button>
      </div>

      {/* 搜索 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索供应商名称、联系人..."
          className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {/* 新增/编辑表单 */}
      {(isAdding || editingSupplier) && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{isAdding ? "新增供应商" : "编辑供应商"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">供应商名称 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">联系人</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">手机/电话</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">供应商名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">联系人</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">手机/电话</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">地址</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">暂无供应商数据</td>
              </tr>
            ) : (
              filtered.map((supplier) => (
                <tr key={supplier.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2 font-medium">{supplier.name}</td>
                  <td className="px-4 py-2">{supplier.contact}</td>
                  <td className="px-4 py-2 font-mono">{supplier.phone}</td>
                  <td className="px-4 py-2">{supplier.address}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleEdit(supplier)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                      <button onClick={() => handleDelete(supplier.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        共 {filtered.length} 条供应商记录
      </div>
    </div>
  );
}
