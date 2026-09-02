"use client";

import { useState, useEffect, useCallback } from "react";
import { contractSeedData, type ContractData, type ContractItem } from "@/lib/contract-seed-data";
import { deliveryCustomerStore, deliveryProductStore } from "@/lib/store";

function genItemId(): string { return Math.random().toString(36).slice(2, 10); }
function genContractId(): string { return "ct" + Date.now().toString(36); }

// 自动生成合同编号：BL + 年月日 + 序号
function genContractNo(existing: ContractData[]): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const prefix = `BL${y}${m}${d}`;
  // 找今天已有合同的最大序号
  let maxSeq = 0;
  for (const c of existing) {
    if (c.contractNo && c.contractNo.startsWith(prefix)) {
      const seq = parseInt(c.contractNo.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

// 碧利莱供方信息按最新开票资料自动纠正（覆盖旧的localStorage缓存）
function fixSupplierInfo<T extends { supplierName?: string; supplierAddress?: string; supplierPhone?: string; supplierTaxNo?: string }>(c: T): T {
  if (c.supplierName && c.supplierName.includes("碧利莱")) {
    return { ...c, supplierAddress: "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层之六", supplierPhone: "18929979760", supplierTaxNo: "91440605MACUYJRB5C" };
  }
  return c;
}

function emptyItem(): ContractItem {
  return { id: genItemId(), code: "", name: "", spec: "", surface: "", quantity: 0, unit: "条", unitPrice: 0, amount: 0, remark: "" };
}

// 默认供方信息（碧利莱）
const DEFAULT_SUPPLIER = {
  supplierName: "佛山市碧利莱照明有限公司",
  supplierAddress: "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层之六",
  supplierContact: "龙任荣",
  supplierPhone: "18929979760",
  supplierFax: "85609935",
  supplierTaxNo: "91440605MACUYJRB5C",
};

export default function ContractPage() {
  // 列表数据（合并种子数据 + 本地存储）
  const [contracts, setContracts] = useState<ContractData[]>([]);

  // 表单弹窗
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // 表单字段
  const [contractNo, setContractNo] = useState("");
  const [signDate, setSignDate] = useState(new Date().toISOString().slice(0, 10));
  const [signPlace, setSignPlace] = useState("佛山市南海区");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerTaxNo, setCustomerTaxNo] = useState("");
  const [supplierName, setSupplierName] = useState(DEFAULT_SUPPLIER.supplierName);
  const [supplierAddress, setSupplierAddress] = useState(DEFAULT_SUPPLIER.supplierAddress);
  const [supplierContact, setSupplierContact] = useState(DEFAULT_SUPPLIER.supplierContact);
  const [supplierPhone, setSupplierPhone] = useState(DEFAULT_SUPPLIER.supplierPhone);
  const [supplierFax, setSupplierFax] = useState(DEFAULT_SUPPLIER.supplierFax);
  const [supplierTaxNo, setSupplierTaxNo] = useState(DEFAULT_SUPPLIER.supplierTaxNo);
  const [items, setItems] = useState<ContractItem[]>([emptyItem()]);
  const [paymentTerms, setPaymentTerms] = useState("订金壹万元、余款到发货");
  const [deliveryDays, setDeliveryDays] = useState("15个工作日");
  const [deliveryPlace, setDeliveryPlace] = useState("甲方公司所在地");
  const [deliveryMethod, setDeliveryMethod] = useState("送货");
  const [remark, setRemark] = useState("");

  // 客户列表
  const customers = typeof window !== "undefined" ? deliveryCustomerStore.getAll() : [];
  const products = typeof window !== "undefined" ? deliveryProductStore.getAll() : [];

  const load = useCallback(() => {
    // 合并种子数据 + localStorage，local覆盖种子
    const localRaw = typeof window !== "undefined" ? localStorage.getItem("contracts_local") : null;
    const localContracts: ContractData[] = localRaw ? JSON.parse(localRaw) : [];
    const localIds = new Set(localContracts.map(c => c.id));
    // 种子数据中不在local里的
    const fromSeed = contractSeedData.filter(c => !localIds.has(c.id));
    const all = [...fromSeed, ...localContracts];
    all.sort((a, b) => b.signDate.localeCompare(a.signDate));
    setContracts(all.map(fixSupplierInfo));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalAmount = (c: ContractData) => c.items.reduce((sum, item) => sum + item.amount, 0);

  const resetForm = () => {
    setEditId(null);
    setContractNo(genContractNo(contracts));
    setSignDate(new Date().toISOString().slice(0, 10));
    setSignPlace("佛山市南海区");
    setCustomerName(""); setCustomerAddress(""); setCustomerContact(""); setCustomerPhone(""); setCustomerTaxNo("");
    setSupplierName(DEFAULT_SUPPLIER.supplierName);
    setSupplierAddress(DEFAULT_SUPPLIER.supplierAddress);
    setSupplierContact(DEFAULT_SUPPLIER.supplierContact);
    setSupplierPhone(DEFAULT_SUPPLIER.supplierPhone);
    setSupplierFax(DEFAULT_SUPPLIER.supplierFax);
    setSupplierTaxNo(DEFAULT_SUPPLIER.supplierTaxNo);
    setItems([emptyItem()]);
    setPaymentTerms("订金壹万元、余款到发货");
    setDeliveryDays("15个工作日");
    setDeliveryPlace("甲方公司所在地");
    setDeliveryMethod("送货");
    setRemark("");
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (c: ContractData) => {
    setEditId(c.id);
    setContractNo(c.contractNo);
    setSignDate(c.signDate);
    setSignPlace(c.signPlace);
    setCustomerName(c.customerName);
    setCustomerAddress(c.customerAddress);
    setCustomerContact(c.customerContact);
    setCustomerPhone(c.customerPhone);
    setCustomerTaxNo(c.customerTaxNo);
    setSupplierName(c.supplierName);
    setSupplierAddress(c.supplierAddress);
    setSupplierContact(c.supplierContact);
    setSupplierPhone(c.supplierPhone);
    setSupplierFax(c.supplierFax);
    setSupplierTaxNo(c.supplierTaxNo);
    setItems(c.items.length > 0 ? [...c.items] : [emptyItem()]);
    setPaymentTerms(c.paymentTerms);
    setDeliveryDays(c.deliveryDays);
    setDeliveryPlace(c.deliveryPlace);
    setDeliveryMethod(c.deliveryMethod);
    setRemark(c.remark);
    setShowForm(true);
  };

  const updateItem = (idx: number, field: keyof ContractItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      const item = { ...next[idx], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        item.amount = Math.round(item.quantity * item.unitPrice * 100) / 100;
      }
      next[idx] = item;
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (idx: number) => { if (items.length <= 1) return; setItems(prev => prev.filter((_, i) => i !== idx)); };

  const selectCustomer = (name: string) => {
    setCustomerName(name);
    const c = customers.find(c => c.name === name);
    if (c) {
      setCustomerAddress(c.address || "");
      setCustomerContact(c.contact || "");
      setCustomerPhone(c.phone || "");
      setCustomerTaxNo(c.taxNo || "");
    }
  };

  const selectProduct = (idx: number, keyword: string) => {
    const p = products.find(p =>
      (p.code && p.code.toLowerCase() === keyword.toLowerCase()) ||
      (p.name && p.name === keyword)
    );
    if (p) {
      setItems(prev => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          code: p.code || "",
          name: p.name || "",
          spec: p.spec || "",
          surface: p.surface || "",
          unit: p.unit || next[idx].unit,
          unitPrice: p.unitPrice || 0,
          amount: Math.round(next[idx].quantity * (p.unitPrice || 0) * 100) / 100,
        };
        return next;
      });
    }
  };

  const handleSave = () => {
    if (!customerName) { alert("请填写需方（客户）名称"); return; }
    if (items.some(i => !i.name)) { alert("请填写所有产品名称"); return; }

    const data: ContractData = {
      id: editId || genContractId(),
      contractNo,
      signDate, signPlace,
      customerName, customerAddress, customerContact, customerPhone, customerTaxNo,
      supplierName, supplierAddress, supplierContact, supplierPhone, supplierFax, supplierTaxNo,
      items,
      paymentTerms, deliveryDays, deliveryPlace, deliveryMethod, remark,
    };

    // 区分种子数据ID和本地创建
    if (editId) {
      // 更新：保存到 localStorage（覆盖种子数据）
      const localRaw = localStorage.getItem("contracts_local");
      const localContracts: ContractData[] = localRaw ? JSON.parse(localRaw) : [];
      // 如果是种子数据ID，也需要保存到local（合并逻辑会优先用local的）
      const idx = localContracts.findIndex(c => c.id === editId);
      if (idx >= 0) { localContracts[idx] = data; }
      else { localContracts.push(data); }
      localStorage.setItem("contracts_local", JSON.stringify(localContracts));
    } else {
      // 新建
      const localRaw = localStorage.getItem("contracts_local");
      const localContracts: ContractData[] = localRaw ? JSON.parse(localRaw) : [];
      localContracts.push(data);
      localStorage.setItem("contracts_local", JSON.stringify(localContracts));
    }

    setShowForm(false);
    resetForm();
    load();
  };

  const handleDelete = (id: string) => {
    if (!confirm("确定删除此合同？")) return;
    const localRaw = localStorage.getItem("contracts_local");
    const localContracts: ContractData[] = localRaw ? JSON.parse(localRaw) : [];
    const filtered = localContracts.filter(c => c.id !== id);
    localStorage.setItem("contracts_local", JSON.stringify(filtered));
    load();
  };

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmt = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">购销合同管理</h1>
        <button onClick={openCreate} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">新建合同</button>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">合同编号</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">需方（甲方）</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">签订日期</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">产品数</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">合同金额</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {contracts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">暂无合同数据</td></tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{c.contractNo}</td>
                  <td className="px-4 py-3">{c.customerName}</td>
                  <td className="px-4 py-3 text-slate-500">{c.signDate}</td>
                  <td className="px-4 py-3">{c.items.length} 项</td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    ¥{totalAmount(c).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded">编辑</button>
                      <a href={`/print/contract/${c.id}`} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 text-xs text-green-600 hover:bg-green-50 rounded">打印</a>
                      <button onClick={() => handleDelete(c.id)} className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 编辑/新建弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-center overflow-y-auto py-8">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-bold">{editId ? "编辑合同" : "新建合同"}</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>

            <div className="px-6 py-4 space-y-5">
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">合同基本信息</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">合同编号（自动生成）</label>
                    <input type="text" value={contractNo} readOnly className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md bg-slate-50 text-slate-600" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">签订日期</label>
                    <input type="date" value={signDate} onChange={e => setSignDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">签订地点</label>
                    <input type="text" value={signPlace} onChange={e => setSignPlace(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">备注</label>
                    <input type="text" value={remark} onChange={e => setRemark(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                </div>
              </div>

              {/* 需方信息 */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">需方（甲方/客户）</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">公司名称 <span className="text-red-500">*</span></label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} onBlur={() => { if (customerName) selectCustomer(customerName); }} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" placeholder="需方公司名称" list="contract-customer-list" />
                    <datalist id="contract-customer-list">{customers.map(c => <option key={c.id} value={c.name} />)}</datalist>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">联系人</label>
                    <input type="text" value={customerContact} onChange={e => setCustomerContact(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">电话</label>
                    <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">地址</label>
                    <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">税号</label>
                    <input type="text" value={customerTaxNo} onChange={e => setCustomerTaxNo(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                </div>
              </div>

              {/* 供方信息 */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">供方（乙方）</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">公司名称</label>
                    <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">联系人</label>
                    <input type="text" value={supplierContact} onChange={e => setSupplierContact(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">电话</label>
                    <input type="text" value={supplierPhone} onChange={e => setSupplierPhone(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">地址</label>
                    <input type="text" value={supplierAddress} onChange={e => setSupplierAddress(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">税号</label>
                    <input type="text" value={supplierTaxNo} onChange={e => setSupplierTaxNo(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">传真</label>
                    <input type="text" value={supplierFax} onChange={e => setSupplierFax(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                </div>
              </div>

              {/* 产品明细 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-700">产品明细</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">合计：{totalQty} 件 / ¥{totalAmt.toFixed(2)}</span>
                    <button onClick={addItem} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">+ 添加产品</button>
                  </div>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-md">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-8">#</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-20">产品编号</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-24">名称 *</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-28">规格型号</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-16">颜色</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-16">单位</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-20">数量</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-20">单价</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-20">金额</th>
                        <th className="px-2 py-2 text-left font-medium text-slate-600 w-20">备注</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-2 py-1 text-slate-400">{idx + 1}</td>
                          <td className="px-1 py-1"><input type="text" value={item.code} onChange={e => updateItem(idx, "code", e.target.value)} onBlur={() => { if (item.code) selectProduct(idx, item.code); }} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded" list="contract-product-list" placeholder="编号" /></td>
                          <td className="px-1 py-1"><input type="text" value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} onBlur={() => { if (item.name) selectProduct(idx, item.name); }} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded" list="contract-product-list" placeholder="名称" /></td>
                          <td className="px-1 py-1"><input type="text" value={item.spec} onChange={e => updateItem(idx, "spec", e.target.value)} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded" /></td>
                          <td className="px-1 py-1">
                            <select value={item.surface} onChange={e => updateItem(idx, "surface", e.target.value)} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded" list="surface-list">
                              <option value="">-</option>
                              <option value="喷涂">喷涂</option>
                              <option value="磨砂">磨砂</option>
                              <option value="阳极氧化">阳极氧化</option>
                              <option value="电泳">电泳</option>
                              <option value="木纹">木纹</option>
                              <option value="氟碳">氟碳</option>
                              <option value="拉丝">拉丝</option>
                              <option value="抛光">抛光</option>
                              <option value="喷砂">喷砂</option>
                              <option value="本色">本色</option>
                              <option value="黑色">黑色</option>
                              <option value="白色">白色</option>
                              <option value="灰色">灰色</option>
                            </select>
                            <input type="text" list="surface-custom" value={item.surface} onChange={e => updateItem(idx, "surface", e.target.value)} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded mt-0.5 hidden" placeholder="自定义颜色" />
                          </td>
                          <td className="px-1 py-1">
                            <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded">
                              <option value="条">条</option>
                              <option value="套">套</option>
                              <option value="个">个</option>
                              <option value="件">件</option>
                              <option value="kg">kg</option>
                            </select>
                          </td>
                          <td className="px-1 py-1"><input type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded text-right" /></td>
                          <td className="px-1 py-1"><input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, "unitPrice", Number(e.target.value))} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded text-right" /></td>
                          <td className="px-1 py-1 text-right font-mono text-slate-700">{item.amount.toFixed(2)}</td>
                          <td className="px-1 py-1"><input type="text" value={item.remark} onChange={e => updateItem(idx, "remark", e.target.value)} className="w-full px-1.5 py-1 text-xs border border-slate-200 rounded" /></td>
                          <td className="px-1 py-1"><button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-sm">&times;</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <datalist id="contract-product-list">
                    {products.map(p => (
                      <option key={p.id} value={p.code || p.name}>
                        {p.name} {p.spec} {p.surface}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 合同条款 */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">合同条款</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">付款方式</label>
                    <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">交货时间</label>
                    <input type="text" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} className="w-full px-3