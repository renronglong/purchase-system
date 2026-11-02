"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { deliveryCompanyStore, type DeliveryCompany } from "@/lib/store";

function createEmpty(): Omit<DeliveryCompany, "id"> {
  return { name: "", address: "", contact: "", phone: "" };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DeliveryCompany | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<DeliveryCompany>({ id: "", ...createEmpty() });
  const sealInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => setCompanies(deliveryCompanyStore.getAll()), []);
  useEffect(() => { load(); }, [load]);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contact.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => { setFormData({ id: "", ...createEmpty() }); setIsAdding(true); setEditing(null); };
  const handleEdit = (c: DeliveryCompany) => { setFormData({ ...c }); setEditing(c); setIsAdding(false); };
  const handleCancel = () => { setIsAdding(false); setEditing(null); };

  // 上传公司印章（图片转 dataURL 存在公司记录里，合同打印时自动盖章）
  const handleSealPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("请选择图片文件"); return; }
    if (file.size > 600 * 1024) { alert("图片太大，请压缩到 600KB 以内（建议透明背景 PNG，尺寸 400×400 左右）"); return; }
    const reader = new FileReader();
    reader.onload = () => setFormData((p) => ({ ...p, seal: String(reader.result || "") }));
    reader.onerror = () => alert("图片读取失败，请重试");
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!formData.name) { alert("请填写公司名称"); return; }
    if (isAdding) {
      const { id: _id, ...rest } = formData;
      deliveryCompanyStore.add(rest);
    } else if (editing) {
      deliveryCompanyStore.update(editing.id, formData);
    }
    setIsAdding(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除此公司吗？删除后送货单需重新选择公司。")) { deliveryCompanyStore.remove(id); load(); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">公司信息管理</h1>
        <button onClick={handleAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          新增公司
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索公司名称、联系人..." className="w-full max-w-md px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>

      {(isAdding || editing) && (
        <div className="bg-white rounded-lg border border-blue-200 p-5 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">{isAdding ? "新增公司" : "编辑公司"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><label className="block text-xs text-slate-500 mb-1">公司名称 <span className="text-red-500">*</span></label>
              <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">联系人</label>
              <input type="text" value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
            <div><label className="block text-xs text-slate-500 mb-1">联系电话</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
            <div className="col-span-2"><label className="block text-xs text-slate-500 mb-1">公司地址</label>
              <input type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" /></div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs text-slate-500 mb-1">公司印章（可选）</label>
              <div className="flex flex-wrap items-center gap-3">
                <input ref={sealInputRef} type="file" accept="image/*" onChange={handleSealPick} className="hidden" />
                <button
                  type="button"
                  onClick={() => sealInputRef.current?.click()}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50"
                >
                  {formData.seal ? "更换印章" : "上传印章"}
                </button>
                {formData.seal ? (
                  <>
                    <img src={formData.seal} alt="印章" className="h-14 w-14 rounded border border-slate-200 bg-white object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, seal: "" }))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      移除
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">未上传时，购销合同上不显示印章</span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">建议用透明背景 PNG，400×400 左右，小于 600KB</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">保存</button>
            <button onClick={handleCancel} className="px-4 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">公司名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">联系人</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">电话</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">地址</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">印章</th>
              <th className="sticky right-0 z-10 bg-slate-50 text-center px-4 py-2.5 font-medium text-slate-600 shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400">暂无公司数据</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2">{c.contact}</td>
                <td className="px-4 py-2 font-mono">{c.phone}</td>
                <td className="px-4 py-2">{c.address}</td>
                <td className="px-4 py-2 text-center">
                  {c.seal ? (
                    <img src={c.seal} alt="印章" className="mx-auto h-8 w-8 rounded border border-slate-200 bg-white object-contain" />
                  ) : (
                    <span className="text-xs text-slate-300">未上传</span>
                  )}
                </td>
                <td className="sticky right-0 z-10 bg-white px-4 py-2.5 text-center shadow-[-6px_0_8px_-6px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(c)} className="text-amber-600 hover:text-amber-800 text-xs">编辑</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">共 {filtered.length} 条公司记录</div>
    </div>
  );
}