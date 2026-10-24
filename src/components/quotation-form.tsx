"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  quotationStore, productStore, deliveryCustomerStore, deliveryCompanyStore, previewQuotationNo,
  type Quotation, type QuotationItem,
} from "@/lib/store";
import { purchasingCompanies, surfaceTreatments } from "@/lib/seed-data";

const materialOptions = ["普通铝板", "5052", "6063", "1060", "3003"];

function generateItemId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function createEmptyItem(): QuotationItem {
  return {
    id: generateItemId(),
    productCode: "",
    spec: "",
    productName: "",
    unit: "",
    material: "",
    surfaceTreatment: "",
    unitPrice: 0,
    taxPrice: 0,
    minOrderQty: 0,
    moldFee: 0,
    remark: "",
  };
}

const defaultTerms = [
  "1：依照图纸进行开模及送样。",
  "2：此报价含运费",
  "3：付款方式：",
  "4：此报价单有效期为30天",
  "5：开模时间20个工作日，出样20个工作日",
];

const getCompanyAddress = (companyName: string) => {
  if (companyName.includes("质稳")) return "广东省佛山市南海区狮山招大小坑尾坑尾园";
  if (companyName.includes("碧利莱")) return "佛山市南海区狮山镇松岗办事处显纲村委会厦边村口首层";
  if (companyName.includes("碧利金属")) return "佛山市南海区狮山镇松岗显纲村";
  return "";
};

// 公司详细信息（来自 公司信息管理 deliveryCompanyStore）；未知公司返回空
export const getCompanyInfo = (companyName: string, companies: { name: string; contact?: string; phone?: string; address?: string }[]) => {
  const c = companies.find(x => x.name === companyName);
  return c ? { contact: c.contact || "", phone: c.phone || "", address: c.address || "" } : null;
};

