"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const IMPORT_DATA = [
  {"date":"2026-04-17","customer":"接上次财务离职帐单","type":"income","amount":40240.39,"remark":""},
  {"date":"2026-04-24","customer":"付易金兰","type":"expense","amount":20000.00,"remark":""},
  {"date":"2026-04-30","customer":"百川慧通","type":"income","amount":20624.00,"remark":"付鑫晨"},
  {"date":"2026-04-30","customer":"百川慧通发票","type":"expense","amount":1649.92,"remark":"未开"},
  {"date":"2026-04-30","customer":"镭科照明","type":"income","amount":9000.00,"remark":""},
  {"date":"2026-04-30","customer":"科照明发票","type":"expense","amount":1050.00,"remark":""},
  {"date":"2026-05-05","customer":"付易金兰","type":"expense","amount":30000.00,"remark":""},
  {"date":"2026-05-08","customer":"弘美","type":"income","amount":18375.00,"remark":""},
  {"date":"2026-05-13","customer":"弘美发票","type":"expense","amount":1837.50,"remark":""},
  {"date":"2026-05-13","customer":"镭科照明发票","type":"expense","amount":502.40,"remark":""},
  {"date":"2026-05-13","customer":"深华港湾发票","type":"expense","amount":202.00,"remark":""},
  {"date":"2026-05-15","customer":"深华港湾","type":"income","amount":1000.00,"remark":""},
  {"date":"2026-05-20","customer":"镭科照明","type":"income","amount":6524.00,"remark":""},
  {"date":"2026-07-28","customer":"深华港湾发票","type":"expense","amount":250.00,"remark":"补"},
  {"date":"2026-05-22","customer":"弘美","type":"income","amount":16205.00,"remark":""},
  {"date":"2026-05-22","customer":"弘美发票","type":"expense","amount":1620.50,"remark":""},
  {"date":"2026-05-29","customer":"深华港湾","type":"income","amount":2020.00,"remark":""},
  {"date":"2026-06-04","customer":"智测电子","type":"income","amount":4875.00,"remark":""},
  {"date":"2026-06-05","customer":"付易金兰","type":"expense","amount":10000.00,"remark":""},
  {"date":"2026-06-13","customer":"付龙飞翔支付宝","type":"expense","amount":10000.00,"remark":""},
  {"date":"2026-06-17","customer":"付龙飞翔支付宝","type":"expense","amount":10000.00,"remark":""},
  {"date":"2026-05-22","customer":"弘美","type":"income","amount":22750.00,"remark":""},
  {"date":"2026-05-29","customer":"弘美","type":"income","amount":17342.50,"remark":""},
  {"date":"2026-06-25","customer":"弘美发票","type":"expense","amount":2275.00,"remark":""},
  {"date":"2026-06-25","customer":"弘美发票","type":"expense","amount":1734.25,"remark":""},
  {"date":"2026-06-25","customer":"智测电子发票","type":"expense","amount":975.00,"remark":""},
  {"date":"2026-06-26","customer":"联康发票","type":"expense","amount":1398.84,"remark":""},
  {"date":"2026-07-31","customer":"深华港湾","type":"income","amount":32152.98,"remark":""},
  {"date":"2026-07-31","customer":"付质稳货款","type":"expense","amount":22674.00,"remark":"含税"},
  {"date":"2026-07-31","customer":"联康货款","type":"income","amount":13988.40,"remark":""},
  {"date":"2026-06-24","customer":"深华港湾发票","type":"expense","amount":947.90,"remark":""},
  {"date":"2026-07-10","customer":"yl-876付质稳货款","type":"expense","amount":800.00,"remark":""},
  {"date":"2026-07-27","customer":"镭科照明发票","type":"expense","amount":780.00,"remark":""},
  {"date":"2026-07-30","customer":"付易金兰","type":"expense","amount":10000.00,"remark":""},
  {"date":"2026-06-27","customer":"付易金兰","type":"expense","amount":11909.00,"remark":""},
  {"date":"2026-06-24","customer":"代付中联货款","type":"expense","amount":14800.00,"remark":""},
  {"date":"2026-06-27","customer":"中联税点","type":"expense","amount":1184.00,"remark":""}
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function ImportPage() {
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const uid = localStorage.getItem("app_current_user");
    setUserId(uid);
    if (!uid) {
      setStatus("请先登录");
    }
  }, []);

  const handleImport = () => {
    if (!userId) {
      setStatus("错误：请先登录");
      return;
    }

    const prefix = `u_${userId}_`;
    const key = prefix + "customer_accounts";
    
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    const newRecords = IMPORT_DATA.map(r => ({
      ...r,
      id: generateId(),
      createdAt: new Date().toISOString()
    }));

    const combined = [...existing, ...newRecords];
    localStorage.setItem(key, JSON.stringify(combined));
    
    setStatus(`✅ 成功导入 ${newRecords.length} 条记录！`);
  };

  const handleClear = () => {
    if (!userId) return;
    if (confirm("确定要清空所有往来记录吗？")) {
      const key = `u_${userId}_customer_accounts`;
      localStorage.removeItem(key);
      setStatus("已清空所有往来记录");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-6">导入原始往来记录</h1>
      
      <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-2xl">
        <div className="mb-4 text-sm text-slate-600">
          当前用户 ID: <span className="font-mono text-xs">{userId || '未登录'}</span>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">将导入以下 {IMPORT_DATA.length} 条数据：</p>
          <ul className="text-xs text-slate-500 space-y-1 max-h-48 overflow-y-auto border border-slate-100 rounded p-2">
            {IMPORT_DATA.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span>{r.date} {r.customer}</span>
                <span className={r.type === 'income' ? 'text-emerald-600' : 'text-red-600'}>
                  {r.type === 'income' ? '+' : '-'}{r.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {status && (
          <div className={`p-3 rounded-md mb-4 text-sm ${status.includes('成功') || status.includes('✅') ? 'bg-emerald-50 text-emerald-700' : status.includes('清空') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
            {status}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            导入数据
          </button>
          <button onClick={handleClear} className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700">
            清空数据
          </button>
          <button onClick={() => router.push('/customer-account')} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm rounded-md hover:bg-slate-300">
            返回往来记录
          </button>
        </div>
      </div>
    </div>
  );
}
