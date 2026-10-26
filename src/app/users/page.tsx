"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authStore, type AppUser } from "@/lib/auth-store";

export default function UsersManagePage() {
  const router = useRouter();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  const load = useCallback(() => {
    setUsers(authStore.getAllUsers());
    setCurrentUser(authStore.getCurrentUser());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (u: AppUser) => {
    const tip = u.id === currentUser?.id ? "（这是当前登录的账号）" : "";
    if (!confirm(`确定要删除账号「${u.displayName || u.username}」${tip}吗？\n\n此操作将永久删除该账号及其全部业务数据（产品库、采购单、合同、送货单等），且不可恢复！`)) {
      return;
    }
    if (u.id === currentUser?.id) {
      if (!confirm("你正在删除当前登录的账号，删除后将被登出。确定继续？")) return;
    }
    const res = authStore.deleteUser(u.id);
    if (!res.success) { alert(res.error || "删除失败"); return; }
    if (u.id === currentUser?.id) {
      authStore.logout();
      router.push("/login");
      return;
    }
    alert("已删除该账号及其全部数据");
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">用户管理</h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md p-3 mb-4">
        此功能可删除其他账号及其全部业务数据（产品库、采购单、合同、送货单、对账单等），操作不可恢复，请谨慎使用。
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">登录名</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">显示名称</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">公司</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">注册时间</th>
              <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-slate-400">暂无账号</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-2 font-medium">
                  {u.username}
                  {u.id === currentUser?.id ? <span className="ml-1 text-xs text-blue-500">（当前）</span> : ""}
                </td>
                <td className="px-4 py-2">{u.displayName}</td>
                <td className="px-4 py-2">{u.company}</td>
                <td className="px-4 py-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(u)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">共 {users.length} 个账号</div>
    </div>
  );
}