export default function QuotationForm({ quotation }: { quotation?: Quotation }) {
  const router = useRouter();
  const editing = !!quotation;

  const [quoteDate, setQuoteDate] = useState(editing ? quotation.quoteDate : new Date().toISOString().slice(0, 10));
  const [supplierCompany, setSupplierCompany] = useState(editing ? quotation.supplierCompany : purchasingCompanies[0]);
  const [supplierContact, setSupplierContact] = useState(editing ? quotation.supplierContact : "");
  const [supplierPhone, setSupplierPhone] = useState(editing ? quotation.supplierPhone : "");
  const [supplierAddress, setSupplierAddress] = useState(editing ? quotation.supplierAddress : "");
  const [customerName, setCustomerName] = useState(editing ? quotation.customerName : "");
  const [customerContact, setCustomerContact] = useState(editing ? quotation.customerContact : "");
  const [customerPhone, setCustomerPhone] = useState(editing ? quotation.customerPhone : "");
  const [customerAddress, setCustomerAddress] = useState(editing ? quotation.customerAddress : "");
  const [items, setItems] = useState<QuotationItem[]>(editing ? quotation.items.map(i => ({ ...i })) : [createEmptyItem()]);
  const [terms, setTerms] = useState<string[]>(editing && quotation.terms.length > 0 ? [...quotation.terms] : [...defaultTerms]);

  const products = productStore.getAll();
  const customers = deliveryCustomerStore.getAll();
  const companies = deliveryCompanyStore.getAll();
  const supplierCompanyOptions = Array.from(new Set(companies.map(c => c.name)));

  const handleCustomerSelect = (name: string) => {
    setCustomerName(name);
    const c = customers.find(x => x.name === name);
    if (c) {
      setCustomerContact(c.contact || "");
      setCustomerPhone(c.phone || "");
      setCustomerAddress(c.address || "");
    }
  };

  const handleSupplierCompanyChange = (c: string) => {
    setSupplierCompany(c);
    const info = getCompanyInfo(c, companies);
    if (info) {
      setSupplierContact(info.contact);
      setSupplierPhone(info.phone);
      setSupplierAddress(info.address || getCompanyAddress(c));
    } else {
      // 公司库无此公司时，兜底用内置映射带出地址
      const addr = getCompanyAddress(c);
      if (addr) setSupplierAddress(addr);
    }
  };

  // 挂载时：若供方公司库有信息且当前字段为空，补全联系人/电话/地址
  useEffect(() => {
    const info = getCompanyInfo(supplierCompany, companies);
    if (info) {
      if (info.contact) setSupplierContact(info.contact);
      if (info.phone) setSupplierPhone(info.phone);
      if (info.address) {
        setSupplierAddress(info.address);
      } else {
        const addr = getCompanyAddress(supplierCompany);
        if (addr) setSupplierAddress(addr);
      }
    } else {
      const addr = getCompanyAddress(supplierCompany);
      if (addr && !supplierAddress) setSupplierAddress(addr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateItem = (index: number, field: keyof QuotationItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleProductSelect = (index: number, productCode: string) => {
    if (!productCode) return;
    const product = products.find(p => p.id === productCode);
    if (!product) return;
    setItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productCode: product.id,
        productName: product.name || "",
        spec: product.spec || "",
        material: product.material || "",
      };
      return next;
    });
  };

  const addRow = () => setItems(prev => [...prev, createEmptyItem()]);
  const removeRow = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.unitPrice) || 0), 0);
  const moldTotal = items.reduce((sum, it) => sum + (Number(it.moldFee) || 0), 0);

  const handleSave = () => {
    const validItems = items.filter(it => it.productName || it.productCode);
    if (!customerName) {
      alert("请填写客户名称");
      return;
    }
    if (editing) {
      quotationStore.update(quotation.id, {
        quoteDate, supplierCompany, supplierContact, supplierPhone, supplierAddress,
        customerName, customerContact, customerPhone, customerAddress,
        items: validItems, grandTotal, terms,
      });
    } else {
      quotationStore.add({
        quoteDate, supplierCompany, supplierContact, supplierPhone, supplierAddress,
        customerName, customerContact, customerPhone, customerAddress,
        items: validItems, grandTotal, terms,
      });
    }
    router.push("/quote");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">{editing ? "编辑报价单" : "新建报价单"}</h1>
        <div className="flex gap-2">
          <Link href="/quote" className="px-4 py-2 text-sm border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">返回列表</Link>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">保存报价单</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">报价单编号</label>
            <input type="text" value={editing ? quotation.quoteNo : previewQuotationNo()} readOnly disabled className="w-full px-3 py-1.5 text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-md" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">报价日期</label>
            <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
          </div>
        </div>
      </div>

      {/* 供方 / 客户 */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">供需双方信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-2">供方（报价单位）</h3>
            <div className="space-y-3">
              <select value={supplierCompany} onChange={(e) => handleSupplierCompanyChange(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md">
                {Array.from(new Set([...supplierCompanyOptions, ...purchasingCompanies])).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="联系人" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <input type="text" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} placeholder="电话" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <input type="text" value={supplierAddress} onChange={(e) => setSupplierAddress(e.target.value)} placeholder="地址（选择公司后自动带出）" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-medium text-slate-500 mb-2">客户</h3>
            <div className="space-y-3">
              <input list="customer-list" type="text" value={customerName} onChange={(e) => handleCustomerSelect(e.target.value)} placeholder="客户名称 *（下拉选择或直接输入）" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <datalist id="customer-list">
                {customers.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
              <span className="block text-xs text-slate-400 -mt-2">可下拉选已有客户，也可手动输入；手输时联系人/电话/地址需自行填写</span>
              <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} placeholder="联系人" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="电话" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
              <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} placeholder="地址" className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* 报价明细 */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">报价明细</h2>
          <button onClick={addRow} className="px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">+ 添加行</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-2 py-2 font-medium text-slate-600 w-10">序</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">产品编号</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">规格尺寸mm</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">产品名称</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">单位</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">材质</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">表面处理</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600">单价未税</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600">含税价</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600">最小起订量</th>
                <th className="text-right px-2 py-2 font-medium text-slate-600">模具费(元)</th>
                <th className="text-left px-2 py-2 font-medium text-slate-600">备注</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 text-slate-500">{idx + 1}</td>
                  <td className="px-2 py-1.5">
                    <input list="product-list" value={it.productCode} onChange={(e) => { updateItem(idx, "productCode", e.target.value); handleProductSelect(idx, e.target.value); }} placeholder="编号" className="w-28 px-2 py-1 text-sm border border-slate-200 rounded-md" />
                  </td>
                  <td className="px-2 py-1.5"><input value={it.spec} onChange={(e) => updateItem(idx, "spec", e.target.value)} className="w-28 px-2 py-1 text-sm border border-slate-200 rounded-md" /></td>
                  <td className="px-2 py-1.5"><input value={it.productName} onChange={(e) => updateItem(idx, "productName", e.target.value)} className="w-32 px-2 py-1 text-sm border border-slate-200 rounded-md" /></td>
                  <td className="px-2 py-1.5"><input value={it.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} className="w-12 px-2 py-1 text-sm border border-slate-200 rounded-md" /></td>
                  <td className="px-2 py-1.5">
                    <input list="material-options" value={it.material} onChange={(e) => updateItem(idx, "material", e.target.value)} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md" />
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={it.surfaceTreatment} onChange={(e) => updateItem(idx, "surfaceTreatment", e.target.value)} className="w-24 px-2 py-1 text-sm border border-slate-200 rounded-md">
                      <option value="">请选择</option>
                      {surfaceTreatments.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5"><input type="number" step="0.01" value={it.unitPrice || ""} onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value))} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md text-right" /></td>
                  <td className="px-2 py-1.5"><input type="number" step="0.01" value={it.taxPrice || ""} onChange={(e) => updateItem(idx, "taxPrice", Number(e.target.value))} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md text-right" /></td>
                  <td className="px-2 py-1.5"><input type="number" value={it.minOrderQty || ""} onChange={(e) => updateItem(idx, "minOrderQty", Number(e.target.value))} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md text-right" /></td>
                  <td className="px-2 py-1.5"><input type="number" step="0.1" value={it.moldFee || ""} onChange={(e) => updateItem(idx, "moldFee", Number(e.target.value))} className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md text-right" /></td>
                  <td className="px-2 py-1.5"><input value={it.remark} onChange={(e) => updateItem(idx, "remark", e.target.value)} className="w-24 px-2 py-1 text-sm border border-slate-200 rounded-md" /></td>
                  <td className="px-2 py-1.5">
                    {items.length > 1 && (
                      <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <datalist id="product-list">
          {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.spec}</option>)}
        </datalist>
        <datalist id="material-options">
          {materialOptions.map(m => <option key={m} value={m} />)}
        </datalist>
        <div className="flex justify-end gap-8 mt-3 text-sm">
          <span className="text-slate-600">单价合计：<span className="font-semibold text-slate-900">¥{grandTotal.toFixed(2)}</span></span>
          <span className="text-slate-600">模具费合计：<span className="font-semibold text-slate-900">¥{moldTotal.toFixed(2)}</span></span>
        </div>
      </div>

      {/* 条款备注 */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">备注条款</h2>
        {terms.map((t, idx) => (
          <input key={idx} type="text" value={t} onChange={(e) => setTerms(prev => prev.map((x, i) => i === idx ? e.target.value : x))} className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md mb-2" />
        ))}
        <button onClick={() => setTerms(prev => [...prev, ""])} className="px-3 py-1 text-xs text-slate-500 border border-slate-200 rounded hover:bg-slate-50">+ 添加条款</button>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">保存报价单</button>
        <Link href="/quote" className="px-6 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">取消</Link>
      </div>
    </div>
  );
}